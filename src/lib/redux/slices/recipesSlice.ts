import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/client";
import { Recipe, RecipeCostBreakdown, WastageBasis, WastageType } from "@/types";

interface RecipesState {
  items: Recipe[];
  selectedRecipe: Recipe | null;
  activeCostBreakdown: RecipeCostBreakdown | null;
  scaledCost: {
    recipe: Recipe;
    cost: RecipeCostBreakdown;
    scaledItems: Array<{
      ingredientId: string;
      name: string;
      originalQuantity: number;
      scaledQuantity: number;
      unit: string;
      baseUnit: string;
    }>;
  } | null;
  availability: {
    canProduce: boolean;
    maxProducibleServings: number;
    missingIngredients: string[];
    breakdown: Array<{
      ingredientId: string;
      name: string;
      requiredQuantity: number;
      availableQuantity: number;
      shortage: number;
      unit: string;
      isSufficient: boolean;
    }>;
  } | null;
  suggestedPrice: {
    targetMarginPercent: number;
    suggestedSellingPrice: number;
    currentSellingPrice?: number;
    currentMarginPercent?: number;
    totalCost: number;
    costPerServing: number;
    breakEvenPrice: number;
  } | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  isCostLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: RecipesState = {
  items: [],
  selectedRecipe: null,
  activeCostBreakdown: null,
  scaledCost: null,
  availability: null,
  suggestedPrice: null,
  meta: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  },
  isLoading: false,
  isCostLoading: false,
  error: null,
  searchQuery: "",
};

export const fetchRecipes = createAsyncThunk<
  any,
  {
    search?: string;
    isActive?: boolean;
    withCost?: boolean;
    page?: number;
    limit?: number;
  } | void
>(
  "recipes/fetchAll",
  async (params = { withCost: true }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/recipes", { params: params || { withCost: true } });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load recipes");
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  "recipes/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/recipes/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load recipe details");
    }
  }
);

export const createRecipe = createAsyncThunk(
  "recipes/create",
  async (
    data: {
      name: string;
      description?: string;
      baseServings: number;
      servingUnit?: string;
      items: Array<{
        ingredientId: string;
        quantity: number;
        unit: string;
        note?: string;
      }>;
      packagingCost?: number;
      laborCost?: number;
      utilityCost?: number;
      wastageType?: WastageType;
      wastageValue?: number;
      wastageBasis?: WastageBasis;
      sellingPrice?: number;
      scaleOverheads?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/recipes", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create recipe");
    }
  }
);

export const updateRecipe = createAsyncThunk(
  "recipes/update",
  async (
    { id, data }: { id: string; data: Partial<Recipe> },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/recipes/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update recipe");
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/recipes/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to archive recipe");
    }
  }
);

export const fetchRecipeCost = createAsyncThunk(
  "recipes/fetchCost",
  async (
    {
      id,
      servings,
      sellingPrice,
    }: {
      id: string;
      servings?: number;
      sellingPrice?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const params: any = {};
      if (servings !== undefined) params.servings = servings;
      if (sellingPrice !== undefined) params.sellingPrice = sellingPrice;

      const res = await apiClient.get(`/recipes/${id}/cost`, { params });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to compute recipe cost");
    }
  }
);

export const scaleRecipe = createAsyncThunk(
  "recipes/scale",
  async (
    { id, servings }: { id: string; servings: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(`/recipes/${id}/scale`, { servings });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to scale recipe");
    }
  }
);

export const fetchRecipeAvailability = createAsyncThunk(
  "recipes/fetchAvailability",
  async (
    { id, servings }: { id: string; servings?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.get(`/recipes/${id}/availability`, {
        params: servings ? { servings } : undefined,
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to check stock availability");
    }
  }
);

export const suggestRecipePrice = createAsyncThunk(
  "recipes/suggestPrice",
  async (
    {
      id,
      targetMarginPercent,
      servings,
    }: {
      id: string;
      targetMarginPercent: number;
      servings?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(`/costing/recipes/${id}/suggest-price`, {
        targetMarginPercent,
        servings,
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to suggest price");
    }
  }
);

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.selectedRecipe = action.payload;
    },
    clearRecipesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // List
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Single
    builder
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.selectedRecipe = action.payload;
      });

    // Create
    builder.addCase(createRecipe.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.meta.total += 1;
    });

    // Update
    builder.addCase(updateRecipe.fulfilled, (state, action) => {
      const index = state.items.findIndex((r) => r._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedRecipe?._id === action.payload._id) {
        state.selectedRecipe = action.payload;
      }
    });

    // Delete
    builder.addCase(deleteRecipe.fulfilled, (state, action) => {
      state.items = state.items.filter((r) => r._id !== action.payload);
      state.meta.total = Math.max(0, state.meta.total - 1);
    });

    // Cost Breakdown
    builder
      .addCase(fetchRecipeCost.pending, (state) => {
        state.isCostLoading = true;
      })
      .addCase(fetchRecipeCost.fulfilled, (state, action) => {
        state.isCostLoading = false;
        state.activeCostBreakdown = action.payload;
      })
      .addCase(fetchRecipeCost.rejected, (state) => {
        state.isCostLoading = false;
      });

    // Scaled
    builder.addCase(scaleRecipe.fulfilled, (state, action) => {
      state.scaledCost = action.payload;
      state.activeCostBreakdown = action.payload.cost;
    });

    // Availability
    builder.addCase(fetchRecipeAvailability.fulfilled, (state, action) => {
      state.availability = action.payload;
    });

    // Price Suggestion
    builder.addCase(suggestRecipePrice.fulfilled, (state, action) => {
      state.suggestedPrice = action.payload;
    });
  },
});

export const { setSearchQuery, setSelectedRecipe, clearRecipesError } =
  recipesSlice.actions;
export default recipesSlice.reducer;
