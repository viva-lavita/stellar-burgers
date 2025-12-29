import { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated, selectUserIsLoading } from '@selectors';
import { useSelector } from '../../services/store';
import { Preloader } from '@ui';

export type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.ReactElement;
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  onlyUnAuth,
  children
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectUserIsLoading);
  const location = useLocation();

  if (isLoading) {
    return <Preloader />;
  }

  // при регисттрации
  if (!isAuthenticated && onlyUnAuth) {
    return children;
  }

  if (!isAuthenticated && !onlyUnAuth) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  if (isAuthenticated && onlyUnAuth) {
    // при логине/регистриации
    if (location.state?.from) {
      return <Navigate replace to={location.state.from} />;
    }

    return <Navigate replace to='/' />;
  }

  return children;
};
