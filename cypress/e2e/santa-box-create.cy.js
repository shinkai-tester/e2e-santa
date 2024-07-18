const users = require("../fixtures/users.json");
const createBoxPage = require("../fixtures/pages/createBoxPage.json");
const generalElements = require("../fixtures/pages/general.json");
const dashboardBoxPage = require("../fixtures/pages/dashboardBoxPage.json");
const invitePage = require("../fixtures/pages/invitePage.json");
import { faker } from "@faker-js/faker";

describe("Secret Santa E2E: create box, invite users, and execute draw", () => {
  let newBoxName = faker.word.noun({ length: { min: 5, max: 10 } });
  let wishes = `I would be happy with a ${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${faker.commerce.productName()}.`;
  let minAmount = 1;
  let maxAmount = 50;
  let currency = "Евро";
  let participants = Object.entries(users)
    .filter(([key]) => key !== "userAuthor")
    .map(([, value]) => value);
  let boxId;
  let inviteLink;
  let cookies;

  before(() => {
    // Handle uncaught exceptions
    Cypress.on("uncaught:exception", (err, runnable) => {
      // Returning false here prevents Cypress from failing the test
      console.log("Caught an unhandled exception:", err.message);
      return false;
    });
  });

  it("User logs in and creates a box", () => {
    cy.visit("/login");
    cy.login(users.userAuthor.email, users.userAuthor.password);
    cy.clickElementWithText("Создать коробку");
    cy.enterText(createBoxPage.boxNameField, newBoxName);
    cy.getValue(createBoxPage.boxIdForm).then((id) => {
      boxId = id;
    });
    cy.clickElement(generalElements.arrowRight);
    cy.clickElement(generalElements.arrowRight);
    cy.clickElement(generalElements.arrowRight);
    cy.get(createBoxPage.giftPriceToggle).check({ force: true });
    cy.enterText(createBoxPage.minAmount, minAmount);
    cy.enterText(createBoxPage.maxAmount, maxAmount);
    cy.get(createBoxPage.currency).select(currency);
    cy.clickElement(generalElements.arrowRight);
    cy.contains("Дополнительные настройки").should("be.visible");
    cy.clickElement(generalElements.arrowRight);
    cy.elementHasText(dashboardBoxPage.createdBoxName, newBoxName);
    cy.get(dashboardBoxPage.menuItems)
      .invoke("text")
      .then((text) => {
        expect(text).to.include("Участники");
        expect(text).to.include("Моя карточка");
        expect(text).to.include("Подопечный");
      });
  });

  it("User gets invite link for participants", () => {
    cy.clickElement(generalElements.submitButton);
    cy.get(invitePage.inviteLink)
      .invoke("text")
      .then((link) => {
        inviteLink = link;
      });
    cy.clearCookies();
  });

  participants.forEach(({ email, password, name }) => {
    it(`Approve invitation as ${name}`, () => {
      cy.approveInvitation(inviteLink, email, password, wishes);
    });
  });

  it("User initiates the draw", () => {
    cy.visit("/login");
    cy.logInAndGetCookies(
      users.userAuthor.email,
      users.userAuthor.password
    ).then((extractedCookies) => {
      cookies = extractedCookies;
    });
    cy.clickElement(dashboardBoxPage.myBoxes);
    cy.clickElement("[href='/box/" + boxId + "']");
    cy.get(dashboardBoxPage.participantsNames)
      .invoke("text")
      .then((text) => {
        expect(text).to.include(users.user1.name);
        expect(text).to.include(users.user2.name);
        expect(text).to.include(users.user3.name);
      });
    cy.clickElement("[href='/box/" + boxId + "/draw']");
    cy.clickElement(generalElements.submitButton);
    cy.clickElement(dashboardBoxPage.confirmDraw);
    cy.elementHasText(dashboardBoxPage.notification, "Жеребьевка проведена");
    cy.get("a[href='/box/" + boxId + "/santas']").should("exist");
  });

  after("delete box", () => {
    cy.request({
      method: "DELETE",
      headers: {
        Cookie: cookies,
      },
      url: `${Cypress.env("baseUrl")}/api/box/${boxId}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});
