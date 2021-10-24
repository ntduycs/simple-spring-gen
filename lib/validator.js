function validated(options) {
  const {
    groupId,
    artifactId,
    name,
    package: _package,
  } = options;

  if (!groupId) {
    printError("Missing --groupId parameter");
    return false;
  } else {
    options.groupId = groupId.trim()
      .toLowerCase()
      .replaceAll(/[-_]/g, "");
  }

  if (!artifactId || !name) {
    printError("At least --artifactId or --name parameter must be provided");
    return false;
  } else if (!artifactId) {
    options.name = name.trim()
      .toLowerCase()
      .replaceAll(/[-_]/g, "");
    options.artifactId = name;
  } else if (!name) {
    options.artifactId = artifactId.trim()
      .toLowerCase()
      .replaceAll(/[-_]/g, "");
    options.name = artifactId;
  }

  if (!_package) {
    printError("Missing --package parameter");
    return false;
  } else {
    options.package = _package.trim()
      .toLowerCase()
      .replaceAll(/[-_]/g, "");
  }

  console.log({...options});
  console.log();

  return true;
}

function printError(error) {
  console.error();
  console.error("=".repeat(20));
  console.error(`ERROR: ${error}`);
  console.error("=".repeat(20));
  console.error();
}

module.exports = {
  validated
};