import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseAPI from '../services/warehouseAPI';

export const fetchInventory = createAsyncThunk(
  'warehouseInventory/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseAPI.getInventory();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch inventory');
    }
  }
);

export const addStock = createAsyncThunk(
  'warehouseInventory/addStock',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await warehouseAPI.addStock(payload);
      dispatch(fetchInventory());
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add stock');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'warehouseInventory/adjustStock',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await warehouseAPI.adjustStock(payload);
      dispatch(fetchInventory());
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to adjust stock');
    }
  }
);

export const reserveStockForOrder = createAsyncThunk(
  'warehouseInventory/reserveStock',
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      const res = await warehouseAPI.reserveStock(orderId);
      dispatch(fetchInventory());
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reserve stock');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  mutating: false,
  error: null,
  successMessage: null,
};

const warehouseInventorySlice = createSlice({
  name: 'warehouseInventory',
  initialState,
  reducers: {
    clearInventoryStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addStock.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(addStock.fulfilled, (state) => {
        state.mutating = false;
        state.successMessage = 'Stock added and ledger updated successfully.';
      })
      .addCase(addStock.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(adjustStock.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state) => {
        state.mutating = false;
        state.successMessage = 'Stock audit adjustment recorded successfully.';
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(reserveStockForOrder.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(reserveStockForOrder.fulfilled, (state) => {
        state.mutating = false;
        state.successMessage = 'Stock reserved successfully for order.';
      })
      .addCase(reserveStockForOrder.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      });
  },
});

export const { clearInventoryStatus } = warehouseInventorySlice.actions;
export default warehouseInventorySlice.reducer;

