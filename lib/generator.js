const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const xml = require("xml2js");
const yaml = require("js-yaml");
const { initService } = require("./service.gen");
const { initGrpc } = require("./grpc.gen");
const { initKafka } = require("./kafka.gen");

const xmlParser = new xml.Parser();
const xmlBuilder = new xml.Builder();

async function generate(options) {
  const { out: outputDir, package: servicePackage } = options;

  options.templatePath = "com/example/demo";
  options.templatePackage = "com.example.demo";
  options.templateName = "demo";
  options.servicePath = `${servicePackage.replaceAll(".", "/")}`;
  options.servicePackage = servicePackage;

  const projectDir = outputDir.startsWith("./")
    ? path.join(process.cwd(), outputDir.substring("./".length))
    : path.join(process.cwd(), outputDir);

  try {
    createProject(projectDir);
    await initProjectModules(projectDir, options);
  } catch (e) {
    console.error(e);
  }
}

function createProject(projectDir) {
  console.log("=".repeat(20));
  console.log(`\nCreating project directory at ${projectDir}\n`);

  const templates = "./templates/maven";
  const templateDir = path.join(__dirname, templates);

  fse.copySync(templateDir, projectDir);
}

async function initProjectModules(projectDir, options) {
  await updateProjectPom(projectDir, options);
  await initService(projectDir, options);

  const { grpc, kafka } = options;

  if (grpc) {
    await initGrpc(projectDir, options);
  }

  if (kafka) {
    await initKafka(projectDir, options);
  }
}

async function updateProjectPom(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Updating project POM...");

  const pomPath = path.join(`${projectDir}/pom.xml`);

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
      const modules = project.modules[0].module;

      updateProjectMetadata(project, options);
      updateProjectModules(modules, options);

      fse.outputFile(pomPath, xmlBuilder.buildObject(result), err => {
        if (err) {
          console.error(err);
        }
      });
    });
  })
}

function updateProjectMetadata(project, options) {
  const { groupId, artifactId, name, desc } = options;

  project.groupId = groupId;
  project.artifactId = artifactId;
  project.name = name;
  project.description = desc;
}

function updateProjectModules(modules, options) {
  const { grpc, kafka } = options;

  modules[0] = `${options.name}-service`;

  if (grpc) {
    modules.push(`${options.name}-proto`);
  }

  if (kafka) {
    modules.push(`${options.name}-kafka`);
  }
}

module.exports = generate;