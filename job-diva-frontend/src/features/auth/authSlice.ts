import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";
import { LoginCredentials, RegisterData, AuthState } from "../../types/auth.types";

// ✅ Initial state with localStorage token check
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken") || null, // ✅ Refresh pe token maintain hoga
  isAuthenticated: !!localStorage.getItem("accessToken"), // ✅ Refresh pe login state maintain hoga
  loading: true,
  error: null,
};

// ✅ Utility functions for pending & rejected states
const handlePending = (state: AuthState) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state: AuthState, action: any) => {
  state.loading = false;
  state.error = action.payload as string;
};

// ✅ Login Action
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// ✅ Signup Action
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

// ✅ Logout Action
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authAPI.logout();
  localStorage.removeItem("accessToken");
  return null;
});

// ✅ Refresh Token Action
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refresh();
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Token refresh failed");
    }
  }
);

// ✅ Create Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Login
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })

      // ✅ Signup
      .addCase(signupUser.pending, handlePending)
      .addCase(signupUser.rejected, handleRejected)
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })

      // ✅ Refresh Token
      .addCase(refreshToken.pending, handlePending)
      .addCase(refreshToken.rejected, handleRejected)
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })

      // ✅ Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setAuthenticated,setLoading } = authSlice.actions;
export default authSlice.reducer;
