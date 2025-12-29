import { FC, useEffect } from 'react';
import { AppHeaderUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { getUser } from '../../services/slices/user/user-slice';
import { selectUser, selectUserIsLoading } from '@selectors';

export const AppHeader: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectUserIsLoading);

  useEffect(() => {
    dispatch(getUser());
  }, []);

  if (isLoading) {
    return <AppHeaderUI userName='Загружается...' />;
  }

  return <AppHeaderUI userName={user?.name || ''} />;
};
