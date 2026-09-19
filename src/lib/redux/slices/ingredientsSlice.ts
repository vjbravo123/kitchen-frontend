import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/client";
import { Ingredient, PriceHistoryItem } from "@/types";

interface IngredientsState {
  items: Ingredient[];
  selectedIngredient: Ingredient | null;
  priceHistory: PriceHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  isHistoryLoading: boolean;
  error: string | null;
  searchQuery: string;
  lowStockFilter: boolean;
}

const initialState: IngredientsState = {
  items: [],
  selectedIngredient: null,
  priceHistory: [],
  meta: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  },
  isLoading: false,
  isHistoryLoading: false,
  error: null,
  searchQuery: "",
  lowStockFilter: false,
};

export const fetchIngredients = createAsyncThunk<
  any,
  {
    page?: number;
    limit?: number;
    search?: string;
    lowStock?: boolean;
    isActive?: boolean;
  } | void
>(
  "ingredients/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/ingredients", { params: params || {} });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load ingredients");
    }
  }
);

export const createIngredient = createAsyncThunk(
  "ingredients/create",
  async (
    data: {
      name: string;
      unit: string;
      purchasePrice: number;
      purchaseQuantity: number;
      openingQuantity?: number;
      openingQuantityUnit?: string;
      minimumStockLevel?: number;
      minimumStockUnit?: string;
      supplier?: string;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/ingredients", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create ingredient");
    }
  }
);

export const updateIngredient = createAsyncThunk(
  "ingredients/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        unit?: string;
        minimumStockLevel?: number;
        minimumStockUnit?: string;
        supplier?: string;
        notes?: string;
        isActive?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/ingredients/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update ingredient");
    }
  }
);

export const updateIngredientPrice = createAsyncThunk(
  "ingredients/updatePrice",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        purchasePrice: number;
        purchaseQuantity: number;
        unit: string;
        note?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/ingredients/${id}/price`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update price");
    }
  }
);

export const fetchPriceHistory = createAsyncThunk(
  "ingredients/fetchPriceHistory",
  async (ingredientId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/ingredients/${ingredientId}/price-history`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load price history");
    }
  }
);

export const deleteIngredient = createAsyncThunk(
  "ingredients/delete",
  async ({ id, force = false }: { id: string; force?: boolean }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/ingredients/${id}`, { params: { force } });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete ingredient");
    }
  }
);

const ingredientsSlice = createSlice({
  name: "ingredients",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLowStockFilter: (state, action: PayloadAction<boolean>) => {
      state.lowStockFilter = action.payload;
    },
    setSelectedIngredient: (state, action: PayloadAction<Ingredient | null>) => {
      state.selectedIngredient = action.payload;
    },
    clearIngredientsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder.addCase(createIngredient.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.meta.total += 1;
    });

    // Update
    builder.addCase(updateIngredient.fulfilled, (state, action) => {
      const index = state.items.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedIngredient?._id === action.payload._id) {
        state.selectedIngredient = action.payload;
      }
    });

    // Update Price
    builder.addCase(updateIngredientPrice.fulfilled, (state, action) => {
      const updated = action.payload.ingredient;
      const index = state.items.findIndex((i) => i._id === updated._id);
      if (index !== -1) {
        state.items[index] = updated;
      }
      if (state.selectedIngredient?._id === updated._id) {
        state.selectedIngredient = updated;
      }
    });

    // Price History
    builder
      .addCase(fetchPriceHistory.pending, (state) => {
        state.isHistoryLoading = true;
      })
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.isHistoryLoading = false;
        state.priceHistory = action.payload;
      })
      .addCase(fetchPriceHistory.rejected, (state) => {
        state.isHistoryLoading = false;
      });

    // Delete
    builder.addCase(deleteIngredient.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.meta.total = Math.max(0, state.meta.total - 1);
    });
  },
});

export const {
  setSearchQuery,
  setLowStockFilter,
  setSelectedIngredient,
  clearIngredientsError,
} = ingredientsSlice.actions;
export default ingredientsSlice.reducer;
