/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    addBun(): Chainable<void>;
    addMainIngredient(): Chainable<void>;
    openModal(ingredientSelector: string): Chainable<void>;
    closeModalOverlay(): Chainable<void>;
    closeModalButton(): Chainable<void>;
    checkConstructorEmpty(): Chainable<void>;
    getBySel(selector: string): Chainable<JQuery<HTMLElement>>;
  }
}
