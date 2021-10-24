const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const xml = require("xml2js");
const { capitalize, removeDir } = require("./utils");
const replace = require("replace-in-file");

const xmlParser = new xml.Parser();
const xmlBuilder = new xml.Builder();

async function initGrpc(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing gRPC module...");

  const grpcCommonTemplateDir = path.join(__dirname, "components", "grpc", "common");
  const grpcCommonDir = path.join(projectDir, `${options.name}-proto`);

  fse.copy(grpcCommonTemplateDir, grpcCommonDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateGrpcModulePom(grpcCommonDir, options);
    await updateGrpcProtoFiles(grpcCommonDir, options);
    await updateGrpcJavaFiles(grpcCommonDir, options);
  });
}

async function updateGrpcModulePom(projectDir, options) {
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
      project.artifactId = `${name}-proto`;
      project.name = `${name}-proto`;
      project.description = desc;

      await fse.outputFile(grpcPomPath, xmlBuilder.buildObject(result));
    })
  })
}

async function updateGrpcProtoFiles(projectDir, options) {
  const {
    name: serviceName,
    servicePackage,
    templateName,
    templatePackage,
  } = options;

  const basePath = path.join("src", "main", "proto");
  const templateDir = path.join(projectDir, basePath, templateName);
  const protoDir = path.join(projectDir, basePath, serviceName);

  const template = {
    javaPackage: `package ${templateName}`,
    protoPackage: templatePackage,
    serviceError: `${capitalize(templateName)}Error`,
    serviceCommon: `${templateName}/common`,
  };

  const service = {
    javaPackage: `package ${serviceName}`,
    protoPackage: servicePackage,
    serviceError: `${capitalize(serviceName)}Error`,
    serviceCommon: `${serviceName}/common`,
  };

  fse.copy(templateDir, protoDir, async (err) => {
    if (!err) {
      await removeDir(templateDir);
      await replaceProto(`${protoDir}/**/*.proto`, template, service);
    }
  });
}

async function replaceProto(protoFiles, template, service) {
  const templateServiceError = new RegExp(template.serviceError, "g");

  const options = {
    from: [template.javaPackage, template.protoPackage, templateServiceError, template.serviceCommon],
    to: [service.javaPackage, service.protoPackage, service.serviceError, service.serviceCommon],
    files: protoFiles,
  };

  await replace.replaceInFile(options, err => {
    if (err) {
      console.error(err);
    }
  })
}

async function updateGrpcJavaFiles(grpcCommonDir, options) {
  const {
    templatePath,
    templatePackage,
    templateName,
    servicePath,
    servicePackage,
    name: serviceName,
  } = options;

  const basePath = path.join("src", "main", "java");

  const templateDir = path.join(grpcCommonDir, basePath, templatePath);
  const serviceDir = path.join(grpcCommonDir, basePath, servicePath);

  const template = {
    package: templatePackage,
    classPrefix: `${capitalize(templateName)}Grpc`,
  }

  const service = {
    package: servicePackage,
    classPrefix: `${capitalize(serviceName)}Grpc`,
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
  initGrpc,
};