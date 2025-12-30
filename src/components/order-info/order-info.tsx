import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch } from '../../services/store';
import { useSelector } from '../../services/store';
import {
  selectIngredients,
  selectOrderError,
  selectOrderLoading
} from '@selectors';
import { useParams } from 'react-router-dom';
import {
  getOrderByNumber,
  resetCurrentOrder,
  setCurrentOrder
} from '../../services/slices/order/order-slice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const ingredients: TIngredient[] = useSelector(selectIngredients);
  const { number } = useParams();
  const orderNumber = Number(number);
  const orderData = useSelector((state) =>
    state.order.allOrders.find((item) => item.number === orderNumber)
  );
  const isLoadingOrder = useSelector(selectOrderLoading);
  const ordersError = useSelector(selectOrderError);

  useEffect(() => {
    if (orderData) {
      dispatch(setCurrentOrder(orderData));
    } else if (orderNumber && !orderData && !isLoadingOrder && !ordersError) {
      dispatch(getOrderByNumber(orderNumber));
    }
    return () => {
      dispatch(resetCurrentOrder());
    };
  }, [orderNumber, orderData, isLoadingOrder, ordersError]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  // прелоадер, пока загружаем ингредиенты или заказ с бэка
  if (!orderInfo || isLoadingOrder) {
    return <Preloader />;
  }

  return (
    <>
      <p
        className='text text_type_digits-default'
        style={{ textAlign: 'center' }}
      >
        #{orderInfo.number}
      </p>
      <OrderInfoUI orderInfo={orderInfo} />
    </>
  );
};
