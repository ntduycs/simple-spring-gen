#!/usr/bin/env node

const path = require("path");
const commandLineArgs = require("command-line-args");
const optionsDefs = require("./options");
const generate = require("./generator");

(() => {
  console.log("Generating new Spring Boot project...");

  const options = commandLineArgs(optionsDefs);

  generate(options)
    .then(() => {
      console.log("=".repeat(20));
      console.log("Happy coding!!!");
    });
})();