import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import installationAPI from '../services/installationAPI';

export const fetchAssignedInstallations = createAsyncThunk(
  'assignedInstallation/fetchInstallations',
  async (params, { rejectWithValue }) => {
    try {
      return await installationAPI.getAssignedInstallations(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch installations');
    }
  }
);

export const fetchInstallationDetails = createAsyncThunk(
  'assignedInstallation/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      return await installationAPI.getInstallationById(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch installation details');
    }
  }
);

export const startInstallationJob = createAsyncThunk(
  'assignedInstallation/startJob',
  async (id, { rejectWithValue }) => {
    try {
      return await installationAPI.startInstallation(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to start installation');
    }
  }
);

export const completeInstallationJob = createAsyncThunk(
  'assignedInstallation/completeJob',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await installationAPI.completeInstallation(id, data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to complete installation');
    }
  }
);

const initialState = {
  items: [],
  selectedJob: null,
  loading: false,
  error: null,
};

const assignedInstallationSlice = createSlice({
  name: 'assignedInstallation',
  initialState,
  reducers: {
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedInstallations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedInstallations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssignedInstallations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInstallationDetails.fulfilled, (state, action) => {
        state.selectedJob = action.payload;
      })
      .addCase(startInstallationJob.fulfilled, (state, action) => {
        if (state.selectedJob) {
          state.selectedJob.status = 'In Progress';
          state.selectedJob.installation_status = 'IN_PROGRESS';
        }
        const idx = state.items.findIndex((j) => j.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx].status = 'In Progress';
          state.items[idx].installation_status = 'IN_PROGRESS';
        }
      })
      .addCase(completeInstallationJob.fulfilled, (state, action) => {
        if (state.selectedJob) {
          state.selectedJob.status = 'Completed';
          state.selectedJob.installation_status = 'COMPLETED';
        }
      });
  },
});

export const { clearSelectedJob } = assignedInstallationSlice.actions;
export default assignedInstallationSlice.reducer;
