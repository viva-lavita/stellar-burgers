import { Outlet } from 'react-router-dom';
import { AppHeader } from '@components';

export const Layout = () => (
  <>
    <AppHeader />
    <Outlet />
  </>
);
