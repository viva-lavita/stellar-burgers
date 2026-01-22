import { configureStore } from '@reduxjs/toolkit';
import {
  getUser,
  registerUser,
  TUserState,
  loginUser,
  logoutUser,
  updateUser,
  forgotPassword,
  resetPassword,
  userSlice,
  selectUser,
  selectUserIsLoading,
  selectIsAuthenticated,
  selectUserError
  //   initialState
} from '../user/user-slice';

import { TUser } from '@utils-types';
import {
  registerUserApi,
  loginUserApi,
  logoutApi,
  updateUserApi,
  forgotPasswordApi,
  resetPasswordApi
} from '@api';

// Моки API, cookie, localStorage(зависимости)
jest.mock('@api');
jest.mock('../../../utils/cookie', () => ({
  setCookie: jest.fn().mockReturnValue('mock-token')
}));
const localStorageMock = {
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn().mockReturnValue(null),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;

// Импорт моков (после jest.mock!)
import { getUserApi } from '@api';
import {
  deleteCookie,
  setCookie as mockedSetCookie
} from '../../../utils/cookie';

// Тестовые данные
const MOCK_USER: TUser = {
  email: 'admin@ro.ru',
  name: 'Юзер Юзерович'
};

const MOCK_REGISTER_DATA = {
  email: 'ivan@example.com',
  password: 'password123',
  name: 'Иван'
};

const MOCK_LOGIN_DATA = {
  email: 'ivan@example.com',
  password: 'password123'
};

const ERROR_MESSAGE = 'Произошла ошибка';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const PreloadedInitialState = {
  user: MOCK_USER,
  isAuthenticated: true,
  isLoading: false,
  error: null
};

const authenticatedState = {
  user: MOCK_USER,
  isAuthenticated: true,
  isLoading: false,
  error: null
};

const loadingState = {
  user: MOCK_USER,
  isAuthenticated: true,
  isLoading: true,
  error: null
};

const errorState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: 'Произошла ошибка'
};

// Утилита для получения состояния store
const getState = (preloadedState: any) => {
  const store = configureStore({
    reducer: { user: userSlice.reducer },
    preloadedState: { user: preloadedState }
  });
  return store.getState();
};

// Тестовый store
const createTestStore = () =>
  configureStore({
    reducer: {
      user: userSlice.reducer
    }
  });

const createPreloadedStore = () =>
  configureStore({
    reducer: {
      user: userSlice.reducer
    },
    preloadedState: {
      user: PreloadedInitialState
    }
  });

describe('userSlice, async thunks', () => {
  afterEach(() => {
    jest.clearAllMocks(); // можно вроде в jest.config.ts clearMocks: true сделать
  });

  test('getUser.fulfilled — загружает пользователя', async () => {
    (getUserApi as jest.Mock).mockResolvedValue({
      success: true,
      user: MOCK_USER
    });

    const store = createTestStore();
    await store.dispatch(getUser());

    const state = store.getState().user;
    expect(state.user).toEqual(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  test('registerUser.fulfilled — регистрирует пользователя', async () => {
    const mockResponse = {
      user: MOCK_USER,
      accessToken: 'token123',
      refreshToken: 'refresh123'
    };
    (registerUserApi as jest.Mock).mockResolvedValue(mockResponse);
    const store = createTestStore();
    await store.dispatch(registerUser(MOCK_REGISTER_DATA));
    const state = store.getState().user;

    expect(state.user).toEqual(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
    // проверяем, что установили токены
    expect(mockedSetCookie).toHaveBeenCalledWith('accessToken', 'token123');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refreshToken',
      'refresh123'
    );
  });

  test('loginUser.fulfilled — авторизует пользователя', async () => {
    const mockResponse = {
      user: MOCK_USER,
      accessToken: 'token456',
      refreshToken: 'refresh456'
    };
    (loginUserApi as jest.Mock).mockResolvedValue(mockResponse);

    const store = createTestStore();
    await store.dispatch(loginUser(MOCK_LOGIN_DATA));

    const state = store.getState().user;
    expect(state.user).toEqual(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
    expect(mockedSetCookie).toHaveBeenCalledWith('accessToken', 'token456');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refreshToken',
      'refresh456'
    );
  });

  test('logoutUser.fulfilled — выходит из аккаунта', async () => {
    // предустановка стейта
    const store = createPreloadedStore();
    await store.dispatch(logoutUser());

    const state = store.getState().user;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    // проверяем, что куки удалили правильно
    expect(mockedSetCookie).toHaveBeenCalledWith('accessToken', '', {
      expires: -1
    });
  });

  test('updateUser.fulfilled — обновляет данные пользователя', async () => {
    const updateData = {
      name: 'Юзер Юзерович Новый',
      email: 'updated@example.com'
    };

    const mockResponse = {
      success: true,
      user: {
        ...MOCK_USER, // если полей больше. у нас не так, но это правильно
        ...updateData
      }
    };
    (updateUserApi as jest.Mock).mockResolvedValue(mockResponse);
    const store = createPreloadedStore();
    await store.dispatch(updateUser(updateData));
    const state = store.getState().user;

    expect(state.user?.name).toBe('Юзер Юзерович Новый');
    expect(state.user?.email).toBe('updated@example.com');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(updateUserApi).toHaveBeenCalledWith(updateData);
  });

  test('forgotPassword.fulfilled — отправляет запрос на восстановление пароля', async () => {
    const email = 'user@new.ru';
    // API возвращает void (успех без данных)
    (forgotPasswordApi as jest.Mock).mockResolvedValue(undefined);

    const store = createTestStore();
    await store.dispatch(forgotPassword(email));
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    // пользователь не вошел
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
    expect(forgotPasswordApi).toHaveBeenCalledWith({ email });
  });

  test('resetPassword.fulfilled — успешно сбрасывает пароль', async () => {
    const resetData = {
      password: 'newSecurePass123',
      token: 'valid-reset-token'
    };
    // успех без данных
    (resetPasswordApi as jest.Mock).mockResolvedValue(undefined);

    const store = createTestStore();
    await store.dispatch(resetPassword(resetData));
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('loginUser.rejected — обрабатывает ошибку при авторизации', async () => {
    (loginUserApi as jest.Mock).mockRejectedValue(new Error('Network error'));

    const store = createTestStore();
    await store.dispatch(loginUser(MOCK_LOGIN_DATA));
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
    expect(state.user).toBeNull();
  });

  test('logoutUser.rejected — обрабатывает ошибку при выходе из аккаунта', async () => {
    (logoutApi as jest.Mock).mockRejectedValue(new Error('Network error'));

    const store = createPreloadedStore();
    await store.dispatch(logoutUser());
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
    expect(state.user).not.toBeNull();
  })

  test('updateUser.rejected — обрабатывает ошибку при обновлении пользователя', async () => {
    const updateData = { email: 'broken@example.com' };
    (updateUserApi as jest.Mock).mockRejectedValue(new Error('Network error'));

    const store = createPreloadedStore();
    await store.dispatch(updateUser(updateData));
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
    // пользователь не сбрасывается при ошибке
    expect(state.user).not.toBeNull();
  });

  test('forgotPassword.rejected — обрабатывает ошибку восстановления пароля', async () => {
    const email = 'user@new.ru';
    (forgotPasswordApi as jest.Mock).mockRejectedValue(
      new Error('User not found')
    );

    const store = createTestStore();
    await store.dispatch(forgotPassword(email));
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('User not found');
    // это проверили выше
    // expect(forgotPasswordApi).toHaveBeenCalledWith({ email });
  });

  test('resetPassword.rejected — обрабатывает ошибку сброса пароля', async () => {
    const resetData = {
      password: 'weak',
      token: 'invalid-token'
    };
    (resetPasswordApi as jest.Mock).mockRejectedValue(
      new Error('Invalid token')
    );

    const store = createTestStore();
    await store.dispatch(resetPassword(resetData));
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid token');
  });

  test('getUser.rejected — обрабатывает ошибку', async () => {
    (getUserApi as jest.Mock).mockRejectedValue(new Error('Network error'));
    const store = createTestStore();
    await store.dispatch(getUser());
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Network error');
  });

  test('registerUser.rejected — обрабатывает ошибку регистрации', async () => {
    (registerUserApi as jest.Mock).mockRejectedValue(new Error('Bad request'));

    const store = createTestStore();
    await store.dispatch(registerUser(MOCK_REGISTER_DATA));

    const state = store.getState().user;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Bad request');
  });

  test('getUser.pending — устанавливает isLoading=true', async () => {
    (getUserApi as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const store = createTestStore();
    store.dispatch(getUser());

    const state = store.getState().user;

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('registerUser.pending — устанавливает isLoading=true и очищает error', async () => {
    (registerUserApi as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const store = createTestStore();
    store.dispatch(registerUser(MOCK_REGISTER_DATA));

    const state = store.getState().user;

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('loginUser.pending — устанавливает isLoading=true и очищает error', async () => {
    (loginUserApi as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const store = createTestStore();
    store.dispatch(loginUser(MOCK_LOGIN_DATA));

    const state = store.getState().user;

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('logoutUser.pending — устанавливает isLoading=true и очищает error', async () => {
    (logoutApi as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const store = createPreloadedStore();
    store.dispatch(logoutUser());
    const state = store.getState().user;

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    // user и isAuthenticated пока не изменены
    expect(state.user).toEqual(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
  });

  test('updateUser.pending — устанавливает isLoading=true и очищает error', async () => {
    (updateUserApi as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const store = createPreloadedStore();
    store.dispatch(updateUser({ name: 'Новое имя' }));
    const state = store.getState().user;

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toEqual(MOCK_USER); // пока не обновлён
    expect(state.isAuthenticated).toBe(true);
  });

  test('forgotPassword.pending — устанавливает isLoading=true и очищает error', async () => {
    (forgotPasswordApi as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const store = createTestStore();
    store.dispatch(forgotPassword('user@example.com'));
    const state = store.getState().user;

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('resetPassword.pending — устанавливает isLoading=true и очищает error', async () => {
    (resetPasswordApi as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const store = createTestStore();
    store.dispatch(resetPassword({ password: 'newpass', token: 'token123' }));
    const state = store.getState().user;

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('getUser.rejected — возвращает "Неизвестная ошибка" при не-Error', async () => {
    (getUserApi as jest.Mock).mockRejectedValue({});
    const store = createTestStore();
    await store.dispatch(getUser());
    const state = store.getState().user;
  
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Неизвестная ошибка');
  });

  test('registerUser.rejected — возвращает "Неизвестная ошибка" при не-Error', async () => {
    (registerUserApi as jest.Mock).mockRejectedValue({});
    const store = createTestStore();
    await store.dispatch(registerUser(MOCK_REGISTER_DATA));
    const state = store.getState().user;
  
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
    // user не должен измениться
    expect(state.user).toBeNull();
  });
  
  test('loginUser.rejected — возвращает "Неизвестная ошибка" при не-Error', async () => {
    (loginUserApi as jest.Mock).mockRejectedValue({});
    const store = createTestStore();
    await store.dispatch(loginUser(MOCK_LOGIN_DATA));
    const state = store.getState().user;
  
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
    expect(state.user).toBeNull();
  });
  
  test('updateUser.rejected — возвращает "Неизвестная ошибка" при не-Error', async () => {
    (updateUserApi as jest.Mock).mockRejectedValue({});
    const store = configureStore({
      reducer: { user: userSlice.reducer },
      preloadedState: {
        user: { ...initialState, user: MOCK_USER, isAuthenticated: true }
      }
    });
    await store.dispatch(updateUser({ name: 'Новое имя' }));
    const state = store.getState().user;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
    // user остаётся прежним
    expect(state.user).toEqual(MOCK_USER);
  });

  test('logoutUser.rejected — возвращает "Неизвестная ошибка" при не-Error', async () => {
    (logoutApi as jest.Mock).mockRejectedValue({});
    const store = configureStore({
      reducer: { user: userSlice.reducer },
      preloadedState: {
        user: { ...initialState, isAuthenticated: true, user: MOCK_USER }
      }
    });
  
    await store.dispatch(logoutUser());
    const state = store.getState().user;
  
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
    // user остаётся прежним
    expect(state.user).not.toBeNull();
  });
  
  test('forgotPassword.rejected — возвращает "Неизвестная ошибка" при не-Error', async () => {
    (forgotPasswordApi as jest.Mock).mockRejectedValue({});
  
    const store = createTestStore();
    await store.dispatch(forgotPassword('user@example.com'));
  
    const state = store.getState().user;
  
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
  });
  
  test('resetPassword.rejected — возвращает "Неизвестная ошибка" при не-Error', async () => {
    (resetPasswordApi as jest.Mock).mockRejectedValue({});
  
    const store = createTestStore();
    await store.dispatch(resetPassword({ password: 'newpass', token: 'token123' }));
  
    const state = store.getState().user;
  
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
  });
  
});

describe('userSlice selectors', () => {
  test('selectUser — возвращает поле user', () => {
    // Начальное состояние (user = null)
    const state1 = getState(initialState);
    expect(selectUser(state1)).toBeNull();

    // Авторизованное состояние
    const state2 = getState(authenticatedState);
    expect(selectUser(state2)).toEqual(MOCK_USER);

    // Состояние с ошибкой (user всё ещё может быть)
    const state3 = getState({ ...authenticatedState, error: 'Ошибка' });
    expect(selectUser(state3)).toEqual(MOCK_USER);
  });

  test('selectUserIsLoading — возвращает поле isLoading', () => {
    // isLoading = false
    const state1 = getState(initialState);
    expect(selectUserIsLoading(state1)).toBe(false);

    // isLoading = true
    const state2 = getState(loadingState);
    expect(selectUserIsLoading(state2)).toBe(true);

    // Другие состояния
    const state3 = getState(errorState);
    expect(selectUserIsLoading(state3)).toBe(false);
  });

  test('selectIsAuthenticated — возвращает поле isAuthenticated', () => {
    // Неавторизован
    const state1 = getState(initialState);
    expect(selectIsAuthenticated(state1)).toBe(false);

    // Авторизован
    const state2 = getState(authenticatedState);
    expect(selectIsAuthenticated(state2)).toBe(true);

    // После ошибки (остаётся false)
    const state3 = getState(errorState);
    expect(selectIsAuthenticated(state3)).toBe(false);
  });

  test('selectUserError — возвращает поле error', () => {
    // error = null
    const state1 = getState(initialState);
    expect(selectUserError(state1)).toBeNull();

    // error с сообщением
    const state2 = getState(errorState);
    expect(selectUserError(state2)).toBe('Произошла ошибка');

    // error в другом состоянии
    const state3 = getState({
      ...authenticatedState,
      error: 'Другая ошибка'
    });
    expect(selectUserError(state3)).toBe('Другая ошибка');
  });

  // Дополнительный тест: проверка всех селекторов на одном состоянии
  test('все селекторы работают на едином состоянии', () => {
    const preloadedState = {
      user: MOCK_USER,
      isAuthenticated: true,
      isLoading: true,
      error: 'Временная ошибка'
    };

    const state = getState(preloadedState);

    expect(selectUser(state)).toEqual(MOCK_USER);
    expect(selectUserIsLoading(state)).toBe(true);
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(selectUserError(state)).toBe('Временная ошибка');
  });
});
