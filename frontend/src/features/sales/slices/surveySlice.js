import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import surveyAPI from '../services/surveyAPI';

export const fetchSurveys = createAsyncThunk(
  'salesSurveys/fetchSurveys',
  async (params, { rejectWithValue }) => {
    try {
      return await surveyAPI.getSurveys(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch surveys');
    }
  }
);

export const scheduleSurvey = createAsyncThunk(
  'salesSurveys/scheduleSurvey',
  async (data, { rejectWithValue }) => {
    try {
      return await surveyAPI.scheduleSurvey(data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to schedule survey');
    }
  }
);

export const updateSurvey = createAsyncThunk(
  'salesSurveys/updateSurvey',
  async ({ id, patch }, { rejectWithValue }) => {
    try {
      return await surveyAPI.updateSurvey(id, patch);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update survey');
    }
  }
);

export const deleteSurvey = createAsyncThunk(
  'salesSurveys/deleteSurvey',
  async (id, { rejectWithValue }) => {
    try {
      return await surveyAPI.deleteSurvey(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete survey');
    }
  }
);

const surveySlice = createSlice({
  name: 'salesSurveys',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSurveys.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(scheduleSurvey.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateSurvey.fulfilled, (state, action) => {
        state.items = state.items.map((s) => (s.id === action.payload.id ? action.payload : s));
      })
      .addCase(deleteSurvey.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload.id);
      });
  },
});

export default surveySlice.reducer;

