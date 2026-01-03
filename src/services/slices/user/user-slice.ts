import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TUser } from '@utils-types';
import {
  getUserApi,
  registerUserApi,
  loginUserApi,
  forgotPasswordApi,
  resetPasswordApi,
  logoutApi,
  updateUserApi,
  TRegisterData,
  TLoginData
} from '@api';
import { setCookie } from '../../../utils/cookie';

export const getUser = createAsyncThunk<TUser, void, { rejectValue: string }>(
  'user/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserApi();
      return response.user;
    } catch (error) {
      if (error instanceof Error && 'message' in error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Произошла ошибка при загрузке пользователя');
    }
  }
);

export const registerUser = createAsyncThunk<
  TUser,
  TRegisterData,
  { rejectValue: string }
>('user/registerUser', async (data, { rejectWithValue }) => {
  try {
    const response = await registerUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при регистрации пользователя');
  }
});

export const loginUser = createAsyncThunk<
  TUser,
  TLoginData,
  { rejectValue: string }
>('user/loginUser', async (data, { rejectWithValue }) => {
  try {
    const response = await loginUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при авторизации пользователя');
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      localStorage.removeItem('refreshToken');
      setCookie('accessToken', '', { expires: -1 });
    } catch (error) {
      if (error instanceof Error && 'message' in error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Произошла ошибка при выходе пользователя');
    }
  }
);

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { rejectValue: string }
>('user/updateUser', async (data, { rejectWithValue }) => {
  try {
    const response = await updateUserApi(data);
    return response.user;
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при обновлении пользователя');
  }
});

export const forgotPassword = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('user/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    await forgotPasswordApi({ email });
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при восстановлении пароля');
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { password: string; token: string },
  { rejectValue: string }
>('user/resetPassword', async (data, { rejectWithValue }) => {
  try {
    await resetPasswordApi(data);
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при сбросе пароля');
  }
});

type TUserState = {
  user: TUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(
        getUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.user = null;
        }
      )
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<TUser>) => {
          state.user = action.payload;
          state.isLoading = false;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(
        registerUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.error =
            action.payload ?? 'Произошла ошибка при регистрации пользователя';
        }
      )
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(
        loginUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.error =
            action.payload ?? 'Произошла ошибка при авторизации пользователя';
        }
      )
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(
        logoutUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.error =
            action.payload ?? 'Произошла ошибка при выходе пользователя';
        }
      )
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(
        updateUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload ?? 'Произошла ошибка при обновлении пользователя';
        }
      )
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(
        resetPassword.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload ?? 'Произошла ошибка при сбросе пароля';
        }
      )
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(
        forgotPassword.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload ?? 'Произошла ошибка при восстановлении пароля';
        }
      );
  },
  selectors: {
    selectUser: (state) => state.user,
    selectUserIsLoading: (state) => state.isLoading,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectUserError: (state) => state.error
  }
});

export const {
  selectUser,
  selectUserIsLoading,
  selectIsAuthenticated,
  selectUserError
} = userSlice.selectors;

export default userSlice.reducer;
