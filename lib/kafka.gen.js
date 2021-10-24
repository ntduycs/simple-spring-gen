const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const xml = require("xml2js");
const { capitalize, removeDir, updateModulePom } = require("./utils");
const replace = require("replace-in-file");

const xmlParser = new xml.Parser();
const xmlBuilder = new xml.Builder();

async function initKafka(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing Kafka module...");

  const kafkaCommonTemplateDir = path.join(__dirname, "components", "kafka", "common");
  const kafkaCommonDir = path.join(projectDir, `${options.name}-kafka`);

  fse.copy(kafkaCommonTemplateDir, kafkaCommonDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateModulePom(kafkaCommonDir, "kafka", options);
    await updateJavaFiles(kafkaCommonDir, options);
  })
}

async function updateJavaFiles(kafkaCommonDir, options) {
  const {
    templatePath,
    templatePackage,
    templateName,
    servicePath,
    servicePackage,
    name: serviceName,
  } = options;

  const basePath = path.join("src", "main", "java");

  const templateDir = path.join(kafkaCommonDir, basePath, templatePath);
  const serviceDir = path.join(kafkaCommonDir, basePath, servicePath);

  const template = {
    package: templatePackage,
    classPrefix: `${capitalize(templateName)}Kafka`,
  }

  const service = {
    package: servicePackage,
    classPrefix: `${capitalize(serviceName)}Kafka`,
  }

  fse.copy(templateDir, serviceDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await removeDir(templateDir);
    replaceJava(`${serviceDir}/**/*.java`, template, service)
      .then(() => {
        renameJavaFiles(serviceDir, options);
      })
  })
}

async function replaceJava(javaFiles, template, service) {
  const templatePackageRegex = new RegExp(template.package, "g");
  const templateClassRegex = new RegExp(template.classPrefix, "g");

  const options = {
    from: [templatePackageRegex, templateClassRegex],
    to: [service.package, service.classPrefix],
    files: javaFiles,
  };

  await replace.replaceInFile(options, err => {
    if (err) {
      console.error(err);
    }
  })
}

async function renameJavaFiles(dir, options) {
  const { templateName, name: serviceName } = options;

  fs.readdir(dir, (err, files) => {
    files.forEach(file => {
      if (file.endsWith(".java")) {
        fs.rename(path.join(dir, file), path.join(dir, file.replace(capitalize(templateName), capitalize(serviceName))), err => {
          if (err) {
            console.error(err);
          }
        })
      } else {
        renameJavaFiles(path.join(dir, file), options);
      }
    });
  })
}

module.exports = {
  initKafka
};