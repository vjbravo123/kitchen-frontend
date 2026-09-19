import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import ingredientsReducer from "./slices/ingredientsSlice";
import inventoryReducer from "./slices/inventorySlice";
import recipesReducer from "./slices/recipesSlice";
import productionReducer from "./slices/productionSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ingredients: ingredientsReducer,
    inventory: inventoryReducer,
    recipes: recipesReducer,
    production: productionReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
