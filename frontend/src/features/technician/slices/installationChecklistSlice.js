import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import installationAPI from '../services/installationAPI';

export const updateInstallationChecklist = createAsyncThunk(
  'installationChecklist/update',
  async ({ jobId, checklist }, { rejectWithValue }) => {
    try {
      return await installationAPI.updateChecklist(jobId, checklist);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update checklist');
    }
  }
);

const initialState = {
  checklist: {},
  loading: false,
  error: null,
};

const installationChecklistSlice = createSlice({
  name: 'installationChecklist',
  initialState,
  reducers: {
    setLocalChecklist: (state, action) => {
      state.checklist = action.payload;
    },
    toggleChecklistItem: (state, action) => {
      const key = action.payload;
      state.checklist[key] = !state.checklist[key];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateInstallationChecklist.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInstallationChecklist.fulfilled, (state, action) => {
        state.loading = false;
        state.checklist = action.payload;
      })
      .addCase(updateInstallationChecklist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLocalChecklist, toggleChecklistItem } = installationChecklistSlice.actions;
export default installationChecklistSlice.reducer;
