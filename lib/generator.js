const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const xml = require("xml2js");
const yaml = require("js-yaml");
const shell = require("shelljs");
const childProcess = require("child_process");
const replace = require("replace-in-file");

const xmlParser = new xml.Parser();
const xmlBuilder = new xml.Builder();

async function generate(options) {
  const { out: outputDir, package: servicePackage } = options;

  options.templatePath = "com/example/demo";
  options.templatePackage = "com.example.demo";
  options.templateName = "demo";
  options.servicePath = `${servicePackage.replaceAll(".", "/")}`;
  options.servicePackage = servicePackage;

  const dest = outputDir.startsWith("./")
    ? path.join(process.cwd(), outputDir.substring("./".length))
    : path.join(process.cwd(), outputDir);

  try {
    createProject(dest);
    await updateProjectPom(dest, options);
    await createServiceModules(dest, options);
  } catch (e) {
    console.error(e);
  }
}

function createProject(projectDir) {
  console.log("=".repeat(20));
  console.log("Creating project directory at " + projectDir);

  const templates = "./templates/maven";
  const src = path.join(__dirname, templates);

  fse.copySync(src, projectDir);
}

async function updateProjectPom(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Updating POM");

  const pomPath = path.join(`${projectDir}/pom.xml`);

  await fs.readFile(pomPath, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    xmlParser.parseString(data, async (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      const { project } = result;

      await updateProjectMetadata(project, options);

      const modules = project.modules[0].module;
      await updateProjectModules(modules, options);

      fs.writeFileSync(pomPath, xmlBuilder.buildObject(result));
    });
  })
}

async function updateProjectMetadata(project, options) {
  const { groupId, artifactId, name, desc } = options;

  project.groupId = groupId;
  project.artifactId = artifactId;
  project.name = name;
  project.description = desc;
}

async function updateProjectModules(modules, options) {
  const { grpc, kafka } = options;

  modules[0] = `${options.name}-service`;

  if (grpc) {
    modules.push(`${options.name}-proto`);
  }

  if (kafka) {
    modules.push(`${options.name}-kafka`);
  }
}

async function createServiceModules(projectDir, options) {
  await createServiceModule(projectDir, options);
}

async function createServiceModule(projectDir, options) {
  const serviceTemplateDir = path.join(__dirname, `./components/service`);
  const serviceDir = `${projectDir}/${options.name}-service`;

  fse.copy(serviceTemplateDir, serviceDir, err => {
    if (!err) {
      renameServicePackage(projectDir, options);
    }
  });
}

async function renameServicePackage(projectDir, options) {
  const {
    templatePath,
    templatePackage,
    templateName,
    servicePath,
    servicePackage,
    name: serviceName,
  } = options;

  const basePath = `${serviceName}-service/src/main/java`;

  const templateDir = `${projectDir}/${basePath}/${templatePath}`;
  const serviceDir = `${projectDir}/${basePath}/${servicePath}`;

  const template = {
    package: templatePackage,
    dir: templateDir,
    main: `${templateName.charAt(0).toUpperCase() + templateName.slice(1)}ServiceApplication`
  };

  const service = {
    package: servicePackage,
    dir: serviceDir,
    main: `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}ServiceApplication`
  };

  fse.copy(templateDir, serviceDir, async (err) => {
    if (!err) {
      await removeTemplateDir(templateDir);

      fse.moveSync(`${serviceDir}/${template.main}.java`, `${serviceDir}/${service.main}.java`);

      await replaceJava(`${serviceDir}/**/*.java`, template, service);
    }
  });
}

function getJavaFilePaths(projectDir) {
  const files = fs.readdirSync(projectDir);

  let javaFiles = [];

  for (const file of files) {
    const stat = fs.statSync(path.join(projectDir, file));

    if (stat.isFile()) {
      if (file.endsWith(".java")) {
        javaFiles.push(path.join(projectDir, file));
      }
    } else {
      javaFiles = [...javaFiles, ...getJavaFilePaths(path.join(projectDir, file))];
    }
  }

  return javaFiles;
}

async function removeTemplateDir(templateDir) {
  fse.remove(templateDir, err => {
    if (err) {
      console.error(err);
    }
  })
}

async function renameJava(template, service) {
  fse
}

async function replaceJava(javaFiles, template, service) {
  const templateMain = new RegExp(template.main, "g")

  const options = {
    from: [template.package, templateMain],
    to: [service.package, service.main],
    files: javaFiles,
  };

  await replace.replaceInFile(options, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Replaced in " + res.length + " places");
    }
  });
}

module.exports = generate;