// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const loginPage = require("../fixtures/pages/loginPage.json");
const generalElements = require("../fixtures/pages/general.json");

Cypress.Commands.add("login", (userName, password) => {
  cy.enterText(loginPage.loginField, userName);
  cy.enterText(loginPage.passwordField, password);
  cy.get(generalElements.submitButton).click();
});

Cypress.Commands.add("clickElementWithText", (text) => {
  cy.contains(text).should("be.visible").click();
});

Cypress.Commands.add("clickElement", (locator) => {
  cy.get(locator).click();
});

Cypress.Commands.add("enterText", (locator, text) => {
  cy.get(locator).type(text);
});

Cypress.Commands.add("getValue", (locator) => {
  cy.get(locator)
    .invoke("val")
    .then((value) => {
      return value;
    });
});

Cypress.Commands.add("clickElement", (locator) => {
  cy.get(locator).should("be.visible").click({ force: true });
});

Cypress.Commands.add("containsMultipleTexts", (selector, texts) => {
  texts.forEach((text) => {
    cy.get(selector).should("contain.text", text);
  });
});

Cypress.Commands.add("elementHasText", (locator, text) => {
  cy.get(locator).should("have.text", text);
});

Cypress.Commands.add("logInAndGetCookies", (username, password) => {
  cy.login(username, password)
    .then(() => {
      return cy.getCookies();
    })
    .then((allCookies) => {
      const cookies = allCookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
      cy.wrap(cookies);
    });
});
