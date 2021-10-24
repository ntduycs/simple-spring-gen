const path = require("path");
const fs = require("fs-extra");
const replace = require("replace-in-file");

async function initKafka(projectDir, options) {
  console.log("=".repeat(20));
  console.log("Initializing Kafka module...");
}

module.exports = {
  initKafka
};