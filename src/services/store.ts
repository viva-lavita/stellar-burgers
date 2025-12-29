import { combineReducers, configureStore } from '@reduxjs/toolkit';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

import ingredientsReducer from './slices/ingredient/ingredient-slice';
import userReducer from './slices/user/user-slice';
import orderReducer from './slices/order/order-slice';
import feedReducer from './slices/feed/feed-slice';
import constructorReducer from './slices/constructor/constructor-slice';

export const rootReducer = combineReducers({
  user: userReducer,
  ingredients: ingredientsReducer,
  order: orderReducer,
  feed: feedReducer,
  constructorBurger: constructorReducer
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
