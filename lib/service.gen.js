const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const replace = require("replace-in-file");
const xml = require("xml2js");
const { capitalize, removeDir, replaceJavaFiles } = require("./utils");
const VERSION = require("./versions");

const xmlParser = new xml.Parser();
const xmlBuilder = new xml.Builder();

async function initService(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing core service...");

  const serviceTemplateDir = path.join(__dirname, `./components/service`);
  const serviceDir = path.join(projectDir, `${options.name}-service`);

  fse.copy(serviceTemplateDir, serviceDir, async (err) => {
    if (!err) {
      await renameAndReplace(serviceDir, options);
      await updatePom(serviceDir, options);
    }
  });
}

async function renameAndReplace(projectDir, options) {
  const {
    templatePath,
    templatePackage,
    templateName,
    servicePath,
    servicePackage,
    name: serviceName,
  } = options;

  const basePath = path.join("src", "main", "java");

  const templateDir = path.join(projectDir, basePath, templatePath);
  const serviceDir = path.join(projectDir, basePath, servicePath);

  const template = {
    package: templatePackage,
    classPrefix: `${capitalize(templateName)}ServiceApplication`,
  };

  const service = {
    package: servicePackage,
    classPrefix: `${capitalize(serviceName)}ServiceApplication`,
  };

  fse.copy(templateDir, serviceDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await removeDir(templateDir);

    const templateEntryFile = path.join(serviceDir, `${capitalize(templateName)}ServiceApplication.java`);
    const serviceEntryFile = path.join(serviceDir, `${capitalize(serviceName)}ServiceApplication.java`);

    fs.renameSync(templateEntryFile, serviceEntryFile);

    await replaceJavaFiles(`${serviceDir}/**/*.java`, template, service);
  });
}

async function replaceJava(javaFiles, template, service) {
  const templateMain = new RegExp(template.main, "g")

  const options = {
    from: [template.package, templateMain],
    to: [service.package, service.main],
    files: javaFiles,
  };

  await replace.replaceInFile(options, err => {
    if (err) {
      console.error(err);
    }
  });
}

async function updatePom(serviceDir, options) {
  const pomPath = path.join(serviceDir, "pom.xml");
  const { groupId, artifactId, name, desc } = options;

  await fs.readFile(pomPath, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    xmlParser.parseString(data, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      const { project } = result;
      const dependencies = project.dependencies[0].dependency;
      const plugins = project.build[0].plugins[0].plugin;
      const properties = project.properties[0];

      project.groupId = groupId;
      project.artifactId = artifactId;
      project.name = `${name}-service`;
      project.description = desc;

      addDependencies(dependencies, options);
      addPlugins(plugins, options);
      addProperties(properties, options);

      fse.outputFile(pomPath, xmlBuilder.buildObject(result), err => {
        if (err) {
          console.error(err);
        }
      })
    })
  })
}

function addDependencies(dependencies, options) {
  const { grpc, kafka, jpa, groupId, name } = options;

  if (jpa) {
    dependencies.push({
      groupId: "org.springframework.boot",
      artifactId: "spring-boot-starter-data-jpa",
    });
    dependencies.push({
      groupId: "org.flywaydb",
      artifactId: "flyway-core",
    });
    dependencies.push({
      groupId: "org.postgresql",
      artifactId: "postgresql",
      scope: "runtime",
    });
    dependencies.push({
      groupId: "com.querydsl",
      artifactId: "querydsl-apt",
      version: "${querydsl.version}",
      scope: "provided"
    });
    dependencies.push({
      groupId: "com.querydsl",
      artifactId: "querydsl-jpa",
      version: "${querydsl.version}",
    })
  }

  if (grpc) {
    dependencies.push({
      groupId: "net.devh",
      artifactId: "grpc-client-spring-boot-starter",
      version: "${grpc.version}",
    });
    dependencies.push({
      groupId: "net.devh",
      artifactId: "grpc-server-spring-boot-starter",
      version: "${grpc.version}",
    });
    dependencies.push({
      groupId: groupId,
      artifactId: `${name}-grpc`,
      version: "0.0.1-SNAPSHOT",
    });
  }

  if (kafka) {
    dependencies.push({
      groupId: "org.springframework.kafka",
      artifactId: "spring-kafka",
    });
    dependencies.push({
      groupId: groupId,
      artifactId: `${name}-kafka`,
      version: "0.0.1-SNAPSHOT",
    });
  }
}

function addPlugins(plugins, options) {
  const { jpa, groupId, name } = options;

  if (jpa) {
    plugins.push({
      groupId: "org.flywaydb",
      artifactId: "flyway-maven-plugin",
      version: "${flyway.version}"
    });
    plugins.push({
      groupId: "com.mysema.maven",
      artifactId: "apt-maven-plugin",
      version: "${api-maven-plugin.version}",
      executions: [
        {
          execution: {
            goals: [
              {
                goal: "process"
              }
            ],
            configuration: {
              outputDirectory: "target/generated-sources/java",
              processor: "com.querydsl.apt.jpa.JPAAnnotationProcessor"
            }
          }
        }
      ]
    });
  }
}

function addProperties(properties, options) {
  const { grpc, jpa, restapi } = options;

  if (grpc) {
    properties["grpc.version"] = VERSION.gRPC;
  }

  if (jpa) {
    properties["api-maven-plugin.version"] = VERSION.apiMavenPlugin;
    properties["querydsl.version"] = VERSION.querydsl;
  }

  if (restapi) {
    properties["openapi.version"] = VERSION.openapi;
  }
}

module.exports = {
  initService,
};