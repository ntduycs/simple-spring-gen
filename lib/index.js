#!/usr/bin/env node

const commandLineArgs = require("command-line-args");
const optionsDefs = require("./options");
const generate = require("./generator");
const { validated } = require("./validator");

(() => {
  const options = commandLineArgs(optionsDefs);

  console.log("Generating new Spring Boot project with following parameters:");

  if (!validated(options)) {
    throw Error("Failed to validation CLI parameters");
  }

  generate(options)
    .then(() => {
      console.log("=".repeat(20));
      console.log("Happy coding!!!");
    });
})();