import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseAPI from '../services/warehouseAPI';

export const fetchProducts = createAsyncThunk(
  'warehouseProducts/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      return await warehouseAPI.getProducts(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'warehouseProducts/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await warehouseAPI.getCategories();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch categories');
    }
  }
);

export const createProduct = createAsyncThunk(
  'warehouseProducts/createProduct',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await warehouseAPI.createProduct(payload);
      dispatch(fetchProducts());
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'warehouseProducts/updateProduct',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const res = await warehouseAPI.updateProduct(id, payload);
      dispatch(fetchProducts());
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'warehouseProducts/deleteProduct',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await warehouseAPI.deleteProduct(id);
      dispatch(fetchProducts());
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete product');
    }
  }
);

const initialState = {
  items: [],
  categories: [],
  total: 0,
  page: 1,
  size: 20,
  loading: false,
  mutating: false,
  error: null,
};

const warehouseProductSlice = createSlice({
  name: 'warehouseProducts',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        if (data.items) {
          state.items = data.items;
          state.total = data.total || data.items.length;
          state.page = data.page || 1;
        } else if (Array.isArray(data)) {
          state.items = data;
          state.total = data.length;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.mutating = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError } = warehouseProductSlice.actions;
export default warehouseProductSlice.reducer;
