import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quotationAPI from '../services/quotationAPI';

export const fetchQuotations = createAsyncThunk(
  'salesQuotations/fetchQuotations',
  async (params, { rejectWithValue }) => {
    try {
      return await quotationAPI.getQuotations(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch quotations');
    }
  }
);

export const createQuotation = createAsyncThunk(
  'salesQuotations/createQuotation',
  async (data, { rejectWithValue }) => {
    try {
      return await quotationAPI.createQuotation(data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create quotation');
    }
  }
);

export const updateQuotation = createAsyncThunk(
  'salesQuotations/updateQuotation',
  async ({ id, patch }, { rejectWithValue }) => {
    try {
      return await quotationAPI.updateQuotation(id, patch);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update quotation');
    }
  }
);

export const approveQuotation = createAsyncThunk(
  'salesQuotations/approveQuotation',
  async (id, { rejectWithValue }) => {
    try {
      return await quotationAPI.approveQuotation(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to approve quotation');
    }
  }
);

export const acceptQuotation = createAsyncThunk(
  'salesQuotations/acceptQuotation',
  async ({ id, convertToOrder }, { rejectWithValue }) => {
    try {
      return await quotationAPI.acceptQuotation(id, convertToOrder);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to accept quotation');
    }
  }
);

export const deleteQuotation = createAsyncThunk(
  'salesQuotations/deleteQuotation',
  async (id, { rejectWithValue }) => {
    try {
      return await quotationAPI.deleteQuotation(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete quotation');
    }
  }
);

const quotationSlice = createSlice({
  name: 'salesQuotations',
  initialState: {
    items: [],
    selectedQuotation: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedQuotation: (state, action) => {
      state.selectedQuotation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        state.items = state.items.map((q) => (q.id === action.payload.id ? action.payload : q));
      })
      .addCase(approveQuotation.fulfilled, (state, action) => {
        state.items = state.items.map((q) => (q.id === action.payload.id ? action.payload : q));
      })
      .addCase(acceptQuotation.fulfilled, (state, action) => {
        state.items = state.items.map((q) => (q.id === action.payload.id ? action.payload : q));
      })
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q.id !== action.payload.id);
      });
  },
});

export const { setSelectedQuotation } = quotationSlice.actions;
export default quotationSlice.reducer;
