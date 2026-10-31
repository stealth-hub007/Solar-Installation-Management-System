import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerAPI from '../services/customerAPI';

export const fetchCustomers = createAsyncThunk(
  'salesCustomers/fetchCustomers',
  async (params, { rejectWithValue }) => {
    try {
      return await customerAPI.getCustomers(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch customers');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'salesCustomers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      return await customerAPI.createCustomer(customerData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'salesCustomers/updateCustomer',
  async ({ id, patch }, { rejectWithValue }) => {
    try {
      return await customerAPI.updateCustomer(id, patch);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'salesCustomers/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      return await customerAPI.deleteCustomer(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete customer');
    }
  }
);

const customerSlice = createSlice({
  name: 'salesCustomers',
  initialState: {
    items: [],
    selectedCustomer: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.items = state.items.map((c) => (c.id === action.payload.id ? action.payload : c));
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload.id);
      });
  },
});

export const { setSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;

