const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const { capitalize, removeDir, updateModulePom, renameJavaFiles, replaceJavaFiles } = require("./utils");
const replace = require("replace-in-file");

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

    await updateModulePom(grpcCommonDir, "grpc", options);
    await updateProtoFiles(grpcCommonDir, options);
    await updateJavaFiles(grpcCommonDir, options);
  });
}

async function updateProtoFiles(projectDir, options) {
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

async function updateJavaFiles(grpcCommonDir, options) {
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
    await replaceJavaFiles(`${serviceDir}/**/*.java`, template, service)
      .then(() => {
        renameJavaFiles(serviceDir, options);
      })
  })
}

module.exports = {
  initGrpc,
};