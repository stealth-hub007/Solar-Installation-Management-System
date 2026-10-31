import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from './authAPI';

// Helper to safely load stored user
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('sims_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialToken = localStorage.getItem('sims_auth_token');
const initialUser = getStoredUser();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  accountStatus: initialUser?.account_status || (initialToken ? 'APPROVED' : null),
  role: initialUser?.role || null,
  permissions: initialUser?.permissions || [],
  loading: false,
  error: null,
  registrationSuccess: false,
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authAPI.login(credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Authentication failed. Please verify your credentials.');
    }
  }
);

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authAPI.register(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed. Please check the inputs.');
    }
  }
);

// Async thunk for Google login
export const googleLoginUser = createAsyncThunk(
  'auth/googleLoginUser',
  async (googlePayload, { rejectWithValue }) => {
    try {
      const data = await authAPI.googleAuth(googlePayload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Google authentication failed.');
    }
  }
);

// Async thunk to fetch current user profile
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authAPI.getCurrentUser();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch user profile.');
    }
  }
);

// Async thunk to refresh account status
export const refreshAccountStatus = createAsyncThunk(
  'auth/refreshAccountStatus',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authAPI.checkStatus();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to check account status.');
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await authAPI.logout();
    localStorage.removeItem('sims_auth_token');
    localStorage.removeItem('sims_auth_user');
    return true;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetRegistrationStatus: (state) => {
      state.registrationSuccess = false;
      state.error = null;
    },
    setAccountStatus: (state, action) => {
      state.accountStatus = action.payload;
      if (state.user) {
        state.user.account_status = action.payload;
        localStorage.setItem('sims_auth_user', JSON.stringify(state.user));
      }
    },
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.accountStatus = null;
      state.role = null;
      state.permissions = [];
      state.loading = false;
      state.error = null;
      localStorage.removeItem('sims_auth_token');
      localStorage.removeItem('sims_auth_user');
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.accountStatus = action.payload.user?.account_status || action.payload.account_status || 'APPROVED';
        state.role = action.payload.user?.role || null;
        state.permissions = action.payload.user?.permissions || [];
        state.error = null;

        localStorage.setItem('sims_auth_token', action.payload.access_token);
        localStorage.setItem('sims_auth_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const registeredUser = action.payload.user || action.payload;
        state.user = registeredUser;
        state.accountStatus = 'PENDING';
        state.role = registeredUser?.role || null;
        state.permissions = registeredUser?.permissions || [];
        state.registrationSuccess = true;
        state.error = null;

        localStorage.setItem('sims_auth_user', JSON.stringify(registeredUser));
        localStorage.setItem('sims_pending_user', JSON.stringify(registeredUser));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
        state.registrationSuccess = false;
      });

    // googleLoginUser
    builder
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.accountStatus = action.payload.user?.account_status || action.payload.account_status || 'PENDING';
        state.role = action.payload.user?.role || null;
        state.permissions = action.payload.user?.permissions || [];
        state.error = null;

        localStorage.setItem('sims_auth_token', action.payload.access_token);
        localStorage.setItem('sims_auth_user', JSON.stringify(action.payload.user));
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Google sign-in failed';
      });

    // fetchCurrentUser
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.accountStatus = action.payload.account_status || state.accountStatus;
        state.role = action.payload.role || state.role;
        state.permissions = action.payload.permissions || state.permissions;
        localStorage.setItem('sims_auth_user', JSON.stringify(action.payload));
      });

    // refreshAccountStatus
    builder
      .addCase(refreshAccountStatus.fulfilled, (state, action) => {
        state.accountStatus = action.payload.account_status;
        state.role = action.payload.role;
        state.permissions = action.payload.permissions || [];
        if (state.user) {
          state.user.account_status = action.payload.account_status;
          state.user.role = action.payload.role;
          state.user.permissions = action.payload.permissions || [];
          localStorage.setItem('sims_auth_user', JSON.stringify(state.user));
        }
      });

    // logoutUser
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.accountStatus = null;
        state.role = null;
        state.permissions = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearAuthError, resetRegistrationStatus, setAccountStatus, forceLogout } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccountStatus = (state) => state.auth.accountStatus;
export const selectUserRole = (state) => state.auth.role;
export const selectUserPermissions = (state) => state.auth.permissions;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectRegistrationSuccess = (state) => state.auth.registrationSuccess;

export default authSlice.reducer;
