const path = require("path");
const fse = require("fs-extra");
const { capitalize, removeDir, updateModulePom, renameJavaFiles, replaceJavaFiles } = require("./utils");

async function initKafka(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing Kafka module...");

  const { servicePath } = options;

  const kafkaCommonTemplateDir = path.join(__dirname, "components", "kafka", "common");
  const kafkaCommonDir = path.join(projectDir, `${options.name}-kafka`);

  const basePath = path.join("src", "main", "java");

  const kafkaServiceTemplateDir = path.join(__dirname, "components", "kafka", "service");
  const kafkaServiceDir = path.join(projectDir, `${options.name}-service`, basePath, servicePath, "kafka");

  fse.copy(kafkaCommonTemplateDir, kafkaCommonDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateModulePom(kafkaCommonDir, "kafka", options);
    await updateCommonJavaFiles(kafkaCommonDir, options);
  });

  fse.copy(kafkaServiceTemplateDir, kafkaServiceDir, {
    overwrite: false,
    errorOnExist: false
  }, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateServiceJavaFiles(kafkaServiceDir, options);
  });
}

async function updateCommonJavaFiles(kafkaCommonDir, options) {
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
    await replaceJavaFiles(`${serviceDir}/**/*.java`, template, service)
      .then(() => {
        renameJavaFiles(serviceDir, options);
      })
  })
}

async function updateServiceJavaFiles(serviceDir, options) {
  const {
    templatePackage,
    templateName,
    servicePackage,
    name: serviceName,
  } = options;

  const template = {
    package: templatePackage,
    classPrefix: `${capitalize(templateName)}Kafka`,
  }

  const service = {
    package: servicePackage,
    classPrefix: `${capitalize(serviceName)}Kafka`,
  }

  await replaceJavaFiles(`${serviceDir}/**/*.java`, template, service)
    .then(() => {
      renameJavaFiles(serviceDir, options);
    });
}

module.exports = {
  initKafka
};