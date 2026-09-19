import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}

interface UiState {
  isSidebarOpen: boolean;
  isQuickBatchModalOpen: boolean;
  toasts: ToastMessage[];
}

const initialState: UiState = {
  isSidebarOpen: true,
  isQuickBatchModalOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    openQuickBatchModal: (state) => {
      state.isQuickBatchModalOpen = true;
    },
    closeQuickBatchModal: (state) => {
      state.isQuickBatchModalOpen = false;
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, "id">>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openQuickBatchModal,
  closeQuickBatchModal,
  addToast,
  removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;
