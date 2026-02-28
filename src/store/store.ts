import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import appReducer from "./slices/appSlice";
import authReducer, {
  logout,
  setAuthCredentials,
} from "./slices/authSlice";
import adminCompanyReducer from "./slices/adminCompanySlice";
import { customerApi } from "./customer/customerApi";
import { adminApi } from "./admin/adminApi";
import { configureApiClient } from "@/apis/client";

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  adminCompany: adminCompanyReducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["app", "auth", "adminCompany"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(customerApi.middleware, adminApi.middleware),
});

configureApiClient({
  getAuthState: () => store.getState().auth,
  onLogout: () => store.dispatch(logout()),
  onSetAuthCredentials: (data) => store.dispatch(setAuthCredentials(data)),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
