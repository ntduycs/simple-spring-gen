const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const xml = require("xml2js");
const replace = require("replace-in-file");

const xmlParser = new xml.Parser();
const xmlBuilder = new xml.Builder();

function capitalize(str) {
  if (!str) {
    return "";
  }

  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

async function removeDir(templateDir) {
  fse.remove(templateDir, err => {
    if (err) {
      console.error(err);
    }
  })
}

async function updateModulePom(projectDir, module, options) {
  const grpcPomPath = path.join(projectDir, "pom.xml");

  await fs.readFile(grpcPomPath, (err, data) => {
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

      const { groupId, name, desc } = options;

      project.groupId = groupId;
      project.artifactId = `${name}-${module}`;
      project.name = `${name}-${module}`;
      project.description = desc;

      await fse.outputFile(grpcPomPath, xmlBuilder.buildObject(result));
    })
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

async function replaceJavaFiles(javaFiles, template, service, arguments = { from: [], to: [] }) {
  const templatePackageRegex = new RegExp(template.package, "g");
  const templateClassRegex = new RegExp(template.classPrefix, "g");

  const options = {
    from: [templatePackageRegex, templateClassRegex, ...arguments.from],
    to: [service.package, service.classPrefix, ...arguments.to],
    files: javaFiles,
  };

  await replace.replaceInFile(options, err => {
    if (err) {
      console.error(err);
    }
  })
}

async function updateCommonJavaFiles(commonDir, module, options) {
  const {
    templatePath,
    templatePackage,
    templateName,
    servicePath,
    servicePackage,
    name: serviceName,
  } = options;

  const basePath = path.join("src", "main", "java");

  const templateDir = path.join(commonDir, basePath, templatePath);
  const serviceDir = path.join(commonDir, basePath, servicePath);

  const template = {
    package: templatePackage,
    classPrefix: `${capitalize(templateName)}${capitalize(module)}`,
  }

  const service = {
    package: servicePackage,
    classPrefix: `${capitalize(serviceName)}${capitalize(module)}`,
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

async function updateServiceJavaFiles(serviceDir, module, options, arguments) {
  const {
    templatePackage,
    templateName,
    servicePackage,
    name: serviceName,
  } = options;

  const template = {
    package: templatePackage,
    classPrefix: `${capitalize(templateName)}${capitalize(module)}`,
  }

  const service = {
    package: servicePackage,
    classPrefix: `${capitalize(serviceName)}${capitalize(module)}`,
  }

  await replaceJavaFiles(`${serviceDir}/**/*.java`, template, service, arguments)
    .then(() => {
      renameJavaFiles(serviceDir, options);
    });
}

module.exports = {
  capitalize,
  removeDir,
  updateModulePom,
  replaceJavaFiles,
  updateCommonJavaFiles,
  updateServiceJavaFiles,
};