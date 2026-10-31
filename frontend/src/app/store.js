import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore date object warnings if any in development
        ignoredActionPaths: ['payload.timestamp', 'payload.createdDate', 'payload.paymentDate'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

