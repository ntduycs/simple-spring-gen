const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const replace = require("replace-in-file");
const xml = require("xml2js");
const { capitalize, removeDir } = require("./utils");

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
    dir: templateDir,
    main: `${capitalize(templateName)}ServiceApplication`,
  };

  const service = {
    package: servicePackage,
    dir: serviceDir,
    main: `${capitalize(serviceName)}ServiceApplication`,
  };

  fse.copy(templateDir, serviceDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await removeDir(templateDir);

    const templateEntryFile = path.join(serviceDir, `${template.main}.java`);
    const serviceEntryFile = path.join(serviceDir, `${service.main}.java`);

    fse.moveSync(templateEntryFile, serviceEntryFile);

    await replaceJava(`${serviceDir}/**/*.java`, template, service);
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

      project.groupId = groupId;
      project.artifactId = artifactId;
      project.name = `${name}-service`;
      project.description = desc;

      addDependencies(dependencies, options);

      fse.outputFile(pomPath, xmlBuilder.buildObject(result), err => {
        if (err) {
          console.error(err);
        }
      })
    })
  })
}

function addDependencies(dependencies, options) {
  const { grpc, kafka, groupId, name } = options;

  if (grpc) {
    dependencies.push({
      groupId: "net.devh",
      artifactId: "grpc-client-spring-boot-starter",
      version: "${grpc.version}"
    });
    dependencies.push({
      groupId: "net.devh",
      artifactId: "grpc-server-spring-boot-starter",
      version: "${grpc.version}"
    });
    dependencies.push({
      groupId: groupId,
      artifactId: `${name}-proto`,
      version: "0.0.1-SNAPSHOT"
    });
  }

  if (kafka) {
    dependencies.push({
      groupId: "org.springframework.kafka",
      artifactId: "spring-kafka",
      version: "${grpc.version}"
    });
    dependencies.push({
      groupId: "net.devh",
      artifactId: "grpc-client-spring-boot-starter",
    });
    dependencies.push({
      groupId: groupId,
      artifactId: `${name}-kafka`,
      version: "0.0.1-SNAPSHOT"
    });
  }
}

module.exports = {
  initService,
};