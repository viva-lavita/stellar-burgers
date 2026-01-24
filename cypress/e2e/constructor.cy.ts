import { setCookie, deleteCookie } from '../../src/utils/cookie';
import ingredientFixture from '../fixtures/ingredients.json';
import orderFixture from '../fixtures/order.json';
import '../support/commands';

const buns = 'ingredient-bun';
const mains = 'ingredient-main';
const sauces = 'ingredient-sauce';
const constructor = 'constructor';
const totalPrice = 'total-price';
const firstBunFixture = ingredientFixture.data[0];
const firstMainFixture = ingredientFixture.data[1];
const addedMain = 'added-ingredient-main';
const modal = 'modal';
const preloader = 'preloader';
const orderButton = 'order-button';

describe('Тестирование страницы конструктора', () => {
  describe('Тестирование конструктора неавторизованным пользователем', () => {
    beforeEach(() => {
      // Мокируем API
      cy.intercept('GET', '/api/ingredients', {
        fixture: 'ingredients.json'
      }).as('getIngredients');

      cy.visit('/');
      cy.wait('@getIngredients');
    });

    it('Проверка пустого конструктора', () => {
      cy.getBySel(constructor).should('be.visible');

      // Проверяем сообщения "Выберите булки/начинку"
      cy.getBySel('no-buns-top').should('contain.text', 'Выберите булки');
      cy.getBySel('no-buns-bottom').should('contain.text', 'Выберите булки');
      cy.getBySel('no-ingredients').should('contain.text', 'Выберите начинку');

      // Цена должна быть 0
      cy.getBySel(totalPrice).should('have.text', '0');
    });

    it('Работа табов', () => {
      // Проверяем, что по умолчанию отображается булки
      cy.getBySel(buns).should('be.visible');
      cy.getBySel(sauces).should('not.be.visible');

      // Переключаемся на таб с соусами
      // Работаем с классами, т.к. элементы в сторонней библиотеке
      // Анимация задерживает отображение
      cy.get('.tab_type_current').should('have.text', 'Булки');
      cy.get('[data-testid="tabs"]').find('div').eq(2).click();
      cy.get('.tab_type_current').should('have.text', 'Соусы');

      // Проверяем, что таб перелистнул список на начинки
      cy.getBySel(sauces).should('be.visible', { timeout: 10000 });
      cy.getBySel(buns).should('not.be.visible');
    });

    // Закрытие на кнопку в модальном окне тестируется в тесте создания заказа
    it('Клик на ингредиент, открытие модалки, закрытие по клику на оверлей', () => {
      // Кликаем на ингредиент
      cy.openModal(mains);

      // Информация в модальном окне соответствует ингредиенту
      cy.getBySel('ingredient-name').should('contain.text', firstMainFixture.name);

      // Кликаем на оверлей
      cy.closeModalOverlay();
    });

    it('Кейс добавления булки в конструктор', () => {
      // Кликаем на булку
      cy.addBun();

      // Проверяем, что булка появилась в списке топ
      cy.getBySel('bun-top').should('be.visible', { timeout: 5000 }).contains(firstBunFixture.name + ' (верх)');

      // Проверяем, что булка появилась в списке низ
      cy.getBySel('bun-bottom').should('be.visible', { timeout: 5000 }).contains(firstBunFixture.name + ' (низ)');

      // Цена обновилась
      cy.getBySel(totalPrice).should('be.visible', { timeout: 5000 }).should('have.text', firstBunFixture.price * 2);
    });

    it('Кейс добавления ингредиента в конструктор', () => {
      // Добавляем ингредиент
      cy.addMainIngredient();

      // Ингредиент появился в списке
      cy.getBySel(addedMain).first().should('contain.text', firstMainFixture.name);

      // Цена увеличилась
      cy.getBySel(totalPrice).should('have.text', firstMainFixture.price);
    });

    it('Кейс перемещения ингредиента (вверх/вниз)', () => {
      // Добавляем два ингредиента
      cy.addMainIngredient();
      cy.getBySel(mains).eq(1).find('button').click();

      // Проверяем начальный порядок
      cy.getBySel(addedMain).first().should('contain.text', firstMainFixture.name);
      cy.getBySel(addedMain).should('be.visible', { timeout: 5000 }).eq(1).should('exist');

      // Перемещаем второй ингредиент вверх
      cy.getBySel(addedMain).eq(1).find('button').first().click();

      // Проверяем, что первый ингредиент стал вторым
      cy.getBySel(addedMain).eq(1).should('contain.text', firstMainFixture.name);
    });

    it('Кейс удаления ингредиента из конструктора', () => {
      cy.addMainIngredient();
      cy.getBySel(totalPrice).should('have.text', firstMainFixture.price);

      // Кликаем на крестик удаления
      cy.getBySel(addedMain).first().find('.constructor-element__action').click();

      // Ингредиент исчез
      cy.getBySel(addedMain).should('not.exist');
      cy.getBySel(totalPrice).should('have.text', '0');
    });

    it('Кейс отправки заказа неавторизованным пользователем', () => {
      cy.addBun();
      cy.addMainIngredient();

      // Кликаем "Оформить заказ"
      cy.getBySel(orderButton).click();

      // Модальное окно не открывается
      cy.getBySel(modal).should('not.exist');
    });
  });

  describe('Оформления заказа авторизованным пользователем', () => {
    beforeEach(() => {
      // Очистка перед тестом, а не после, best practices
      // https://docs.cypress.io/app/core-concepts/best-practices#Using-after-Or-afterEach-Hooks
      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');
      // Мокируем API
      cy.intercept('GET', '/api/ingredients', {
        fixture: 'ingredients.json'
      }).as('getIngredients');

      cy.intercept('POST', '/api/orders', {
        statusCode: 200,
        body: orderFixture,
        delay: 1500 // чтобы успеть опознать прелоадер
      }).as('createOrder');

      cy.intercept('GET', '/api/auth/user', {
        fixture: 'user.json'
      }).as('getUser');

      // Добавляем токены
      setCookie('accessToken', '123');
      localStorage.setItem('refreshToken', '123');

      cy.visit('/');
      cy.wait('@getIngredients');
      cy.wait('@getUser');
    });

    it('Кейс отправки заказа авторизованным пользователем', () => {
      // Добавляем булку и ингредиент
      cy.addBun();
      cy.addMainIngredient();

      // Кликаем "Оформить заказ"
      cy.openModal(orderButton);
      cy.getBySel(preloader).should('be.visible', { timeout: 5000 });
      cy.getBySel('modal-title').should('contain.text', 'Оформляем заказ...');
      // Есть запрос создания заказа
      cy.wait('@createOrder');

      // Номер заказа соответствует полученному в ответе
      cy.getBySel('order-number').should('have.text', orderFixture.order.number);

      // Закрываем модальное окно по кнопке
      cy.closeModalButton();

      // Конструктор стал пустым
      cy.checkConstructorEmpty();

      cy.getBySel(addedMain).should('not.exist');

      // Цена стала 0
      cy.getBySel(totalPrice).should('have.text', '0');
    });
  });
});
