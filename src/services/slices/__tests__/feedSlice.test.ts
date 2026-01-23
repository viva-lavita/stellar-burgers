import { configureStore } from '@reduxjs/toolkit';
import {
  feedSlice,
  getFeeds,
  selectFeed,
  selectOrders,
  selectTotal,
  selectTotalToday,
  selectFeedIsLoading,
  selectFeedError,
  TFeedState
} from '../feed/feed-slice';
import { getFeedsApi } from '@api';
import { TOrder, TOrdersData } from '@utils-types';

// Моки API
jest.mock('@api');

// Тестовые данные
const MOCK_ORDER: TOrder = {
  _id: '',
  status: 'done',
  name: 'Заказ №1',
  number: 99251,
  createdAt: '2026-01-19T23:37:31.620Z',
  updatedAt: '2026-01-19T23:37:31.866Z',
  ingredients: ['ingr1', 'ingr2']
};

const MOCK_FEED_DATA: TOrdersData = {
  orders: [MOCK_ORDER],
  total: 100,
  totalToday: 5
};

const InitialState: TFeedState = feedSlice.getInitialState();

const createTestStore = (preloadedState?: TFeedState) =>
  configureStore({
    reducer: { feed: feedSlice.reducer },
    preloadedState: {
      feed: preloadedState || InitialState
    }
  });

describe('feedSlice async thunk', () => {
  test('getFeeds.pending — устанавливает isLoading=true и очищает error', async () => {
    (getFeedsApi as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const store = createTestStore({
      ...InitialState,
      isLoading: true
    });
    store.dispatch(getFeeds());

    const state = store.getState().feed;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('getFeeds.fulfilled — заполняет orders, total, totalToday и сбрасывает isLoading', async () => {
    (getFeedsApi as jest.Mock).mockResolvedValue(MOCK_FEED_DATA);

    const store = createTestStore({
      ...InitialState,
      isLoading: true
    });
    await store.dispatch(getFeeds());
    const state = store.getState().feed;

    expect(state.orders).toEqual(MOCK_FEED_DATA.orders);
    expect(state.total).toBe(MOCK_FEED_DATA.total);
    expect(state.totalToday).toBe(MOCK_FEED_DATA.totalToday);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('getFeeds.rejected — обрабатывает ошибку и устанавливает сообщение', async () => {
    (getFeedsApi as jest.Mock).mockRejectedValue(new Error('Network error'));
    const store = createTestStore();
    await store.dispatch(getFeeds());
    const state = store.getState().feed;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  test('getFeeds.rejected — "Произошла ошибка при загрузке заказов" для не-Error', async () => {
    (getFeedsApi as jest.Mock).mockRejectedValue({});
    const store = createTestStore();
    await store.dispatch(getFeeds());
    const state = store.getState().feed;

    expect(state.error).toBe('Произошла ошибка при загрузке заказов');
  });
});

describe('feedSlice selectors', () => {
  test('selectFeed — возвращает полное состояние feed', () => {
    const preloadedState: TFeedState = {
      orders: [MOCK_ORDER],
      total: 10,
      totalToday: 2,
      isLoading: true,
      error: 'Ошибка'
    };

    const store = createTestStore(preloadedState);
    const feedState = selectFeed(store.getState());

    expect(feedState).toEqual(preloadedState);
  });

  test('selectOrders — возвращает orders из состояния', () => {
    const store = createTestStore({
      ...InitialState,
      orders: [MOCK_ORDER]
    });
    const orders = selectOrders(store.getState());

    expect(orders).toEqual([MOCK_ORDER]);
  });

  test('selectOrders — возвращает пустой массив, если orders не задан', () => {
    const store = createTestStore();
    const orders = selectOrders(store.getState());

    expect(orders).toEqual([]);
  });

  test('selectTotal — возвращает total из состояния', () => {
    const store = createTestStore({
      ...InitialState,
      total: 42
    });
    const total = selectTotal(store.getState());

    expect(total).toBe(42);
  });

  test('selectTotal — возвращает 0, если total не задан', () => {
    const store = createTestStore();
    const total = selectTotal(store.getState());

    expect(total).toBe(0);
  });

  test('selectTotalToday — возвращает totalToday из состояния', () => {
    const store = createTestStore({
      ...InitialState,
      totalToday: 7
    });
    const totalToday = selectTotalToday(store.getState());

    expect(totalToday).toBe(7);
  });

  test('selectTotalToday — возвращает 0, если totalToday не задан', () => {
    const store = createTestStore();
    const totalToday = selectTotalToday(store.getState());

    expect(totalToday).toBe(0);
  });

  test('selectFeedIsLoading — возвращает isLoading из состояния', () => {
    const store = createTestStore({
      ...InitialState,
      isLoading: true
    });
    const isLoading = selectFeedIsLoading(store.getState());

    expect(isLoading).toBe(true);
  });

  test('selectFeedIsLoading — возвращает false, если isLoading не задан', () => {
    const store = createTestStore();
    const isLoading = selectFeedIsLoading(store.getState());

    expect(isLoading).toBe(false);
  });

  test('selectFeedError — возвращает error из состояния', () => {
    const store = createTestStore({
      ...InitialState,
      error: 'Произошла ошибка'
    });
    const error = selectFeedError(store.getState());

    expect(error).toBe('Произошла ошибка');
  });

  test('selectFeedError — возвращает null, если error не задан', () => {
    const store = createTestStore();
    const error = selectFeedError(store.getState());

    expect(error).toBeNull();
  });
});
