/// <reference types="cypress" />
///<reference path="../support/commands.d.ts" />

Cypress.Commands.add('addBun', () => {
  cy.get('[data-testid="ingredient-bun"]').first().find('button').click();
});

Cypress.Commands.add('addMainIngredient', () => {
  cy.get('[data-testid="ingredient-main"]').first().find('button').click();
});

Cypress.Commands.add('openModal', (ingredientSelector: string) => {
  cy.get('[data-testid="' + ingredientSelector + '"]').first().click();
  cy.get('[data-testid="modal"]').should('be.visible');
});

Cypress.Commands.add('closeModalOverlay', () => {
  cy.get('[data-testid="overlay"]').click({ force: true });
  cy.get('[data-testid="modal"]').should('not.exist');
});

Cypress.Commands.add('closeModalButton', () => {
  cy.get('[data-testid="close-modal-button"]').click();
  cy.get('[data-testid="modal"]').should('not.exist');
});

Cypress.Commands.add('checkConstructorEmpty', () => {
  cy.get('[data-testid="no-buns-top"]').should('exist');
  cy.get('[data-testid="no-buns-bottom"]').should('exist');
  cy.get('[data-testid="no-ingredients"]').should('exist');
  cy.get('[data-testid="added-ingredient-main"]').should('not.exist');
  cy.get('[data-testid="total-price"]').should('have.text', '0');
});

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args);
});
