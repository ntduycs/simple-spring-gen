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

  const grpcCommonTemplateDir = path.join(__dirname, "./components/grpc/common");
  const grpcCommonDir = `${projectDir}/${options.name}-proto`;

  fse.copy(grpcCommonTemplateDir, grpcCommonDir, err => {
    if (!err) {
      updateGrpcModulePom(grpcCommonDir, options);
      updateGrpcProtoFiles(grpcCommonDir, options);
    }
  });
}

async function updateGrpcModulePom(projectDir, options) {
  const grpcPomPath = `${projectDir}/pom.xml`;

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

      const { groupId, artifactId, name, desc } = options;

      project.groupId = groupId;
      project.artifactId = `${artifactId}-proto`;
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
    templatePackage
  } = options;

  const basePath = `src/main/proto`;

  const templateDir = `${projectDir}/${basePath}/${templateName}`;
  const protoDir = `${projectDir}/${basePath}/${serviceName}`;

  const template = {
    javaPackage: `package ${templateName}`,
    protoPackage: templatePackage,
    serviceError: `${capitalize(templateName)}Error`,
    serviceCommon: `${templateName}/common`
  };

  const service = {
    javaPackage: `package ${serviceName}`,
    protoPackage: servicePackage,
    serviceError: `${capitalize(serviceName)}Error`,
    serviceCommon: `${serviceName}/common`
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
    from: [template.javaPackage, template.protoPackage, templateServiceError],
    to: [service.javaPackage, service.protoPackage, service.serviceError],
    files: protoFiles
  };

  await replace.replaceInFile(options, err => {
    if (err) {
      console.error(err);
    }
  })
}

module.exports = {
  initGrpc
};