export {
  selectIngredients,
  selectIngredientsIsLoading
} from '../slices/ingredient/ingredient-slice';
export {
  selectUser,
  selectUserIsLoading,
  selectIsAuthenticated,
  selectUserError
} from '../slices/user/user-slice';
export {
  selectFeed,
  selectOrders,
  selectTotal,
  selectTotalToday,
  selectFeedIsLoading,
  selectFeedError
} from '../slices/feed/feed-slice';

export {
  selectConstructor,
  selectBun,
  selectConstructorIngredients
} from '../slices/constructor/constructor-slice';

export {
  selectCurrentOrder,
  selectAllOrders,
  selectOrderLoading,
  selectOrderError
} from '../slices/order/order-slice';
