const inviteeBoxPage = require("../fixtures/pages/inviteeBoxPage.json");
const inviteeDashboardPage = require("../fixtures/pages/inviteeDashboardPage.json");
const generalElements = require("../fixtures/pages/general.json");

Cypress.Commands.add(
  "approveInvitation",
  (inviteLink, username, password, wishes) => {
    cy.visit(inviteLink);
    cy.clickElement(generalElements.submitButton);
    cy.clickElementWithText("войдите");
    cy.login(username, password);
    cy.contains("Создать карточку участника").should("exist");
    cy.clickElement(generalElements.submitButton);
    cy.clickElement(generalElements.arrowRight);
    cy.clickElement(generalElements.arrowRight);
    cy.enterText(inviteeBoxPage.wishesInput, wishes);

    cy.clickElement(generalElements.arrowRight);

    cy.get(inviteeDashboardPage.noticeForInvitee)
      .invoke("text")
      .then((text) => {
        expect(text).to.contain("Это — анонимный чат с вашим Тайным Сантой");
      });
    cy.clearCookies();
  }
);
