import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import followUpAPI from '../services/followUpAPI';

export const fetchFollowUps = createAsyncThunk(
  'salesFollowUps/fetchFollowUps',
  async (params, { rejectWithValue }) => {
    try {
      return await followUpAPI.getFollowUps(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch follow-ups');
    }
  }
);

export const createFollowUp = createAsyncThunk(
  'salesFollowUps/createFollowUp',
  async (data, { rejectWithValue }) => {
    try {
      return await followUpAPI.createFollowUp(data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create follow-up');
    }
  }
);

export const completeFollowUp = createAsyncThunk(
  'salesFollowUps/completeFollowUp',
  async ({ id, outcomeNotes }, { rejectWithValue }) => {
    try {
      return await followUpAPI.completeFollowUp(id, outcomeNotes);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to complete follow-up');
    }
  }
);

export const rescheduleFollowUp = createAsyncThunk(
  'salesFollowUps/rescheduleFollowUp',
  async ({ id, newDate, newTime, notes }, { rejectWithValue }) => {
    try {
      return await followUpAPI.rescheduleFollowUp(id, newDate, newTime, notes);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reschedule follow-up');
    }
  }
);

export const deleteFollowUp = createAsyncThunk(
  'salesFollowUps/deleteFollowUp',
  async (id, { rejectWithValue }) => {
    try {
      return await followUpAPI.deleteFollowUp(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete follow-up');
    }
  }
);

const followUpSlice = createSlice({
  name: 'salesFollowUps',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowUps.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowUps.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFollowUps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFollowUp.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(completeFollowUp.fulfilled, (state, action) => {
        state.items = state.items.map((f) => (f.id === action.payload.id ? action.payload : f));
      })
      .addCase(rescheduleFollowUp.fulfilled, (state, action) => {
        state.items = state.items.map((f) => (f.id === action.payload.id ? action.payload : f));
      })
      .addCase(deleteFollowUp.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.id !== action.payload.id);
      });
  },
});

export default followUpSlice.reducer;

