import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseAPI from '../services/warehouseAPI';

export const fetchDispatches = createAsyncThunk('warehouseDispatch/fetchDispatches', async (_, { rejectWithValue }) => {
  try {
    return await warehouseAPI.getDispatches();
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch dispatches');
  }
});

export const createDispatch = createAsyncThunk('warehouseDispatch/createDispatch', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await warehouseAPI.createDispatch(payload);
    dispatch(fetchDispatches());
    return res;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create dispatch');
  }
});

export const confirmDelivery = createAsyncThunk('warehouseDispatch/confirmDelivery', async ({ dispatchId, payload }, { dispatch, rejectWithValue }) => {
  try {
    const res = await warehouseAPI.confirmDelivery(dispatchId, payload);
    dispatch(fetchDispatches());
    return res;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to confirm delivery');
  }
});

export const registerSerials = createAsyncThunk('warehouseDispatch/registerSerials', async (payload, { rejectWithValue }) => {
  try {
    return await warehouseAPI.registerSerials(payload);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to register serial numbers');
  }
});

export const lookupSerial = createAsyncThunk('warehouseDispatch/lookupSerial', async (serialNumber, { rejectWithValue }) => {
  try {
    return await warehouseAPI.lookupSerial(serialNumber);
  } catch (err) {
    return rejectWithValue(err.message || 'Serial number not found');
  }
});

export const fetchConfirmedOrders = createAsyncThunk('warehouseDispatch/fetchConfirmedOrders', async (_, { rejectWithValue }) => {
  try {
    return await warehouseAPI.getConfirmedOrders();
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch confirmed orders');
  }
});

const initialState = {
  dispatches: [],
  confirmedOrders: [],
  searchedSerial: null,
  loading: false,
  mutating: false,
  error: null,
  successMessage: null,
};

const warehouseDispatchSlice = createSlice({
  name: 'warehouseDispatch',
  initialState,
  reducers: {
    clearDispatchStatus: (state) => {
      state.error = null;
      state.successMessage = null;
      state.searchedSerial = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDispatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDispatches.fulfilled, (state, action) => {
        state.loading = false;
        state.dispatches = action.payload;
      })
      .addCase(fetchDispatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDispatch.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(createDispatch.fulfilled, (state) => {
        state.mutating = false;
        state.successMessage = 'Dispatch order created and inventory deducted successfully.';
      })
      .addCase(createDispatch.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(confirmDelivery.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(confirmDelivery.fulfilled, (state) => {
        state.mutating = false;
        state.successMessage = 'Equipment delivery verified and warranties activated automatically.';
      })
      .addCase(confirmDelivery.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(lookupSerial.pending, (state) => {
        state.searchedSerial = null;
        state.error = null;
      })
      .addCase(lookupSerial.fulfilled, (state, action) => {
        state.searchedSerial = action.payload;
      })
      .addCase(lookupSerial.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchConfirmedOrders.fulfilled, (state, action) => {
        state.confirmedOrders = action.payload;
      });
  },
});

export const { clearDispatchStatus } = warehouseDispatchSlice.actions;
export default warehouseDispatchSlice.reducer;

