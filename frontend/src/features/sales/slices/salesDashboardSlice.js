import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import salesAPI from '../services/salesAPI';

export const fetchSalesStats = createAsyncThunk(
  'salesDashboard/fetchSalesStats',
  async (_, { rejectWithValue }) => {
    try {
      return await salesAPI.getSalesStats();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch sales KPIs');
    }
  }
);

export const fetchSalesAnalytics = createAsyncThunk(
  'salesDashboard/fetchSalesAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await salesAPI.getSalesAnalytics();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch sales analytics');
    }
  }
);

export const fetchUpcomingFollowUps = createAsyncThunk(
  'salesDashboard/fetchUpcomingFollowUps',
  async (_, { rejectWithValue }) => {
    try {
      return await salesAPI.getUpcomingFollowUps();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch upcoming follow-ups');
    }
  }
);

export const fetchSalesActivities = createAsyncThunk(
  'salesDashboard/fetchSalesActivities',
  async (_, { rejectWithValue }) => {
    try {
      return await salesAPI.getSalesActivities();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch sales activities');
    }
  }
);

const salesDashboardSlice = createSlice({
  name: 'salesDashboard',
  initialState: {
    stats: null,
    analytics: null,
    upcomingFollowUps: [],
    activities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSalesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchSalesStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSalesStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Analytics
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      // Upcoming follow-ups
      .addCase(fetchUpcomingFollowUps.fulfilled, (state, action) => {
        state.upcomingFollowUps = action.payload;
      })
      // Activities
      .addCase(fetchSalesActivities.fulfilled, (state, action) => {
        state.activities = action.payload;
      });
  },
});

export const { clearSalesError } = salesDashboardSlice.actions;
export default salesDashboardSlice.reducer;

