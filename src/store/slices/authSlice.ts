import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  login as loginApi,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
} from "@/apis/auth";

interface User {
  email: string;
  id: number;
  company_id: number;
  fname: string;
  lname: string;
  user_type: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk<
  LoginResponse & { user?: User; refresh_token?: string },
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await loginApi(payload);
    return response as LoginResponse & { user?: User; refresh_token?: string };
  } catch (error: any) {
    const message = error?.message || "Unable to sign in. Please try again.";
    return rejectWithValue(message);
  }
});

type AuthPayload = {
  access_token: string | null;
  refresh_token: string | null;
  user: User | null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.error = null;
    },
    setAuthCredentials(
      state,
      action: PayloadAction<AuthPayload | RefreshResponse>,
    ) {
      state.accessToken = action.payload.access_token ?? null;
      state.refreshToken = action.payload.refresh_token ?? null;
      state.user = (action.payload as RefreshResponse).user ?? state.user;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (
          state,
          action: PayloadAction<
            LoginResponse & { user?: User; refresh_token?: string }
          >,
        ) => {
          state.loading = false;
          state.accessToken = action.payload.access_token ?? null;
          state.refreshToken = action.payload.refresh_token ?? null;
          state.user = (action.payload.user as User | undefined) ?? null;
        },
      )
      .addCase(
        loginThunk.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error =
            action.payload || "Unable to sign in. Please try again.";
        },
      );
  },
});

export const { logout, setAuthCredentials } = authSlice.actions;
export default authSlice.reducer;


