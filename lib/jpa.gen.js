const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const yaml = require("js-yaml");
const {
  updateServiceJavaFiles,
} = require("./utils");

async function initJpa(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing JPA boilerplate code...");

  const { servicePath, name } = options;

  const basePath = path.join("src", "main", "java");
  const jpaServiceTemplateDir = path.join(__dirname, "components", "jpa", "service");
  const jpaServiceDir = path.join(projectDir, `${name}-service`, basePath, servicePath, "domain");

  fse.copy(jpaServiceTemplateDir, jpaServiceDir, {
    overwrite: false,
    errorOnExist: false,
  }, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateServiceJavaFiles(jpaServiceDir, "domain", options);
    await updateYamlFiles(projectDir, options);
  });
}

async function updateYamlFiles(projectDir, options) {
  const basePath = path.join("src", "main", "resources");
  const yamlPath = path.join(projectDir, `${options.name}-service`, basePath, "application-local.yaml");

  const yamlData = yaml.load(fs.readFileSync(yamlPath, "utf8"));

  const { spring } = yamlData;

  spring.datasource = {
    url: "jdbc:postgresql://localhost:5432/sadlier",
    username: "sadlier",
    password: "123456",
    hikari: {
      schema: "sadlierconnect"
    }
  };

  spring.jpa = {
    "open-in-view": false
  }

  spring.flyway = {
    "baseline-on-migrate": true
  }

  fse.outputFile(yamlPath, yaml.dump(yamlData), err => {
    if (err) {
      console.error(err);
    }
  })
}

module.exports = {
  initJpa
};