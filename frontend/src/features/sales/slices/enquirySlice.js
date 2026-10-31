import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import enquiryAPI from '../services/enquiryAPI';

export const fetchEnquiries = createAsyncThunk(
  'salesEnquiries/fetchEnquiries',
  async (params, { rejectWithValue }) => {
    try {
      return await enquiryAPI.getEnquiries(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch enquiries');
    }
  }
);

export const createEnquiry = createAsyncThunk(
  'salesEnquiries/createEnquiry',
  async (enquiryData, { rejectWithValue }) => {
    try {
      return await enquiryAPI.createEnquiry(enquiryData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create enquiry');
    }
  }
);

export const updateEnquiryStatus = createAsyncThunk(
  'salesEnquiries/updateEnquiryStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await enquiryAPI.updateEnquiryStatus(id, status);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update enquiry status');
    }
  }
);

export const deleteEnquiry = createAsyncThunk(
  'salesEnquiries/deleteEnquiry',
  async (id, { rejectWithValue }) => {
    try {
      return await enquiryAPI.deleteEnquiry(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete enquiry');
    }
  }
);

const enquirySlice = createSlice({
  name: 'salesEnquiries',
  initialState: {
    items: [],
    selectedEnquiry: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedEnquiry: (state, action) => {
      state.selectedEnquiry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateEnquiryStatus.fulfilled, (state, action) => {
        state.items = state.items.map((e) => (e.id === action.payload.id ? action.payload : e));
      })
      .addCase(deleteEnquiry.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload.id);
      });
  },
});

export const { setSelectedEnquiry } = enquirySlice.actions;
export default enquirySlice.reducer;

