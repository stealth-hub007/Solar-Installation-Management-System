import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import salesDashboardReducer from '../features/sales/slices/salesDashboardSlice';
import salesCustomerReducer from '../features/sales/slices/customerSlice';
import salesEnquiryReducer from '../features/sales/slices/enquirySlice';
import salesFollowUpReducer from '../features/sales/slices/followUpSlice';
import salesSurveyReducer from '../features/sales/slices/surveySlice';
import salesQuotationReducer from '../features/sales/slices/quotationSlice';
import salesOrderReducer from '../features/sales/slices/orderSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    salesDashboard: salesDashboardReducer,
    salesCustomers: salesCustomerReducer,
    salesEnquiries: salesEnquiryReducer,
    salesFollowUps: salesFollowUpReducer,
    salesSurveys: salesSurveyReducer,
    salesQuotations: salesQuotationReducer,
    salesOrders: salesOrderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore date object warnings if any in development
        ignoredActionPaths: ['payload.timestamp', 'payload.createdDate', 'payload.paymentDate', 'payload.followUpDate'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

