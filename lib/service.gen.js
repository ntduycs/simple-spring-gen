const path = require("path");
const fs = require("fs-extra");
const replace = require("replace-in-file");
const { capitalize, removeDir } = require("./utils");

async function initService(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing core service...");

  const serviceTemplateDir = path.join(__dirname, `./components/service`);
  const serviceDir = path.join(projectDir, `${options.name}-service`);

  fs.copy(serviceTemplateDir, serviceDir, async (err) => {
    if (!err) {
      await renameAndReplace(projectDir, options);
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

  const basePath = path.join(serviceName, "src", "main", "java");

  const templateDir = path.join(projectDir, basePath, templatePath);
  const serviceDir = path.join(projectDir, basePath, servicePath);

  const template = {
    package: templatePackage,
    dir: templateDir,
    main: `${capitalize(templateName)}ServiceApplication`
  };

  const service = {
    package: servicePackage,
    dir: serviceDir,
    main: `${capitalize(serviceName)}ServiceApplication`
  };

  fs.copy(templateDir, serviceDir, async (err) => {
    if (!err) {
      await removeDir(templateDir);

      const templateEntryFile = path.join(serviceDir, `${template.main}.java`);
      const serviceEntryFile = path.join(serviceDir, `${service.main}.java`);

      fs.moveSync(templateEntryFile, serviceEntryFile);

      await replaceJava(`${serviceDir}/**/*.java`, template, service);
    }
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
}

module.exports = {
  initService
};