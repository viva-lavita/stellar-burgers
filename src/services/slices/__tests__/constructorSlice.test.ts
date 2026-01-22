import {
  addIngredient,
  removeIngredient,
  setBun,
  resetConstructor,
  swapIngredientPositions,
  constructorSlice,
  selectConstructor,
  selectBun,
  selectConstructorIngredients
} from '../constructor/constructor-slice';

import { TIngredient, TConstructorIngredient } from '@utils-types';

const MOCK_BUN: TIngredient = {
  _id: 'bun-1',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'bun-02.png',
  image_mobile: 'bun-02-mobile.png',
  image_large: 'bun-02-large.png'
};

// Соус и ингредиент имеют одинаковое поведение во всем,
// поэтому соус не тестим
const MOCK_INGREDIENT: TIngredient = {
  _id: 'ing-1',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'meat-01.png',
  image_mobile: 'meat-01-mobile.png',
  image_large: 'meat-01-large.png'
};

describe('constructorSlice reducers', () => {
  const initialState = constructorSlice.getInitialState();

  test('addIngredient — добавляет ингредиент с nanoid', () => {
    // Добавляем -> проверяем количество и содержимое
    // Редьюсер возвращает новое состояние
    const state = constructorSlice.reducer(
      initialState,
      addIngredient(MOCK_INGREDIENT)
    );

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toEqual({
      ...MOCK_INGREDIENT,
      id: expect.any(String) // не знаем какой будет id (nanoid)
    });
    expect(state.bun).toBeNull();
  });

  test('removeIngredient — удаляет ингредиент по id', () => {
    // Добавляем -> узнаем id -> удаляем по id -> проверяем, рекурсивно сравнивая поля
    let state = constructorSlice.reducer(
      initialState,
      addIngredient(MOCK_INGREDIENT)
    );
    const ingredientId = state.ingredients[0].id;
    state = constructorSlice.reducer(state, removeIngredient(ingredientId));

    expect(state.ingredients).toHaveLength(0);
  });

  test('setBun — устанавливает булку', () => {
    const state = constructorSlice.reducer(initialState, setBun(MOCK_BUN));

    expect(state.bun).toEqual(MOCK_BUN);
    // проверяем, что булка не попала в ингредиенты
    expect(state.ingredients).toHaveLength(0);
  });

  test('resetConstructor — сбрасывает состояние', () => {
    // Добавляем ингредиенты -> сбрасываем состояние -> проверяем (рекурсивно по полям) стейт = initialState
    let state = constructorSlice.reducer(initialState, setBun(MOCK_BUN));
    state = constructorSlice.reducer(state, addIngredient(MOCK_INGREDIENT));
    state = constructorSlice.reducer(state, resetConstructor());

    expect(state).toEqual(initialState);
  });

  test('swapIngredientPositions — меняет местами ингредиенты', () => {
    // Добавляем два ингредиента -> меняем местами (0 ↔ 1) -> проверяем айдишники(_id)
    let state = constructorSlice.reducer(
      initialState,
      addIngredient(MOCK_INGREDIENT)
    );
    state = constructorSlice.reducer(
      state,
      addIngredient({ ...MOCK_INGREDIENT, _id: 'ing-2' })
    );
    state = constructorSlice.reducer(
      state,
      swapIngredientPositions({ fromIndex: 0, toIndex: 1 })
    );

    expect(state.ingredients[0]._id).toBe('ing-2');
    expect(state.ingredients[1]._id).toBe('ing-1');
  });
});

describe('constructorSlice selectors', () => {
  // Тестовый стейт передаем в селектор -> селектор возвращает нужные поля -> проверяем
  const testState = {
    constructorBurger: {
      bun: MOCK_BUN,
      ingredients: [
        { ...MOCK_INGREDIENT, id: 'id-1' },
        { ...MOCK_INGREDIENT, id: 'id-2' }
      ]
    }
  };

  test('selectConstructor — возвращает полное состояние', () => {
    const result = selectConstructor(testState);
    expect(result).toEqual(testState.constructorBurger);
  });

  test('selectBun — возвращает булку', () => {
    const result = selectBun(testState);
    expect(result).toEqual(MOCK_BUN);
  });

  test('selectConstructorIngredients — возвращает список ингредиентов', () => {
    const result = selectConstructorIngredients(testState);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('id-1');
    expect(result[1].id).toBe('id-2');
  });
});

test('addIngredient.prepare — добавляет id через nanoid', () => {
  const action = addIngredient(MOCK_INGREDIENT);

  expect(action.payload).toEqual({
    ...MOCK_INGREDIENT,
    id: expect.any(String)
  });
  expect(action.payload.id).toHaveLength(21); // nanoid — 21 символ
});
