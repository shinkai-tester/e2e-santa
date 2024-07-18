const { defineConfig } = require("cypress");
const { allureCypress } = require("allure-cypress/reporter");

module.exports = defineConfig({
  watchForFileChanges: false,
  e2e: {
    baseUrl: "https://santa-secret.ru",
    testIsolation: false,
    setupNodeEvents(on, config) {
      allureCypress(on);
    },
  },
});
