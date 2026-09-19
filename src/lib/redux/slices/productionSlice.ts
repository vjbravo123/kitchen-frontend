import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/client";
import { ProductionRecord, ProductionSummary } from "@/types";

interface ProductionState {
  records: ProductionRecord[];
  selectedRecord: ProductionRecord | null;
  summary: ProductionSummary | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  isSummaryLoading: boolean;
  error: string | null;
}

const initialState: ProductionState = {
  records: [],
  selectedRecord: null,
  summary: null,
  meta: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  },
  isLoading: false,
  isSummaryLoading: false,
  error: null,
};

export const fetchProductionList = createAsyncThunk<
  any,
  {
    recipeId?: string;
    status?: "COMPLETED" | "CANCELLED";
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  } | void
>(
  "production/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/production", { params: params || {} });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load production records");
    }
  }
);

export const fetchProductionSummary = createAsyncThunk<
  any,
  { from?: string; to?: string } | void
>(
  "production/fetchSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/production/summary", { params: params || {} });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load production summary");
    }
  }
);

export const fetchProductionById = createAsyncThunk(
  "production/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/production/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load production details");
    }
  }
);

export const prepareRecipe = createAsyncThunk(
  "production/prepare",
  async (
    {
      recipeId,
      data,
    }: {
      recipeId: string;
      data: {
        servings: number;
        sellingPrice?: number;
        notes?: string;
        preparedAt?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(`/recipes/${recipeId}/prepare`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to prepare recipe batch");
    }
  }
);

export const cancelProduction = createAsyncThunk(
  "production/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/production/${id}/cancel`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to cancel batch");
    }
  }
);

const productionSlice = createSlice({
  name: "production",
  initialState,
  reducers: {
    setSelectedRecord: (state, action: PayloadAction<ProductionRecord | null>) => {
      state.selectedRecord = action.payload;
    },
    clearProductionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // List
    builder
      .addCase(fetchProductionList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductionList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProductionList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Summary
    builder
      .addCase(fetchProductionSummary.pending, (state) => {
        state.isSummaryLoading = true;
      })
      .addCase(fetchProductionSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchProductionSummary.rejected, (state) => {
        state.isSummaryLoading = false;
      });

    // Prepare
    builder.addCase(prepareRecipe.fulfilled, (state, action) => {
      if (action.payload.production) {
        state.records.unshift(action.payload.production);
        state.meta.total += 1;
      }
    });

    // Cancel
    builder.addCase(cancelProduction.fulfilled, (state, action) => {
      const cancelled = action.payload;
      const index = state.records.findIndex((r) => r._id === cancelled._id);
      if (index !== -1) {
        state.records[index] = cancelled;
      }
      if (state.selectedRecord?._id === cancelled._id) {
        state.selectedRecord = cancelled;
      }
    });
  },
});

export const { setSelectedRecord, clearProductionError } = productionSlice.actions;
export default productionSlice.reducer;
