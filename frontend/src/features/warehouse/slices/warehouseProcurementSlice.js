import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseAPI from '../services/warehouseAPI';

// Suppliers
export const fetchSuppliers = createAsyncThunk('warehouseProcurement/fetchSuppliers', async () => {
  return warehouseAPI.getSuppliers();
});

export const saveSupplier = createAsyncThunk('warehouseProcurement/saveSupplier', async (supplier) => {
  return warehouseAPI.saveSupplier(supplier);
});

export const deleteSupplier = createAsyncThunk('warehouseProcurement/deleteSupplier', async (id) => {
  return warehouseAPI.deleteSupplier(id);
});

// Purchases
export const fetchPurchases = createAsyncThunk('warehouseProcurement/fetchPurchases', async () => {
  return warehouseAPI.getPurchases();
});

export const savePurchase = createAsyncThunk('warehouseProcurement/savePurchase', async (purchase) => {
  return warehouseAPI.savePurchase(purchase);
});

export const deletePurchase = createAsyncThunk('warehouseProcurement/deletePurchase', async (id) => {
  return warehouseAPI.deletePurchase(id);
});

// Receipts
export const fetchReceipts = createAsyncThunk('warehouseProcurement/fetchReceipts', async () => {
  return warehouseAPI.getReceipts();
});

export const saveReceipt = createAsyncThunk('warehouseProcurement/saveReceipt', async (receipt) => {
  return warehouseAPI.saveReceipt(receipt);
});

export const deleteReceipt = createAsyncThunk('warehouseProcurement/deleteReceipt', async (id) => {
  return warehouseAPI.deleteReceipt(id);
});

// Transfers
export const fetchTransfers = createAsyncThunk('warehouseProcurement/fetchTransfers', async () => {
  return warehouseAPI.getTransfers();
});

export const saveTransfer = createAsyncThunk('warehouseProcurement/saveTransfer', async (transfer) => {
  return warehouseAPI.saveTransfer(transfer);
});

export const deleteTransfer = createAsyncThunk('warehouseProcurement/deleteTransfer', async (id) => {
  return warehouseAPI.deleteTransfer(id);
});

const initialState = {
  suppliers: [],
  purchases: [],
  receipts: [],
  transfers: [],
  loading: false,
  error: null,
};

const warehouseProcurementSlice = createSlice({
  name: 'warehouseProcurement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Suppliers
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      .addCase(saveSupplier.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      // Purchases
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.purchases = action.payload;
      })
      .addCase(savePurchase.fulfilled, (state, action) => {
        state.purchases = action.payload;
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.purchases = action.payload;
      })
      // Receipts
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.receipts = action.payload;
      })
      .addCase(saveReceipt.fulfilled, (state, action) => {
        state.receipts = action.payload;
      })
      .addCase(deleteReceipt.fulfilled, (state, action) => {
        state.receipts = action.payload;
      })
      // Transfers
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.transfers = action.payload;
      })
      .addCase(saveTransfer.fulfilled, (state, action) => {
        state.transfers = action.payload;
      })
      .addCase(deleteTransfer.fulfilled, (state, action) => {
        state.transfers = action.payload;
      });
  },
});

export default warehouseProcurementSlice.reducer;
