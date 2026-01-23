// 1 Перед каждым тестом загружаем страницу: мокаем ингридиенты из фикстуры, мокаем юзера из фикстуры
// 1.1. Проверяем, что запрос к ингредиентам и к юзеру был отправлен
// 2 Формируем бургер,  находим булки соусы начинку и добавляем в конструктор, проверяем что все отобразилось корректно
// 3 Открываем-закрываем модалки: детали ингредиента для всех пользователей, модалка должна закрыться при клике на оверлей и на кнопку.
// 4 Пробуем сделать заказ, авторизованным и неавторизованным пользователем
// 5 Проверяем, что состав заказа корректно сформирован, модалка закрывается при клике на оверлей. Заказ есть на странице заказов.

import { add, set } from 'cypress/types/lodash';
import { setCookie, deleteCookie } from '../../src/utils/cookie';
import ingredientFixture from '../fixtures/ingredients.json';
import orderFixture from '../fixtures/order.json';

const buns = "[data-testid='ingredient-bun']";
const mains = "[data-testid='ingredient-main']";
const constructor = "[data-testid='constructor']";
const totalPrice = "[data-testid='total-price']";
const firstBunFixture = ingredientFixture.data[0];
const firstMainFixture = ingredientFixture.data[1];
const addedMain = "[data-testid='added-ingredient-main']";
const modal = '[data-testid="modal"]';
const preloader = '[data-testid="preloader"]';
const orderButton = '[data-testid="order-button"]';

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
      cy.get(constructor).should('be.visible');

      // Проверяем сообщения "Выберите булки/начинку"
      cy.get('[data-testid="no-buns-top"]').should(
        'contain.text',
        'Выберите булки'
      );
      cy.get('[data-testid="no-buns-bottom"]').should(
        'contain.text',
        'Выберите булки'
      );
      cy.get('[data-testid="no-ingredients"]').should(
        'contain.text',
        'Выберите начинку'
      );

      // Цена должна быть 0
      cy.get(totalPrice).should('have.text', '0');
    });

    it('Работа табов', () => {
      // Проверяем, что по умолчанию отображается булки
      cy.get(buns).should('be.visible');
      cy.get(mains).should('not.be.visible');

      // Переключаемся на таб с ингредиентами
      // Работаем с классами, т.к. элементы в сторонней библиотеке
      cy.get('.tab_type_current').should('have.text', 'Булки');
      cy.get('[data-testid="tabs"]').find('div').eq(1).click();
      cy.get('.tab_type_current').should('have.text', 'Начинки');

      // Проверяем, что таб перелистнул список на начинки
      cy.get(mains).should('be.visible');
      cy.get(buns).should('not.be.visible');
    });

    // Закрытие на кнопку в модальном окне тестируется в тесте создания заказа
    it('Клик на ингредиент, открытие модалки, закрытие по клику на оверлей', () => {
      // Кликаем на ингредиент
      cy.get(mains).first().click();

      // Проверяем, что модалка открылась
      cy.get(modal).should('be.visible');

      // Информация в модальном окне соответствует ингредиенту
      cy.get('[data-testid="ingredient-name"]').should(
        'contain.text',
        firstMainFixture.name
      );

      // Кликаем на оверлей
      cy.get('[data-testid="overlay"]').click({ force: true });

      // Проверяем, что модалка закрылась
      cy.get(modal).should('not.exist');
    });

    it('Кейс добавления булки в конструктор', () => {
      // Кликаем на булку
      cy.get(buns).first().find('button').click();

      // Проверяем, что булка появилась в списке топ
      cy.get('[data-testid="bun-top"]').contains(
        firstBunFixture.name + ' (верх)'
      );

      // Проверяем, что булка появилась в списке низ
      cy.get('[data-testid="bun-bottom"]').contains(
        firstBunFixture.name + ' (низ)'
      );

      // Цена обновилась
      cy.get(totalPrice).should('have.text', firstBunFixture.price * 2);
    });

    it('Кейс добавления ингредиента в конструктор', () => {
      // Добавляем ингредиент
      cy.get(mains).first().find('button').click();

      // Ингредиент появился в списке
      cy.get(addedMain).first().should('contain.text', firstMainFixture.name);

      // Цена увеличилась
      cy.get(totalPrice).should('have.text', firstMainFixture.price);
    });

    it('Кейс перемещения ингредиента (вверх/вниз)', () => {
      // Добавляем два ингредиента
      cy.get(mains).first().find('button').click();
      cy.get(mains).eq(1).find('button').click();

      // Проверяем начальный порядок
      cy.get(addedMain).first().should('contain.text', firstMainFixture.name);
      cy.get(addedMain).eq(1).should('exist');

      // Перемещаем второй ингредиент вверх
      cy.get(addedMain).eq(1).find('button').first().click();

      // Проверяем, что первый ингредиент стал вторым
      cy.get(addedMain).eq(1).should('contain.text', firstMainFixture.name);
    });

    it('Кейс удаления ингредиента из конструктора', () => {
      cy.get(mains).first().find('button').click();
      cy.get(totalPrice).should('have.text', firstMainFixture.price);

      // Кликаем на крестик удаления
      cy.get(addedMain).first().find('.constructor-element__action').click();

      // Ингредиент исчез
      cy.get(addedMain).should('not.exist');
      cy.get(totalPrice).should('have.text', '0');
    });

    it('Кейс отправки заказа неавторизованным пользователем', () => {
      cy.get(buns).first().find('button').click();
      cy.get(mains).first().find('button').click();

      // Кликаем "Оформить заказ"
      cy.get(orderButton).click();

      // Модальное окно не открывается
      cy.get(modal).should('not.exist');
    });
  });

  describe('Оформления заказа авторизованным пользователем', () => {
    beforeEach(() => {
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
      cy.get(buns).first().find('button').click();
      cy.get(mains).first().find('button').click();

      // Кликаем "Оформить заказ"
      cy.get(orderButton).click();

      // Открывается модальное окно с прелоадером
      cy.get(modal).should('be.visible');
      cy.get(preloader).should('be.visible');
      cy.get('[data-testid="modal-title"]').should(
        'contain.text',
        'Оформляем заказ...'
      );
      // Есть запрос создания заказа
      cy.wait('@createOrder');

      // Номер заказа соответствует полученному в ответе
      cy.get('[data-testid="order-number"]').should(
        'have.text',
        orderFixture.order.number
      );

      // Закываем модальное окно
      cy.get('[data-testid="close-modal-button"]').click();
      cy.get(modal).should('not.exist');

      // Конструктор стал пустым
      cy.get('[data-testid="no-buns-top"]').should(
        'exist'
      );
      cy.get('[data-testid="no-buns-bottom"]').should(
        'exist'
      );
      cy.get('[data-testid="no-ingredients"]').should(
        'exist'
      );

      cy.get(addedMain).should('not.exist');

      // Цена стала 0
      cy.get(totalPrice).should('have.text', '0');
    });

    afterEach(() => {
      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');
    });
  });
});
