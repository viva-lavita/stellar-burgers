import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi, getOrdersApi, getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';

export const postOrder = createAsyncThunk<
  TOrder,
  string[],
  { rejectValue: string }
>('order/postOrder', async (data, { rejectWithValue }) => {
  try {
    const response = await orderBurgerApi(data);
    return response.order;
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при оформлении заказа');
  }
});

export const getOrders = createAsyncThunk<
  TOrder[],
  void,
  { rejectValue: string }
>('order/getOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await getOrdersApi();
    return response;
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при получении заказов');
  }
});

// не поняла зачем оно в ретрив по номеру (не id, видимо не уникален) список выдает,
// номер тоже не уникален? Апи делали стажеры?
export const getOrderByNumber = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('order/getOrdersByNumber', async (number, { rejectWithValue }) => {
  try {
    const response = await getOrderByNumberApi(number);
    return response[0]; // один заказ (!)
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Произошла ошибка при получении заказа');
  }
});

export type TOrderState = {
  currentOrder: TOrder | null;
  allOrders: TOrder[];
  loading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  currentOrder: null,
  allOrders: [],
  loading: false,
  error: null
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setCurrentOrder: (state, action: PayloadAction<TOrder>) => {
      state.currentOrder = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postOrder.fulfilled, (state, action: PayloadAction<TOrder>) => {
        state.currentOrder = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(
        postOrder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error =
            action.payload ?? 'Произошла ошибка при оформлении заказа';
        }
      )
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrders.fulfilled,
        (state, action: PayloadAction<TOrder[]>) => {
          state.allOrders = action.payload;
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(
        getOrders.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error =
            action.payload ?? 'Произошла ошибка при получении заказов';
        }
      )
      .addCase(getOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(
        getOrderByNumber.fulfilled,
        (state, action: PayloadAction<TOrder>) => {
          state.currentOrder = action.payload;
          const existingIndex = state.allOrders.findIndex(
            (order) => order.number === action.payload.number
          );

          if (existingIndex === -1) {
            state.allOrders.push(action.payload);
          }
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(
        getOrderByNumber.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.currentOrder = null;
          state.error =
            action.payload ?? 'Произошла ошибка при получении заказа';
        }
      );
  },
  selectors: {
    selectCurrentOrder: (state) => state.currentOrder,
    selectAllOrders: (state) => state.allOrders,
    selectOrderLoading: (state) => state.loading,
    selectOrderError: (state) => state.error
  }
});

export const {
  selectCurrentOrder,
  selectAllOrders, // все заказы. Непонятно как отфильтровать по пользователю
  selectOrderLoading,
  selectOrderError
} = orderSlice.selectors;

export const { resetCurrentOrder, setCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;
