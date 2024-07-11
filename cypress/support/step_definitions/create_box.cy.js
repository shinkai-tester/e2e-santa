import { faker } from "@faker-js/faker";
const {
  Given,
  When,
  Then,
  After,
} = require("@badeball/cypress-cucumber-preprocessor");
const createBoxPage = require("../../fixtures/pages/createBoxPage.json");
const generalElements = require("../../fixtures/pages/general.json");
const dashboardBoxPage = require("../../fixtures/pages/dashboardBoxPage.json");
const invitePage = require("../../fixtures/pages/invitePage.json");

let wishes = `I would be happy with a ${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${faker.commerce.productName()}.`;
let boxId;
let inviteLink;
let cookies;

before(() => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    console.log("Caught an unhandled exception:", err.message);
    return false;
  });
});

Given(
  "the user logs in with email {string} and password {string}",
  (email, password) => {
    cy.visit("/login");
    cy.login(email, password);
    cy.log("User logged in");
  }
);

When("the user creates a box with the following details:", (dataTable) => {
  const data = dataTable.hashes()[0];
  cy.clickElementWithText("Создать коробку");
  cy.enterText(createBoxPage.boxNameField, data.boxName);
  cy.getValue(createBoxPage.boxIdForm).then((id) => {
    boxId = id;
  });
  cy.clickElement(generalElements.arrowRight);
  cy.clickRandomBoxPicture();
  cy.clickElement(generalElements.arrowRight);
  cy.get(createBoxPage.giftPriceToggle).check({ force: true });
  cy.enterText(createBoxPage.minAmount, data.minAmount);
  cy.enterText(createBoxPage.maxAmount, data.maxAmount);
  cy.get(createBoxPage.currency).select(data.currency);
  cy.clickElement(generalElements.arrowRight);
  cy.contains("Дополнительные настройки").should("be.visible");
  cy.clickElement(generalElements.arrowRight);
});

Then("the box {string} should be created successfully", (boxName) => {
  cy.elementHasText(dashboardBoxPage.createdBoxName, boxName);
  cy.get(dashboardBoxPage.menuItems)
    .invoke("text")
    .then((text) => {
      expect(text).to.include("Участники");
      expect(text).to.include("Моя карточка");
      expect(text).to.include("Подопечный");
    });
  cy.log("Box created successfully");
});

When("the user gets an invite link", () => {
  cy.clickElement(generalElements.submitButton);
  cy.get(invitePage.inviteLink)
    .invoke("text")
    .then((link) => {
      inviteLink = link;
      cy.log(`Invite link set to ${inviteLink}`);
    });
  cy.clearCookies();
  cy.log("Invite link obtained");
});

Then("the invite link should be valid", () => {
  expect(inviteLink).to.exist;
  cy.log("Invite link is valid");
});

When(
  "the participants accept the invitation with the following details:",
  (dataTable) => {
    const participants = dataTable.hashes();
    participants.forEach(({ email, password, name }) => {
      cy.approveInvitation(inviteLink, email, password, wishes);
      cy.log(`Invitation accepted by ${name}`);
    });
  }
);

Then(
  "the user logs in with email {string} and password {string} and checks that the participants are added to the box:",
  (email, password, dataTable) => {
    cy.visit("/login");
    cy.logInAndGetCookies(email, password).then((extractedCookies) => {
      cookies = extractedCookies;
      cy.log("User logged in and cookies obtained");
    });
    const participants = dataTable.hashes();
    cy.clickElement(dashboardBoxPage.myBoxes);
    cy.clickElement("[href='/box/" + boxId + "']");
    cy.get(dashboardBoxPage.participantsNames)
      .invoke("text")
      .then((text) => {
        participants.forEach(({ name }) => {
          expect(text).to.include(name);
          cy.log(`Participant ${name} added to the box`);
        });
      });
  }
);

When("the user initiates the draw", () => {
  cy.clickElement("[href='/box/" + boxId + "/draw']");
  cy.clickElement(generalElements.submitButton);
  cy.clickElement(dashboardBoxPage.confirmDraw);
  cy.log("Draw initiated");
});

Then("the draw should be completed successfully", () => {
  cy.elementHasText(dashboardBoxPage.notification, "Жеребьевка проведена");
  cy.get("a[href='/box/" + boxId + "/santas']").should("exist");
  cy.log("Draw completed successfully");
});

Then("the box should be deleted", () => {
  if (boxId) {
    cy.request({
      method: "DELETE",
      headers: {
        Cookie: cookies,
      },
      url: `https://santa-secret.ru/api/box/${boxId}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      cy.log("Box deleted successfully");
    });
  } else {
    cy.log("No Box ID set, skipping deletion");
  }
});
