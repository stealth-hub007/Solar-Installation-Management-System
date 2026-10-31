import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import installationAPI from '../services/installationAPI';

export const submitCustomerSignoff = createAsyncThunk(
  'installationSignoff/submit',
  async ({ jobId, formData }, { rejectWithValue }) => {
    try {
      return await installationAPI.captureSignoff(jobId, formData);
    } catch (err) {
      return rejectWithValue(err.message || 'Customer sign-off submission failed');
    }
  }
);

const initialState = {
  signoffData: null,
  uploading: false,
  error: null,
};

const installationSignoffSlice = createSlice({
  name: 'installationSignoff',
  initialState,
  reducers: {
    clearSignoff: (state) => {
      state.signoffData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCustomerSignoff.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(submitCustomerSignoff.fulfilled, (state, action) => {
        state.uploading = false;
        state.signoffData = action.payload;
      })
      .addCase(submitCustomerSignoff.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSignoff } = installationSignoffSlice.actions;
export default installationSignoffSlice.reducer;
