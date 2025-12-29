import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch } from '../../services/store';
import { useSelector } from 'react-redux';
import {
  getOrderByNumber,
  resetCurrentOrder
} from '../../services/slices/order/order-slice';
import { selectCurrentOrder, selectIngredients } from '@selectors';
import { useParams } from 'react-router-dom';
import { getIngredients } from '../../services/slices/ingredient/ingredient-slice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const orderData = useSelector(selectCurrentOrder);
  const ingredients: TIngredient[] = useSelector(selectIngredients);
  const { number } = useParams();

  useEffect(() => {
    dispatch(getOrderByNumber(Number(number)));
    if (!ingredients.length) {
      dispatch(getIngredients());
    }
    return () => {
      dispatch(resetCurrentOrder());
    };
  }, [number]);

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

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
