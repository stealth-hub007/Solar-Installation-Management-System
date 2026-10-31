import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import surveyAPI from '../services/surveyAPI';

export const fetchAssignedSurveys = createAsyncThunk(
  'assignedSurvey/fetchAssignedSurveys',
  async (params, { rejectWithValue }) => {
    try {
      return await surveyAPI.getAssignedSurveys(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch surveys');
    }
  }
);

export const fetchSurveyDetails = createAsyncThunk(
  'assignedSurvey/fetchSurveyDetails',
  async (id, { rejectWithValue }) => {
    try {
      return await surveyAPI.getSurveyById(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch survey details');
    }
  }
);

export const updateSurveyMeasurements = createAsyncThunk(
  'assignedSurvey/updateMeasurements',
  async ({ id, measurements }, { rejectWithValue }) => {
    try {
      return await surveyAPI.updateMeasurements(id, measurements);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save measurements');
    }
  }
);

export const submitSurvey = createAsyncThunk(
  'assignedSurvey/submitSurvey',
  async (id, { rejectWithValue }) => {
    try {
      return await surveyAPI.submitSurvey(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to submit survey');
    }
  }
);

const initialState = {
  items: [],
  selectedSurvey: null,
  loading: false,
  saving: false,
  error: null,
};

const assignedSurveySlice = createSlice({
  name: 'assignedSurvey',
  initialState,
  reducers: {
    clearSelectedSurvey: (state) => {
      state.selectedSurvey = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedSurveys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedSurveys.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssignedSurveys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSurveyDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSurveyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSurvey = action.payload;
      })
      .addCase(updateSurveyMeasurements.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateSurveyMeasurements.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedSurvey = { ...state.selectedSurvey, ...action.payload };
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(updateSurveyMeasurements.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(submitSurvey.fulfilled, (state, action) => {
        if (state.selectedSurvey) state.selectedSurvey = { ...state.selectedSurvey, ...action.payload };
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      });
  },
});

export const { clearSelectedSurvey } = assignedSurveySlice.actions;
export default assignedSurveySlice.reducer;
