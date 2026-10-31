import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseAPI from '../services/warehouseAPI';

export const fetchWarehouseDashboardMetrics = createAsyncThunk(
  'warehouseDashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseAPI.getDashboardMetrics();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load warehouse metrics');
    }
  }
);

export const fetchDashboardInventory = createAsyncThunk(
  'warehouseDashboard/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseAPI.getInventory();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load inventory');
    }
  }
);

export const fetchDashboardDispatches = createAsyncThunk(
  'warehouseDashboard/fetchDispatches',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseAPI.getDispatches();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load dispatches');
    }
  }
);

const initialState = {
  metrics: {
    total_catalog_products: 0,
    total_stock_units: 0,
    total_reserved_units: 0,
    low_stock_alerts_count: 0,
    pending_dispatches_count: 0,
    completed_deliveries_count: 0,
  },
  inventory: [],
  dispatches: [],
  loading: false,
  error: null,
};

const warehouseDashboardSlice = createSlice({
  name: 'warehouseDashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Metrics
      .addCase(fetchWarehouseDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchWarehouseDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Inventory
      .addCase(fetchDashboardInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      // Dispatches
      .addCase(fetchDashboardDispatches.fulfilled, (state, action) => {
        state.dispatches = action.payload;
      });
  },
});

export const { clearDashboardError } = warehouseDashboardSlice.actions;
export default warehouseDashboardSlice.reducer;

