import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import equipmentAPI from '../services/equipmentAPI';

export const lookupEquipmentSerial = createAsyncThunk(
  'equipmentVerification/lookup',
  async (serialNumber, { rejectWithValue }) => {
    try {
      return await equipmentAPI.lookupSerial(serialNumber);
    } catch (err) {
      return rejectWithValue(err.message || 'Serial number verification failed');
    }
  }
);

const initialState = {
  verifiedItems: {},
  lookupResult: null,
  loading: false,
  error: null,
};

const equipmentVerificationSlice = createSlice({
  name: 'equipmentVerification',
  initialState,
  reducers: {
    recordVerifiedSerial: (state, action) => {
      const { equipmentId, serialNumber } = action.payload;
      state.verifiedItems[equipmentId] = {
        serialNumber,
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
      };
    },
    flagEquipmentMismatch: (state, action) => {
      const { equipmentId, reason } = action.payload;
      state.verifiedItems[equipmentId] = {
        status: 'MISMATCH',
        reason,
        flaggedAt: new Date().toISOString(),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(lookupEquipmentSerial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(lookupEquipmentSerial.fulfilled, (state, action) => {
        state.loading = false;
        state.lookupResult = action.payload;
      })
      .addCase(lookupEquipmentSerial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { recordVerifiedSerial, flagEquipmentMismatch } = equipmentVerificationSlice.actions;
export default equipmentVerificationSlice.reducer;

