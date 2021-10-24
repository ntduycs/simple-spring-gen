const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const xml = require("xml2js");

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

module.exports = {
  capitalize,
  removeDir,
  updateModulePom
};