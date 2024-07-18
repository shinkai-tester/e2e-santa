const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const createEsbuildPlugin =
  require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;
const addCucumberPreprocessorPlugin =
  require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const { allureCypress } = require("allure-cypress/reporter");

module.exports = defineConfig({
  watchForFileChanges: false,
  e2e: {
    baseUrl: "https://santa-secret.ru",
    testIsolation: false,
    specPattern: "cypress/e2e/features/*.feature",
    stepDefinitions: "cypress/support/step_definitions/**/*.js",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      const bundler = createBundler({
        plugins: [createEsbuildPlugin(config)],
      });

      on("file:preprocessor", bundler);
      addCucumberPreprocessorPlugin(on, config);
      allureCypress(on, {
        resultsDir: "./allure-results",
      });
      return config;
    },
  },
  chromeWebSecurity: false,
});
