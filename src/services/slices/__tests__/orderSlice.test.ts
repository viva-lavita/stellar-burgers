import { configureStore } from '@reduxjs/toolkit';
import {
  postOrder,
  getOrders,
  getOrderByNumber,
  orderSlice,
  selectCurrentOrder,
  selectAllOrders,
  selectOrderLoading,
  selectOrderError,
  resetCurrentOrder,
  setCurrentOrder,
  TOrderState
} from '../order/order-slice';
import { orderBurgerApi, getOrdersApi, getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';

// Моки API
jest.mock('@api');

// Тестовые данные
const MOCK_ORDER: TOrder = {
  ingredients: ['ingr1', 'ingr2', 'ingr3'],
  _id: '696ec03ba64177001b327f4c',
  status: 'done',
  name: 'Заказ №1',
  createdAt: '2026-01-19T23:37:31.620Z',
  updatedAt: '2026-01-19T23:37:31.866Z',
  number: 99251
};

const MOCK_ORDERS: TOrder[] = [
  { ...MOCK_ORDER, number: 10001 },
  { ...MOCK_ORDER, number: 10002, name: 'Заказ №2' }
];

const initialState: TOrderState = orderSlice.getInitialState();

// Тестовый store
const createTestStore = (preloadedState?: TOrderState) =>
  configureStore({
    reducer: {
      order: orderSlice.reducer
    },
    preloadedState: { order: preloadedState || initialState }
  });

describe('orderSlice asyncThunk', () => {
  describe('postOrder', () => {
    test('postOrder.pending — устанавливает loading=true и очищает error', async () => {
      (orderBurgerApi as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      const store = createTestStore();
      store.dispatch(postOrder(['ingr1', 'ingr2']));
      const state = store.getState().order;

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.currentOrder).toBeNull();
    });

    test('postOrder.fulfilled — сохраняет currentOrder и сбрасывает loading', async () => {
      (orderBurgerApi as jest.Mock).mockResolvedValue({ order: MOCK_ORDER });
      const store = createTestStore();
      await store.dispatch(postOrder(['ingr1']));
      const state = store.getState().order;

      expect(state.currentOrder).toEqual(MOCK_ORDER);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('postOrder.rejected — обрабатывает ошибку и устанавливает сообщение', async () => {
      (orderBurgerApi as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );
      const store = createTestStore();
      await store.dispatch(postOrder(['ingr1']));
      const state = store.getState().order;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
      expect(state.currentOrder).toBeNull();
    });

    test('postOrder.rejected — "Произошла ошибка при оформлении заказа" для не-Error', async () => {
      (orderBurgerApi as jest.Mock).mockRejectedValue({});
      const store = createTestStore();
      await store.dispatch(postOrder(['ingr1']));
      const state = store.getState().order;

      expect(state.error).toBe('Произошла ошибка при оформлении заказа');
    });
  });

  describe('getOrders', () => {
    test('getOrders.pending — устанавливает loading=true', async () => {
      (getOrdersApi as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      const store = createTestStore();
      store.dispatch(getOrders());
      const state = store.getState().order;

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('getOrders.fulfilled — заполняет allOrders', async () => {
      (getOrdersApi as jest.Mock).mockResolvedValue(MOCK_ORDERS);
      const store = createTestStore();
      await store.dispatch(getOrders());
      const state = store.getState().order;

      expect(state.allOrders).toEqual(MOCK_ORDERS);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('getOrders.rejected — обрабатывает ошибку', async () => {
      (getOrdersApi as jest.Mock).mockRejectedValue(new Error('Server error'));
      const store = createTestStore();
      await store.dispatch(getOrders());
      const state = store.getState().order;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Server error');
    });

    test('getOrders.rejected — "Произошла ошибка при получении заказов" для не-Error', async () => {
      (getOrdersApi as jest.Mock).mockRejectedValue({});

      const store = createTestStore();
      await store.dispatch(getOrders());
      expect(store.getState().order.error).toBe(
        'Произошла ошибка при получении заказов'
      );
    });
  });

  describe('getOrderByNumber', () => {
    test('getOrderByNumber.pending — сбрасывает currentOrder и устанавливает loading', async () => {
      (getOrderByNumberApi as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      const store = createTestStore();
      store.dispatch(getOrderByNumber(10001));
      const state = store.getState().order;

      expect(state.currentOrder).toBeNull();
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('getOrderByNumber.fulfilled — обновляет currentOrder и добавляет в allOrders', async () => {
      (getOrderByNumberApi as jest.Mock).mockResolvedValue([MOCK_ORDER]);
      const store = createTestStore(); 
      await store.dispatch(getOrderByNumber(10001));
      const state = store.getState().order;

      expect(state.currentOrder).toEqual(MOCK_ORDER);
      expect(state.allOrders).toContainEqual(MOCK_ORDER);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('getOrderByNumber.rejected — обрабатывает ошибку', async () => {
      (getOrderByNumberApi as jest.Mock).mockRejectedValue(
        new Error('Not found')
      );
      const store = createTestStore();
      await store.dispatch(getOrderByNumber(10001));
      const state = store.getState().order;

      expect(state.currentOrder).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Not found');
    });

    test('getOrderByNumber.rejected — "Произошла ошибка при получении заказа" для не-Error', async () => {
      (getOrderByNumberApi as jest.Mock).mockRejectedValue({});
      const store = createTestStore();
      await store.dispatch(getOrderByNumber(10001));

      expect(store.getState().order.error).toBe(
        'Произошла ошибка при получении заказа'
      );
    });
  });
});

describe('orderSlice reducers', () => {
  test('resetCurrentOrder — сбрасывает currentOrder в null', () => {
    // Предустановленное состояние
    const store = createTestStore({
      ...initialState,
      currentOrder: MOCK_ORDER,
      allOrders: [MOCK_ORDER],
    });
    store.dispatch(resetCurrentOrder());
    const state = store.getState().order;

    expect(state.currentOrder).toBeNull();
    expect(state.allOrders).toEqual([MOCK_ORDER]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('resetCurrentOrder — не влияет на другие поля state', () => {
    const store = createTestStore({
      currentOrder: MOCK_ORDER,
      allOrders: MOCK_ORDERS,
      loading: true,
      error: 'Ошибка'
    });
    store.dispatch(resetCurrentOrder());
    const state = store.getState().order;

    expect(state.currentOrder).toBeNull();
    expect(state.allOrders).toEqual(MOCK_ORDERS);
    expect(state.loading).toBe(true);
    expect(state.error).toBe('Ошибка');
  });

  test('setCurrentOrder — устанавливает currentOrder и не меняет остальные поля', () => {
    const store = createTestStore();
    store.dispatch(setCurrentOrder(MOCK_ORDER));
    const state = store.getState().order;

    expect(state.currentOrder).toEqual(MOCK_ORDER);
    expect(state.allOrders).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('setCurrentOrder — перезаписывает currentOrder, если он уже был', () => {
    const anotherOrder: TOrder = {
      ...MOCK_ORDER,
      name: 'Другой заказ',
      number: 9999
    };

    const store = createTestStore({
      ...initialState,
      currentOrder: MOCK_ORDER,
      allOrders: [MOCK_ORDER],
    });
    store.dispatch(setCurrentOrder(anotherOrder));
    const state = store.getState().order;

    expect(state.currentOrder).toEqual(anotherOrder);
    // старый заказ остался в allOrders
    expect(state.allOrders).toContainEqual(MOCK_ORDER);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('setCurrentOrder — не изменяет другие поля, кроме currentOrder', () => {
    const store = createTestStore({
      currentOrder: null,
      allOrders: [MOCK_ORDER],
      loading: true,
      error: 'Временная ошибка'
    });
    store.dispatch(setCurrentOrder(MOCK_ORDER));
    const state = store.getState().order;

    expect(state.currentOrder).toEqual(MOCK_ORDER);
    expect(state.allOrders).toEqual([MOCK_ORDER]);
    expect(state.loading).toBe(true);
    expect(state.error).toBe('Временная ошибка');
  });
});

describe('orderSlice selectors', () => {
  test('selectCurrentOrder — возвращает currentOrder из состояния', () => {
    const store = createTestStore({
      ...initialState,
      currentOrder: MOCK_ORDER,
      allOrders: [MOCK_ORDER],
    });
    const currentOrder = selectCurrentOrder(store.getState());

    expect(currentOrder).toEqual(MOCK_ORDER);
  });

  test('selectCurrentOrder — возвращает null, если currentOrder не задан', () => {
    const store = createTestStore();
    const currentOrder = selectCurrentOrder(store.getState());

    expect(currentOrder).toBeNull();
  });

  test('selectAllOrders — возвращает allOrders из состояния', () => {
    const store = createTestStore({ 
      ...initialState,
      allOrders: MOCK_ORDERS,
     });
    const allOrders = selectAllOrders(store.getState());
  
    expect(allOrders).toEqual(MOCK_ORDERS);
  });
  
  test('selectAllOrders — возвращает пустой массив, если allOrders не задан', () => {
    const store = createTestStore();
    const allOrders = selectAllOrders(store.getState());
  
    expect(allOrders).toEqual([]);
  });

  test('selectOrderLoading — возвращает loading из состояния', () => {
    const store = createTestStore({
      ...initialState,
      loading: true,
     });
    const isLoading = selectOrderLoading(store.getState());
  
    expect(isLoading).toBe(true);
  });
  
  test('selectOrderLoading — возвращает false, если loading не задан', () => {
    const store = createTestStore();
    const isLoading = selectOrderLoading(store.getState());
  
    expect(isLoading).toBe(false);
  });

  test('selectOrderError — возвращает error из состояния', () => {
    const store = createTestStore({ 
      ...initialState,
      error: 'Произошла ошибка'
     });
    const error = selectOrderError(store.getState());
  
    expect(error).toBe('Произошла ошибка');
  });
  
  test('selectOrderError — возвращает null, если error не задан', () => {
    const store = createTestStore();
    const error = selectOrderError(store.getState());
    expect(error).toBeNull();
  }); 
});
