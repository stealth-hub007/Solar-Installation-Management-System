import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import salesDashboardReducer from '../features/sales/slices/salesDashboardSlice';
import salesCustomerReducer from '../features/sales/slices/customerSlice';
import salesEnquiryReducer from '../features/sales/slices/enquirySlice';
import salesFollowUpReducer from '../features/sales/slices/followUpSlice';
import salesSurveyReducer from '../features/sales/slices/surveySlice';
import salesQuotationReducer from '../features/sales/slices/quotationSlice';
import salesOrderReducer from '../features/sales/slices/orderSlice';
import technicianDashboardReducer from '../features/technician/slices/technicianDashboardSlice';
import assignedSurveyReducer from '../features/technician/slices/assignedSurveySlice';
import assignedInstallationReducer from '../features/technician/slices/assignedInstallationSlice';
import installationChecklistReducer from '../features/technician/slices/installationChecklistSlice';
import equipmentVerificationReducer from '../features/technician/slices/equipmentVerificationSlice';
import installationSignoffReducer from '../features/technician/slices/installationSignoffSlice';

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
    technicianDashboard: technicianDashboardReducer,
    assignedSurveys: assignedSurveyReducer,
    assignedInstallations: assignedInstallationReducer,
    installationChecklist: installationChecklistReducer,
    equipmentVerification: equipmentVerificationReducer,
    installationSignoff: installationSignoffReducer,
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

