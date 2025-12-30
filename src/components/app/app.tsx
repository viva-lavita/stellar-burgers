import { Route, Routes, useLocation } from 'react-router-dom';
import '../../index.css';
import styles from './app.module.css';

import { useDispatch, useSelector } from '../../services/store';
import { useEffect } from 'react';
import { getUser } from '../../services/slices/user/user-slice';
import { getIngredients } from '../../services/slices/ingredient/ingredient-slice';
import { getCookie } from '../../utils/cookie';
import { withReturnOnCloseModal } from '../../hocs/with-return-on-close-modal';
import {
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404,
  ConstructorPage
} from '@pages';

import {
  AppHeader,
  OrderInfo,
  IngredientDetails,
  ProtectedRoute
} from '@components';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(getIngredients());
    const token = getCookie('accessToken');
    if (token) {
      dispatch(getUser());
    }
  }, []);

  const backgroundLocation = location.state?.background;

  const OrderInfoModalWithReturn = withReturnOnCloseModal(OrderInfo);
  const IngredientDetailsModalWithReturn =
    withReturnOnCloseModal(IngredientDetails);

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={backgroundLocation || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route
          path='/login'
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path='/feed/:number'
          element={<OrderInfoModalWithReturn title='' />}
        />
        <Route
          path='/ingredients/:id'
          element={
            <div className={styles.centerContent}>
              <IngredientDetails />
            </div>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <ProtectedRoute>
              <OrderInfoModalWithReturn title='' />
            </ProtectedRoute>
          }
        />

        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path='/feed/:number'
            element={<OrderInfoModalWithReturn title='' />}
          />
          <Route
            path='/ingredients/:id'
            element={<IngredientDetailsModalWithReturn title='' />}
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute>
                <OrderInfoModalWithReturn title='' />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
