import store, { rootReducer, RootState } from './store';

test('rootReducer: при undefined-состоянии и неизвестном экшене возвращает начальное состояние', () => {
  const resultState = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
  const initialState = rootReducer(undefined, { type: '@@INIT' });
  // или так
  // const initialState = store.getState();

  expect(resultState).toEqual(initialState);
  // развернуто
  expect(resultState).toHaveProperty('user');
  expect(resultState).toHaveProperty('ingredients');
  expect(resultState).toHaveProperty('order');
  expect(resultState).toHaveProperty('feed');
  expect(resultState).toHaveProperty('constructorBurger');

  // ветви в начальном состоянии
  expect(resultState.user).toBeDefined();
  expect(resultState.ingredients).toBeDefined();
  expect(resultState.order).toBeDefined();
  expect(resultState.feed).toBeDefined();
  expect(resultState.constructorBurger).toBeDefined();
});
