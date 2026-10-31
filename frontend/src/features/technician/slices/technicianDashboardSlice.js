import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import technicianAPI from '../services/technicianAPI';

export const fetchTechnicianStats = createAsyncThunk(
  'technicianDashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await technicianAPI.getDashboardStats();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load technician stats');
    }
  }
);

export const fetchTechnicianActivity = createAsyncThunk(
  'technicianDashboard/fetchActivity',
  async (_, { rejectWithValue }) => {
    try {
      return await technicianAPI.getRecentActivity();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load activity');
    }
  }
);

const initialState = {
  stats: {
    assignedSurveys: 4,
    pendingSurveys: 3,
    completedSurveys: 1,
    surveysAwaitingApproval: 2,
    assignedInstallations: 5,
    pendingInstallations: 2,
    inProgressInstallations: 2,
    completedInstallations: 1,
    pendingChecklists: 2,
    pendingSignoffs: 1,
    loggedHours: 34.5,
  },
  activity: [],
  loading: false,
  error: null,
};

const technicianDashboardSlice = createSlice({
  name: 'technicianDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechnicianStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTechnicianStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTechnicianActivity.fulfilled, (state, action) => {
        state.activity = action.payload;
      });
  },
});

export default technicianDashboardSlice.reducer;

