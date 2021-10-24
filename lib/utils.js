const fs = require("fs-extra");

function capitalize(str) {
  if (!str) {
    return "";
  }

  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

async function removeDir(templateDir) {
  fs.remove(templateDir, err => {
    if (err) {
      console.error(err);
    }
  })
}

module.exports = {
  capitalize,
  removeDir
};