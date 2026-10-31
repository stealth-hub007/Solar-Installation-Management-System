import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardAPI from './dashboardAPI';

// ----------------------------------------------------
// READ ASYNC THUNKS
// ----------------------------------------------------

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getDashboardStats(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'dashboard/fetchRevenueAnalytics',
  async (period, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getRevenueAnalytics(period);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch revenue analytics');
    }
  }
);

export const fetchProjectAnalytics = createAsyncThunk(
  'dashboard/fetchProjectAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getProjectAnalytics();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch project analytics');
    }
  }
);

export const fetchInstallationAnalytics = createAsyncThunk(
  'dashboard/fetchInstallationAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getInstallationAnalytics();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch installation analytics');
    }
  }
);

export const fetchInventoryAnalytics = createAsyncThunk(
  'dashboard/fetchInventoryAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getInventoryAnalytics();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch inventory analytics');
    }
  }
);

export const fetchOperationalAlerts = createAsyncThunk(
  'dashboard/fetchOperationalAlerts',
  async (params, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getOperationalAlerts(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch operational alerts');
    }
  }
);

export const fetchRecentProjects = createAsyncThunk(
  'dashboard/fetchRecentProjects',
  async (params, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getRecentProjects(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recent projects');
    }
  }
);

export const fetchRecentPayments = createAsyncThunk(
  'dashboard/fetchRecentPayments',
  async (params, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getRecentPayments(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recent payments');
    }
  }
);

export const fetchRecentEnquiries = createAsyncThunk(
  'dashboard/fetchRecentEnquiries',
  async (params, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getRecentEnquiries(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recent enquiries');
    }
  }
);

export const fetchRecentServiceTickets = createAsyncThunk(
  'dashboard/fetchRecentServiceTickets',
  async (params, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getRecentServiceTickets(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recent service tickets');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (params, { rejectWithValue }) => {
    try {
      const res = await dashboardAPI.getRecentActivity(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recent activity');
    }
  }
);

// ----------------------------------------------------
// CRUD MUTATION THUNKS (CREATE / UPDATE / DELETE)
// ----------------------------------------------------

// Projects
export const createProject = createAsyncThunk(
  'dashboard/createProject',
  async (projectData, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.createProject(projectData);
      dispatch(fetchDashboardStats());
      dispatch(fetchProjectAnalytics());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'dashboard/updateProject',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.updateProject(id, data);
      dispatch(fetchDashboardStats());
      dispatch(fetchProjectAnalytics());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'dashboard/deleteProject',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await dashboardAPI.deleteProject(id);
      dispatch(fetchDashboardStats());
      dispatch(fetchProjectAnalytics());
      dispatch(fetchRecentActivity());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete project');
    }
  }
);

// Payments
export const createPayment = createAsyncThunk(
  'dashboard/createPayment',
  async (paymentData, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.createPayment(paymentData);
      dispatch(fetchDashboardStats());
      dispatch(fetchRevenueAnalytics());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to record payment');
    }
  }
);

export const updatePayment = createAsyncThunk(
  'dashboard/updatePayment',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.updatePayment(id, data);
      dispatch(fetchDashboardStats());
      dispatch(fetchRevenueAnalytics());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update payment');
    }
  }
);

export const deletePayment = createAsyncThunk(
  'dashboard/deletePayment',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await dashboardAPI.deletePayment(id);
      dispatch(fetchDashboardStats());
      dispatch(fetchRevenueAnalytics());
      dispatch(fetchRecentActivity());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete payment');
    }
  }
);

// Enquiries
export const createEnquiry = createAsyncThunk(
  'dashboard/createEnquiry',
  async (enquiryData, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.createEnquiry(enquiryData);
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add enquiry');
    }
  }
);

export const updateEnquiry = createAsyncThunk(
  'dashboard/updateEnquiry',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.updateEnquiry(id, data);
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update enquiry');
    }
  }
);

export const deleteEnquiry = createAsyncThunk(
  'dashboard/deleteEnquiry',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await dashboardAPI.deleteEnquiry(id);
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentActivity());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete enquiry');
    }
  }
);

// Service Tickets
export const createServiceTicket = createAsyncThunk(
  'dashboard/createServiceTicket',
  async (ticketData, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.createServiceTicket(ticketData);
      dispatch(fetchDashboardStats());
      dispatch(fetchOperationalAlerts());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to log ticket');
    }
  }
);

export const updateServiceTicket = createAsyncThunk(
  'dashboard/updateServiceTicket',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.updateServiceTicket(id, data);
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentActivity());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update ticket');
    }
  }
);

export const deleteServiceTicket = createAsyncThunk(
  'dashboard/deleteServiceTicket',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await dashboardAPI.deleteServiceTicket(id);
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentActivity());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete ticket');
    }
  }
);

// Operational Alerts
export const createAlert = createAsyncThunk(
  'dashboard/createAlert',
  async (alertData, { dispatch, rejectWithValue }) => {
    try {
      const res = await dashboardAPI.createAlert(alertData);
      dispatch(fetchOperationalAlerts());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create alert');
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'dashboard/deleteAlert',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await dashboardAPI.deleteAlert(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to dismiss alert');
    }
  }
);

// Reset Sample Data
export const resetAllData = createAsyncThunk(
  'dashboard/resetAllData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await dashboardAPI.resetAllSampleData();
      dispatch(fetchDashboardStats());
      dispatch(fetchRevenueAnalytics());
      dispatch(fetchProjectAnalytics());
      dispatch(fetchInstallationAnalytics());
      dispatch(fetchInventoryAnalytics());
      dispatch(fetchOperationalAlerts());
      dispatch(fetchRecentProjects());
      dispatch(fetchRecentPayments());
      dispatch(fetchRecentEnquiries());
      dispatch(fetchRecentServiceTickets());
      dispatch(fetchRecentActivity());
      return true;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reset demo data');
    }
  }
);

// ----------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------

const initialTableState = {
  data: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
  },
  filters: {
    search: '',
    status: 'all',
    sortBy: '',
    sortDirection: 'desc',
  },
};

const initialState = {
  // KPI Stats
  stats: {
    data: null,
    isLoading: false,
    error: null,
    timeRange: '30d',
  },

  // Analytics Charts
  revenueAnalytics: {
    data: [],
    period: '12m',
    isLoading: false,
    error: null,
  },
  projectAnalytics: {
    data: [],
    isLoading: false,
    error: null,
  },
  installationAnalytics: {
    data: [],
    isLoading: false,
    error: null,
  },
  inventoryAnalytics: {
    data: [],
    isLoading: false,
    error: null,
  },

  // Operational Alerts
  operationalAlerts: {
    data: [],
    filterSeverity: 'all',
    isLoading: false,
    error: null,
  },

  // Recent Record Tables
  projects: { ...initialTableState },
  payments: { ...initialTableState },
  enquiries: { ...initialTableState },
  serviceTickets: {
    ...initialTableState,
    filters: { search: '', priority: 'all', sortBy: '', sortDirection: 'desc' },
  },
  activity: {
    ...initialTableState,
    filters: { search: '', module: 'all', sortBy: '', sortDirection: 'desc' },
  },
};

// ----------------------------------------------------
// SLICE
// ----------------------------------------------------

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // KPI Time Range Filter
    setStatsTimeRange(state, action) {
      state.stats.timeRange = action.payload;
    },

    // Revenue Period Filter
    setRevenuePeriod(state, action) {
      state.revenueAnalytics.period = action.payload;
    },

    // Operational Alerts Severity Filter
    setAlertSeverity(state, action) {
      state.operationalAlerts.filterSeverity = action.payload;
    },

    // Table Filter Updates (automatically resets page to 1)
    setProjectsFilters(state, action) {
      state.projects.filters = { ...state.projects.filters, ...action.payload };
      state.projects.pagination.page = 1;
    },
    setProjectsPagination(state, action) {
      state.projects.pagination = { ...state.projects.pagination, ...action.payload };
    },
    resetProjectsFilters(state) {
      state.projects.filters = { search: '', status: 'all', sortBy: '', sortDirection: 'desc' };
      state.projects.pagination.page = 1;
    },

    setPaymentsFilters(state, action) {
      state.payments.filters = { ...state.payments.filters, ...action.payload };
      state.payments.pagination.page = 1;
    },
    setPaymentsPagination(state, action) {
      state.payments.pagination = { ...state.payments.pagination, ...action.payload };
    },
    resetPaymentsFilters(state) {
      state.payments.filters = { search: '', status: 'all', sortBy: '', sortDirection: 'desc' };
      state.payments.pagination.page = 1;
    },

    setEnquiriesFilters(state, action) {
      state.enquiries.filters = { ...state.enquiries.filters, ...action.payload };
      state.enquiries.pagination.page = 1;
    },
    setEnquiriesPagination(state, action) {
      state.enquiries.pagination = { ...state.enquiries.pagination, ...action.payload };
    },
    resetEnquiriesFilters(state) {
      state.enquiries.filters = { search: '', status: 'all', sortBy: '', sortDirection: 'desc' };
      state.enquiries.pagination.page = 1;
    },

    setServiceTicketsFilters(state, action) {
      state.serviceTickets.filters = { ...state.serviceTickets.filters, ...action.payload };
      state.serviceTickets.pagination.page = 1;
    },
    setServiceTicketsPagination(state, action) {
      state.serviceTickets.pagination = { ...state.serviceTickets.pagination, ...action.payload };
    },
    resetServiceTicketsFilters(state) {
      state.serviceTickets.filters = { search: '', priority: 'all', sortBy: '', sortDirection: 'desc' };
      state.serviceTickets.pagination.page = 1;
    },

    setActivityFilters(state, action) {
      state.activity.filters = { ...state.activity.filters, ...action.payload };
      state.activity.pagination.page = 1;
    },
    setActivityPagination(state, action) {
      state.activity.pagination = { ...state.activity.pagination, ...action.payload };
    },
    resetActivityFilters(state) {
      state.activity.filters = { search: '', module: 'all', sortBy: '', sortDirection: 'desc' };
      state.activity.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    // Read reducers
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.stats.isLoading = true;
        state.stats.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats.isLoading = false;
        state.stats.data = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.stats.isLoading = false;
        state.stats.error = action.payload || 'Failed to load stats';
      });

    builder
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.revenueAnalytics.isLoading = true;
        state.revenueAnalytics.error = null;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.revenueAnalytics.isLoading = false;
        state.revenueAnalytics.data = action.payload;
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.revenueAnalytics.isLoading = false;
        state.revenueAnalytics.error = action.payload || 'Failed to load revenue analytics';
      });

    builder
      .addCase(fetchProjectAnalytics.pending, (state) => {
        state.projectAnalytics.isLoading = true;
        state.projectAnalytics.error = null;
      })
      .addCase(fetchProjectAnalytics.fulfilled, (state, action) => {
        state.projectAnalytics.isLoading = false;
        state.projectAnalytics.data = action.payload;
      })
      .addCase(fetchProjectAnalytics.rejected, (state, action) => {
        state.projectAnalytics.isLoading = false;
        state.projectAnalytics.error = action.payload || 'Failed to load project distribution';
      });

    builder
      .addCase(fetchInstallationAnalytics.pending, (state) => {
        state.installationAnalytics.isLoading = true;
        state.installationAnalytics.error = null;
      })
      .addCase(fetchInstallationAnalytics.fulfilled, (state, action) => {
        state.installationAnalytics.isLoading = false;
        state.installationAnalytics.data = action.payload;
      })
      .addCase(fetchInstallationAnalytics.rejected, (state, action) => {
        state.installationAnalytics.isLoading = false;
        state.installationAnalytics.error = action.payload || 'Failed to load installation analytics';
      });

    builder
      .addCase(fetchInventoryAnalytics.pending, (state) => {
        state.inventoryAnalytics.isLoading = true;
        state.inventoryAnalytics.error = null;
      })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        state.inventoryAnalytics.isLoading = false;
        state.inventoryAnalytics.data = action.payload;
      })
      .addCase(fetchInventoryAnalytics.rejected, (state, action) => {
        state.inventoryAnalytics.isLoading = false;
        state.inventoryAnalytics.error = action.payload || 'Failed to load inventory analytics';
      });

    builder
      .addCase(fetchOperationalAlerts.pending, (state) => {
        state.operationalAlerts.isLoading = true;
        state.operationalAlerts.error = null;
      })
      .addCase(fetchOperationalAlerts.fulfilled, (state, action) => {
        state.operationalAlerts.isLoading = false;
        state.operationalAlerts.data = action.payload;
      })
      .addCase(fetchOperationalAlerts.rejected, (state, action) => {
        state.operationalAlerts.isLoading = false;
        state.operationalAlerts.error = action.payload || 'Failed to load operational alerts';
      });

    builder
      .addCase(fetchRecentProjects.pending, (state) => {
        state.projects.isLoading = true;
        state.projects.error = null;
      })
      .addCase(fetchRecentProjects.fulfilled, (state, action) => {
        state.projects.isLoading = false;
        state.projects.data = action.payload.data;
        state.projects.pagination = action.payload.pagination;
      })
      .addCase(fetchRecentProjects.rejected, (state, action) => {
        state.projects.isLoading = false;
        state.projects.error = action.payload || 'Failed to load projects';
      });

    builder
      .addCase(fetchRecentPayments.pending, (state) => {
        state.payments.isLoading = true;
        state.payments.error = null;
      })
      .addCase(fetchRecentPayments.fulfilled, (state, action) => {
        state.payments.isLoading = false;
        state.payments.data = action.payload.data;
        state.payments.pagination = action.payload.pagination;
      })
      .addCase(fetchRecentPayments.rejected, (state, action) => {
        state.payments.isLoading = false;
        state.payments.error = action.payload || 'Failed to load payments';
      });

    builder
      .addCase(fetchRecentEnquiries.pending, (state) => {
        state.enquiries.isLoading = true;
        state.enquiries.error = null;
      })
      .addCase(fetchRecentEnquiries.fulfilled, (state, action) => {
        state.enquiries.isLoading = false;
        state.enquiries.data = action.payload.data;
        state.enquiries.pagination = action.payload.pagination;
      })
      .addCase(fetchRecentEnquiries.rejected, (state, action) => {
        state.enquiries.isLoading = false;
        state.enquiries.error = action.payload || 'Failed to load enquiries';
      });

    builder
      .addCase(fetchRecentServiceTickets.pending, (state) => {
        state.serviceTickets.isLoading = true;
        state.serviceTickets.error = null;
      })
      .addCase(fetchRecentServiceTickets.fulfilled, (state, action) => {
        state.serviceTickets.isLoading = false;
        state.serviceTickets.data = action.payload.data;
        state.serviceTickets.pagination = action.payload.pagination;
      })
      .addCase(fetchRecentServiceTickets.rejected, (state, action) => {
        state.serviceTickets.isLoading = false;
        state.serviceTickets.error = action.payload || 'Failed to load service tickets';
      });

    builder
      .addCase(fetchRecentActivity.pending, (state) => {
        state.activity.isLoading = true;
        state.activity.error = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.activity.isLoading = false;
        state.activity.data = action.payload.data;
        state.activity.pagination = action.payload.pagination;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.activity.isLoading = false;
        state.activity.error = action.payload || 'Failed to load activity logs';
      });

    // Delete alert reducer
    builder.addCase(deleteAlert.fulfilled, (state, action) => {
      state.operationalAlerts.data = state.operationalAlerts.data.filter(
        (a) => a.id !== action.payload
      );
    });
  },
});

export const {
  setStatsTimeRange,
  setRevenuePeriod,
  setAlertSeverity,
  setProjectsFilters,
  setProjectsPagination,
  resetProjectsFilters,
  setPaymentsFilters,
  setPaymentsPagination,
  resetPaymentsFilters,
  setEnquiriesFilters,
  setEnquiriesPagination,
  resetEnquiriesFilters,
  setServiceTicketsFilters,
  setServiceTicketsPagination,
  resetServiceTicketsFilters,
  setActivityFilters,
  setActivityPagination,
  resetActivityFilters,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
