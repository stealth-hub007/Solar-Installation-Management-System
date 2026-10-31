import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderAPI from '../services/orderAPI';

export const fetchOrders = createAsyncThunk(
  'salesOrders/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      return await orderAPI.getOrders(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'salesOrders/createOrder',
  async (data, { rejectWithValue }) => {
    try {
      return await orderAPI.createOrder(data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'salesOrders/updateOrderStatus',
  async ({ id, status, milestoneIndex }, { rejectWithValue }) => {
    try {
      return await orderAPI.updateOrderStatus(id, status, milestoneIndex);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update order status');
    }
  }
);

const orderSlice = createSlice({
  name: 'salesOrders',
  initialState: {
    items: [],
    selectedOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.items = state.items.map((o) => (o.id === action.payload.id ? action.payload : o));
      });
  },
});

export const { setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;

