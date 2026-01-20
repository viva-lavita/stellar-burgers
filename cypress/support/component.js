import { Provider } from 'react-redux';
import store from '../../src/services/store';

// используем в тестах реальное редакс хранилище
Cypress.React.mount = (component, options = {}) => {
  const { reactMountOptions } = options;
  return cy.mount(
    <Provider store={store}>{component}</Provider>,
    reactMountOptions
  );
};
