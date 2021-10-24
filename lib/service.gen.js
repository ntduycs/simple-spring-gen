const path = require("path");
const fs = require("fs-extra");
const replace = require("replace-in-file");
const { capitalize, removeDir } = require("./utils");

async function initService(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing core service...");

  const serviceTemplateDir = path.join(__dirname, `./components/service`);
  const serviceDir = `${projectDir}/${options.name}-service`;

  fs.copy(serviceTemplateDir, serviceDir, err => {
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

      fs.moveSync(`${serviceDir}/${template.main}.java`, `${serviceDir}/${service.main}.java`);

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

module.exports = {
  initService
};