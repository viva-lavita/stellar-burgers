import { configureStore } from '@reduxjs/toolkit';

import {
  getIngredients,
  ingredientsSlice,
  selectIngredients,
  selectIngredientsIsLoading
} from '../ingredient/ingredient-slice';
import { TIngredient } from '@utils-types';

// Моки API
jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

import { getIngredientsApi } from '@api';

const MOCK_INGREDIENTS: TIngredient[] = [
  {
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
  },
  {
    _id: 'ing-2',
    name: 'Соус Spicy-X',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 30,
    price: 90,
    image: 'sauce-02.png',
    image_mobile: 'sauce-02-mobile.png',
    image_large: 'sauce-02-large.png'
  }
];

const ERROR_MESSAGE = 'Произошла ошибка при загрузке ингредиентов';

// Тестовый store
const createTestStore = () =>
  configureStore({
    reducer: {
      ingredients: ingredientsSlice.reducer
    }
  });

describe('getIngredients async thunk', () => {
  afterEach(() => {
    jest.clearAllMocks();  // можно вроде в jest.config.ts clearMocks: true сделать
  });

  test('fulfilled — загружает ингредиенты', async () => {
    (getIngredientsApi as jest.Mock).mockResolvedValue(MOCK_INGREDIENTS);
    // Создаем с нуля тестовый store каждый раз
    const store = createTestStore();
    await store.dispatch(getIngredients());

    const state = store.getState().ingredients;
    expect(state.ingredients).toEqual(MOCK_INGREDIENTS);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  test('rejected — обрабатывает ошибку API', async () => {
    (getIngredientsApi as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const store = createTestStore();
    await store.dispatch(getIngredients());

    const state = store.getState().ingredients;
    expect(state.ingredients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  test('rejected — использует дефолтное сообщение при неизвестной ошибке', async () => {
    // Имитируем ошибку без message
    (getIngredientsApi as jest.Mock).mockRejectedValue({});

    const store = createTestStore();
    await store.dispatch(getIngredients());

    const state = store.getState().ingredients;
    expect(state.ingredients).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(ERROR_MESSAGE);
  });
});

describe('ingredientsSlice extraReducers', () => {
  const initialState = ingredientsSlice.getInitialState();

  test('pending — устанавливает isLoading=true и очищает error', () => {
    const state = ingredientsSlice.reducer(
      initialState,
      getIngredients.pending('')
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('fulfilled — сохраняет ингредиенты и сбрасывает isLoading', () => {
    const state = ingredientsSlice.reducer(
      initialState,
      getIngredients.fulfilled(MOCK_INGREDIENTS, '')
    );

    expect(state.ingredients).toEqual(MOCK_INGREDIENTS);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('rejected — устанавливает error и сбрасывает isLoading', () => {
    const errorPayload = 'Network error';
    // у нас прописан тип PayloadAction<string | undefined>
    const action = {
      type: getIngredients.rejected.type,
      payload: errorPayload,
      error: { message: 'rejected' }
    };
    const state = ingredientsSlice.reducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorPayload);
  });

  test('rejected — использует дефолтное сообщение, если payload отсутствует', () => {
    const state = ingredientsSlice.reducer(
      initialState,
      getIngredients.rejected(null, '')
    );

    expect(state.error).toBe(ERROR_MESSAGE);
  });
});

describe('ingredientsSlice selectors', () => {
  const testState = {
    ingredients: {
      ingredients: MOCK_INGREDIENTS,
      isLoading: false,
      error: null
    }
  };

  test('selectIngredients — возвращает список ингредиентов', () => {
    const result = selectIngredients(testState);
    expect(result).toEqual(MOCK_INGREDIENTS);
  });

  test('selectIngredientsIsLoading — возвращает isLoading', () => {
    const result = selectIngredientsIsLoading(testState);
    expect(result).toBe(false);

    // для isLoading=true
    const loadingState = {
      ingredients: { ...testState.ingredients, isLoading: true }
    };
    expect(selectIngredientsIsLoading(loadingState)).toBe(true);
  });
});
