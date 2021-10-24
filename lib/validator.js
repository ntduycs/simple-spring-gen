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

  if (!artifactId && !name) {
    printError("At least --artifactId or --name parameter must be provided");
    return false;
  } else if (!artifactId) {
    options.name = normalizedName(name);
    options.artifactId = normalizeArtifactId(options.name);
  } else if (!name) {
    options.artifactId = normalizeArtifactId(artifactId);
    options.name = normalizedName(options.artifactId);
  } else {
    options.name = normalizedName(name);
    options.artifactId = normalizeArtifactId(artifactId);
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

function normalizeArtifactId(artifactId) {
  const normalized = artifactId.trim()
    .toLowerCase()
    .replaceAll(/[_]/g, "");

  if (normalized.endsWith("-service")) {
    return artifactId;
  } else {
    return `${artifactId}-service`;
  }
}

function normalizedName(name) {
  const normalized = name.trim()
    .toLowerCase()
    .replaceAll(/[_]/g, "");

  if (normalized.endsWith("-service")) {
    return normalized.substring(0, normalized.lastIndexOf("-service"));
  } else {
    return normalized;
  }
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