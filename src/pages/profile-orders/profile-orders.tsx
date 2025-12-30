import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';

import {
  selectAllOrders,
  selectOrderLoading,
  selectOrderError
} from '@selectors';
import { Preloader } from '@ui';
import { getOrders } from '../../services/slices/order/order-slice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders: TOrder[] = useSelector(selectAllOrders);
  const isLoading = useSelector(selectOrderLoading);
  const orderError = useSelector(selectOrderError);

  useEffect(() => {
    if (orderError || isLoading) return;
    dispatch(getOrders());
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
