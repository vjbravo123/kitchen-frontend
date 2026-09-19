import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api/client";
import { Vendor } from "@/types";

interface AuthState {
  vendor: Vendor | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpPendingEmail: string | null;
}

const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("kitchen_token");
  }
  return null;
};

const initialState: AuthState = {
  vendor: null,
  token: getInitialToken(),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpPendingEmail: null,
};

// Async Thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/login", credentials);
      const { vendor, accessToken } = res.data.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("kitchen_token", accessToken);
      }
      return { vendor, token: accessToken };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to login");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string; businessName: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/auth/register", data);
      return { email: data.email, message: res.data.message };
    } catch (err: any) {
      return rejectWithValue(err.message || "Registration failed");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/verify-otp", data);
      const { vendor, accessToken } = res.data.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("kitchen_token", accessToken);
      }
      return { vendor, token: accessToken };
    } catch (err: any) {
      return rejectWithValue(err.message || "Invalid or expired OTP");
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/resend-otp", { email });
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to resend OTP");
    }
  }
);

export const getMe = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/auth/me");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch user");
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    data: { name?: string; businessName?: string; phone?: string; currency?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch("/vendors/me", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update profile");
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    passwords: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch("/vendors/me/password", passwords);
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to change password");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/auth/forgot-password", { email });
      return { email, message: res.data.message };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to request password reset");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { email: string; otp: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/auth/reset-password", payload);
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to reset password");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.vendor = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpPendingEmail = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("kitchen_token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setOtpPendingEmail: (state, action: PayloadAction<string | null>) => {
      state.otpPendingEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.vendor = action.payload.vendor;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpPendingEmail = action.payload.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.vendor = action.payload.vendor;
        state.token = action.payload.token;
        state.otpPendingEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.vendor = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("kitchen_token");
        }
      });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.vendor = action.payload;
    });
  },
});

export const { logout, clearError, setOtpPendingEmail } = authSlice.actions;
export default authSlice.reducer;
