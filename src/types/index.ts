export interface Vendor {
  _id: string;
  name: string;
  email: string;
  businessName: string;
  phone?: string;
  currency?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  _id: string;
  name: string;
  unit: string;
  purchasePrice: number;
  purchaseQuantity: number;
  currentQuantity: number;
  baseUnit: string;
  costPerBaseUnit: number;
  costPerPurchaseUnit?: number;
  currentQuantityInUnit?: number;
  minimumStockLevel?: number;
  minimumStockUnit?: string;
  isLowStock?: boolean;
  stockValue?: number;
  supplier?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistoryItem {
  _id: string;
  ingredient: string;
  previousCostPerBaseUnit: number;
  newCostPerBaseUnit: number;
  source: "CREATE" | "MANUAL_UPDATE" | "PURCHASE";
  note?: string;
  createdAt: string;
}

export interface InventoryTransaction {
  _id: string;
  ingredient: {
    _id: string;
    name: string;
    unit: string;
    baseUnit: string;
  };
  type:
    | "OPENING_STOCK"
    | "PURCHASE"
    | "PRODUCTION_CONSUMPTION"
    | "WASTAGE"
    | "ADJUSTMENT"
    | "PRODUCTION_REVERSAL";
  quantity: number;
  baseQuantity: number;
  unit: string;
  quantityBefore: number;
  quantityAfter: number;
  costPerBaseUnit: number;
  totalCost: number;
  reason?: string;
  createdAt: string;
}

export interface StockValuation {
  totalStockValue: number;
  ingredientCount: number;
  breakdown: Array<{
    ingredientId: string;
    name: string;
    quantity: number;
    unit: string;
    costPerBaseUnit: number;
    stockValue: number;
  }>;
}

export interface RecipeItem {
  ingredient: {
    _id: string;
    name: string;
    unit: string;
    baseUnit: string;
    costPerBaseUnit: number;
    currentQuantity: number;
    isActive?: boolean;
  } | string;
  quantity: number;
  unit: string;
  baseQuantity: number;
  note?: string;
}

export type WastageType = "NONE" | "FIXED" | "PERCENTAGE";
export type WastageBasis = "INGREDIENT" | "SUBTOTAL";

export interface Recipe {
  _id: string;
  name: string;
  description?: string;
  baseServings: number;
  servingUnit: string;
  items: RecipeItem[];
  packagingCost: number;
  laborCost: number;
  utilityCost: number;
  wastageType: WastageType;
  wastageValue: number;
  wastageBasis: WastageBasis;
  sellingPrice?: number;
  scaleOverheads: boolean;
  isActive: boolean;
  cost?: RecipeCostBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface CostLine {
  ingredientId: string;
  name: string;
  recipeQuantity: number;
  recipeUnit: string;
  requiredQuantity: number;
  baseUnit: string;
  costPerBaseUnit: number;
  lineCost: number;
  availableQuantity: number;
  shortage: number;
  isSufficient: boolean;
}

export interface RecipeCostBreakdown {
  recipeId: string;
  recipeName: string;
  baseServings: number;
  servings: number;
  servingUnit: string;
  scaleFactor: number;
  lines: CostLine[];
  ingredientCost: number;
  packagingCost: number;
  laborCost: number;
  utilityCost: number;
  wastageCost: number;
  wastage: {
    type: WastageType;
    value: number;
    basis: WastageBasis;
  };
  totalCost: number;
  costPerServing: number;
  sellingPrice?: number;
  sellingPricePerServing?: number;
  profit?: number;
  profitPerServing?: number;
  profitMarginPercent?: number;
  markupPercent?: number;
  breakEvenPrice: number;
  canProduce: boolean;
  missingIngredients: string[];
  maxProducibleServings: number;
  pricedAt: string;
}

export interface ProductionItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  baseUnit: string;
  costPerBaseUnit: number;
  lineCost: number;
}

export interface ProductionRecord {
  _id: string;
  recipe: {
    _id: string;
    name: string;
    servingUnit: string;
  };
  recipeName: string;
  servings: number;
  scaleFactor: number;
  items: ProductionItem[];
  ingredientCost: number;
  packagingCost: number;
  laborCost: number;
  utilityCost: number;
  wastageCost: number;
  totalCost: number;
  costPerServing: number;
  sellingPrice: number;
  profit: number;
  profitMarginPercent: number;
  status: "COMPLETED" | "CANCELLED";
  notes?: string;
  preparedAt: string;
  createdAt: string;
}

export interface ProductionSummary {
  period: {
    from: string;
    to: string;
  };
  totals: {
    batches: number;
    servings: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    overallMarginPercent: number;
  };
  byRecipe: Array<{
    recipeId: string;
    recipeName: string;
    batches: number;
    servings: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    marginPercent: number;
  }>;
}
