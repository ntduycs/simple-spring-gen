const path = require("path");
const fse = require("fs-extra");
const {
  capitalize,
  removeDir,
  updateModulePom,
  updateCommonJavaFiles,
  updateServiceJavaFiles,
} = require("./utils");
const replace = require("replace-in-file");
const yaml = require("js-yaml");
const fs = require("fs");

async function initGrpc(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing gRPC module...");

  const { servicePath, name: serviceName, templateName } = options;

  const grpcCommonTemplateDir = path.join(__dirname, "components", "grpc", "common");
  const grpcCommonDir = path.join(projectDir, `${serviceName}-grpc`);

  fse.copy(grpcCommonTemplateDir, grpcCommonDir, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateModulePom(grpcCommonDir, "grpc", options);
    await updateCommonJavaFiles(grpcCommonDir, "grpc", options);
    await updateCommonProtoFiles(grpcCommonDir, options);
  });

  const basePath = path.join("src", "main", "java");
  const grpcServiceTemplateDir = path.join(__dirname, "components", "grpc", "service");
  const grpcServiceDir = path.join(projectDir, `${serviceName}-service`, basePath, servicePath, "grpc");

  fse.copy(grpcServiceTemplateDir, grpcServiceDir, {
    overwrite: false,
    errorOnExist: false,
  }, async (err) => {
    if (err) {
      console.error(err);
      return;
    }

    await updateServiceJavaFiles(grpcServiceDir, "grpc", options, {
      from: [
        new RegExp(`${capitalize(templateName)}Error`, "g"),
      ],
      to: [
        `${capitalize(serviceName)}Error`,
      ],
    });
    await updateYamlFiles(projectDir, options);
  });
}

async function updateCommonProtoFiles(projectDir, options) {
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
    serviceError: `${capitalize(templateName)}GrpcError`,
    serviceCommon: `${templateName}/common`,
  };

  const service = {
    javaPackage: `package ${serviceName}`,
    protoPackage: servicePackage.trim().toLowerCase().replaceAll(/[_-]/g, ""),
    serviceError: `${capitalize(serviceName)}GrpcError`,
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

async function updateYamlFiles(projectDir, options) {
  const basePath = path.join("src", "main", "resources");
  const yamlPath = path.join(projectDir, `${options.name}-service`, basePath, "application-local.yaml");

  const yamlData = yaml.load(fs.readFileSync(yamlPath, "utf8"));

  yamlData.grpc = {
    server: {
      port: 9100
    }
  }

  fse.outputFile(yamlPath, yaml.dump(yamlData), err => {
    if (err) {
      console.error(err);
    }
  })
}

module.exports = {
  initGrpc,
};