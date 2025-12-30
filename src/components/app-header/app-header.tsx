import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';
import { selectUser, selectUserIsLoading } from '@selectors';

export const AppHeader: FC = () => {
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectUserIsLoading);

  if (isLoading) {
    return <AppHeaderUI userName='Загружается...' />;
  }

  return <AppHeaderUI userName={user?.name || ''} />;
};
