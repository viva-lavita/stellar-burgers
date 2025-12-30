import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { selectOrders, selectFeedIsLoading } from '@selectors';
import { getFeeds } from '../../services/slices/feed/feed-slice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders: TOrder[] = useSelector(selectOrders);
  const isLoadingFeeds = useSelector(selectFeedIsLoading);
  const isLoadingIngredients = useSelector(selectFeedIsLoading);

  useEffect(() => {
    dispatch(getFeeds());
  }, []);

  if (isLoadingFeeds || isLoadingIngredients) {
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
