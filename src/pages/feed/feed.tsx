import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { selectOrders, selectFeedIsLoading } from '@selectors';
import { getFeeds } from '../../services/slices/feed/feed-slice';
import { getIngredients } from '../../services/slices/ingredient/ingredient-slice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders: TOrder[] = useSelector(selectOrders);
  const isLoading = useSelector(selectFeedIsLoading);

  useEffect(() => {
    dispatch(getFeeds());
    dispatch(getIngredients());
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <FeedUI
      orders={orders}
      handleGetFeeds={() => {
        dispatch(getFeeds());
      }}
    />
  );
};
