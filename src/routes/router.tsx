import { createBrowserRouter } from 'react-router-dom';
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
  Modal,
  OrderInfo,
  IngredientDetails,
  ProtectedRoute,
  Layout
} from '@components';

import { withReturnOnCloseModal } from '../hocs/with-return-on-close-modal';

const OrderInfoModalWithReturn = withReturnOnCloseModal(OrderInfo);
const IngredientDetailsModalWithReturn =
  withReturnOnCloseModal(IngredientDetails);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ConstructorPage />
      },
      {
        path: '/feed',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            )
          },
          {
            // Модалка OrderInfo (по /feed/:number)
            path: ':number',
            element: (
              <ProtectedRoute>
                <OrderInfoModalWithReturn title='Заказ' />
              </ProtectedRoute>
            )
          }
        ]
      },
      {
        path: '/ingredients/:id',
        element: <IngredientDetailsModalWithReturn title='Детали ингредиента' />
      },
      {
        path: '/login',
        element: (
          <ProtectedRoute onlyUnAuth>
            <Login />
          </ProtectedRoute>
        )
      },
      {
        path: '/register',
        element: (
          <ProtectedRoute onlyUnAuth>
            <Register />
          </ProtectedRoute>
        )
      },
      {
        path: '/forgot-password',
        element: (
          <ProtectedRoute onlyUnAuth>
            <ForgotPassword />
          </ProtectedRoute>
        )
      },
      {
        path: '/reset-password',
        element: (
          <ProtectedRoute onlyUnAuth>
            <ResetPassword />
          </ProtectedRoute>
        )
      },
      {
        // Защищённый профиль
        path: '/profile',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )
          },
          {
            path: 'orders',
            children: [
              {
                index: true,
                element: (
                  <ProtectedRoute>
                    <ProfileOrders />
                  </ProtectedRoute>
                )
              },
              {
                path: ':number',
                element: (
                  <ProtectedRoute>
                    <OrderInfoModalWithReturn title='Заказ' />
                  </ProtectedRoute>
                )
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFound404 />
  }
]);
