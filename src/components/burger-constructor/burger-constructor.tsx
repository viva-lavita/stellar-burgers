import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import {
  selectConstructor,
  selectOrderError,
  selectOrderLoading,
  selectCurrentOrder,
  selectIsAuthenticated
} from '@selectors';
import { useNavigate } from 'react-router-dom';
import {
  postOrder,
  resetCurrentOrder
} from '../../services/slices/order/order-slice';
import { resetConstructor } from '../../services/slices/constructor/constructor-slice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const constructorItems = useSelector(selectConstructor);
  const orderRequest = useSelector(selectOrderLoading);
  const orderError = useSelector(selectOrderError);
  const orderModalData = useSelector(selectCurrentOrder);
  const isAuth = useSelector(selectIsAuthenticated);

  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;
    if (!isAuth) {
      navigate('/login');
      return;
    }

    const toOrderIds = [
      ...constructorItems.ingredients.map((i) => i._id),
      constructorItems.bun._id,
      constructorItems.bun._id
    ];

    dispatch(postOrder(toOrderIds)).then(() => {
      if (orderError) return;
      dispatch(resetConstructor());
    });
  };

  const closeOrderModal = () => {
    dispatch(resetCurrentOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
