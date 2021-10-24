const path = require("path");
const fse = require("fs-extra");
const {
  updateModulePom,
  updateCommonJavaFiles,
  updateServiceJavaFiles,
} = require("./utils");

async function initKafka(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing Kafka module...");

  const { servicePath, name } = options;

  const kafkaCommonTemplateDir = path.join(__dirname, "components", "kafka", "common");
  const kafkaCommonDir = path.join(projectDir, `${options.name}-kafka`);

  fse.copy(kafkaCommonTemplateDir, kafkaCommonDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateModulePom(kafkaCommonDir, "kafka", options);
    await updateCommonJavaFiles(kafkaCommonDir, "kafka", options);
  });

  const basePath = path.join("src", "main", "java");
  const kafkaServiceTemplateDir = path.join(__dirname, "components", "kafka", "service");
  const kafkaServiceDir = path.join(projectDir, `${name}-service`, basePath, servicePath, "kafka");

  fse.copy(kafkaServiceTemplateDir, kafkaServiceDir, {
    overwrite: false,
    errorOnExist: false,
  }, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateServiceJavaFiles(kafkaServiceDir, "kafka", options);
  });
}

module.exports = {
  initKafka,
};