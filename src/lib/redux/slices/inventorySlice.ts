import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/client";
import { Ingredient, InventoryTransaction, StockValuation } from "@/types";

interface InventoryState {
  transactions: InventoryTransaction[];
  transactionsMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  valuation: StockValuation | null;
  lowStockItems: Ingredient[];
  isLoading: boolean;
  isValuationLoading: boolean;
  error: string | null;
  transactionTypeFilter: string;
}

const initialState: InventoryState = {
  transactions: [],
  transactionsMeta: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  },
  valuation: null,
  lowStockItems: [],
  isLoading: false,
  isValuationLoading: false,
  error: null,
  transactionTypeFilter: "",
};

export const fetchTransactions = createAsyncThunk<
  any,
  {
    ingredientId?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  } | void
>(
  "inventory/fetchTransactions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/inventory/transactions", { params: params || {} });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load transactions");
    }
  }
);

export const fetchValuation = createAsyncThunk(
  "inventory/fetchValuation",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/inventory/valuation");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load inventory valuation");
    }
  }
);

export const fetchLowStock = createAsyncThunk(
  "inventory/fetchLowStock",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/inventory/low-stock");
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load low stock ingredients");
    }
  }
);

export const recordPurchase = createAsyncThunk(
  "inventory/recordPurchase",
  async (
    data: {
      ingredientId: string;
      quantity: number;
      unit?: string;
      totalCost?: number;
      updatePrice?: boolean;
      note?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/inventory/purchase", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to record purchase");
    }
  }
);

export const recordAdjustment = createAsyncThunk(
  "inventory/recordAdjustment",
  async (
    data: {
      ingredientId: string;
      quantity: number;
      unit?: string;
      reason: string;
      allowNegative?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/inventory/adjust", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to record adjustment");
    }
  }
);

export const recordWastage = createAsyncThunk(
  "inventory/recordWastage",
  async (
    data: {
      ingredientId: string;
      quantity: number;
      unit?: string;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/inventory/wastage", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to record wastage");
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setTransactionTypeFilter: (state, action: PayloadAction<string>) => {
      state.transactionTypeFilter = action.payload;
    },
    clearInventoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.items;
        state.transactionsMeta = action.payload.meta;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Valuation
    builder
      .addCase(fetchValuation.pending, (state) => {
        state.isValuationLoading = true;
      })
      .addCase(fetchValuation.fulfilled, (state, action) => {
        state.isValuationLoading = false;
        state.valuation = action.payload;
      })
      .addCase(fetchValuation.rejected, (state) => {
        state.isValuationLoading = false;
      });

    // Low Stock
    builder.addCase(fetchLowStock.fulfilled, (state, action) => {
      state.lowStockItems = action.payload;
    });
  },
});

export const { setTransactionTypeFilter, clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;
