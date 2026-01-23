import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector
} from '@reduxjs/toolkit';

import { getFeedsApi } from '@api';
import { TOrder, TOrdersData } from '@utils-types';

export const getFeeds = createAsyncThunk<
  TOrdersData,
  void,
  { rejectValue: string | undefined }
>('feed/getFeeds', async (_, { rejectWithValue }) => {
  try {
    const response = await getFeedsApi();
    const { success, ...data } = response;
    return data;
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(undefined);
  }
});

export type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getFeeds.fulfilled,
        (state, action: PayloadAction<TOrdersData>) => {
          state.orders = action.payload.orders;
          state.total = action.payload.total;
          state.totalToday = action.payload.totalToday;
          state.isLoading = false;
        }
      )
      .addCase(
        getFeeds.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload ?? 'Не удалось загрузить заказы';
        }
      );
  },
  selectors: {
    selectFeed: (state) => state,
    selectOrders: (state) => state.orders,
    selectTotal: (state) => state.total,
    selectTotalToday: (state) => state.totalToday,
    selectFeedIsLoading: (state) => state.isLoading,
    selectFeedError: (state) => state.error
  }
});

export const {
  selectFeed,
  selectOrders,
  selectTotal,
  selectTotalToday,
  selectFeedIsLoading,
  selectFeedError
} = feedSlice.selectors;

export default feedSlice.reducer;
