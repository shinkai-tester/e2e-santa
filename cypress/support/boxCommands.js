const createBoxPage = require("../fixtures/pages/createBoxPage.json");

Cypress.Commands.add("clickRandomBoxPicture", () => {
  cy.get(createBoxPage.picturePicker).then((picturePicker) => {
    const pictureWrappers = picturePicker.find(createBoxPage.picture);
    if (pictureWrappers.length > 0) {
      const randomIndex = Math.floor(Math.random() * pictureWrappers.length);
      cy.wrap(pictureWrappers[randomIndex]).click();
    } else {
      throw new Error(
        `No elements with class ${createBoxPage.picture} found inside ${createBoxPage.picturePicker}.`
      );
    }
  });
});
