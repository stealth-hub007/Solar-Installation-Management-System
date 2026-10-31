import {
  mockDashboardStats,
  mockRevenueAnalytics,
  mockProjectStatusData,
  mockInstallationData,
  mockInventoryData,
  mockAlerts,
  mockProjects,
  mockPayments,
  mockEnquiries,
  mockServiceTickets,
  mockActivities,
  mockCustomers,
  mockProducts,
  mockAccessRequests,
  mockFollowUps,
  mockSalesSurveys,
  mockSalesQuotations,
  mockSalesOrders,
  mockSalesStats,
  mockSalesAnalytics,
} from './mockData';

const KEYS = {
  PROJECTS: 'sims_projects_data',
  PAYMENTS: 'sims_payments_data',
  ENQUIRIES: 'sims_enquiries_data',
  SERVICE_TICKETS: 'sims_tickets_data',
  ALERTS: 'sims_alerts_data',
  INVENTORY: 'sims_inventory_data',
  ACTIVITIES: 'sims_activities_data',
  CUSTOMERS: 'sims_customers_data',
  PRODUCTS: 'sims_products_catalog',
  ACCESS_REQUESTS: 'sims_access_requests',
  FOLLOW_UPS: 'sims_followups_data',
  SURVEYS: 'sims_surveys_data',
  QUOTATIONS: 'sims_quotations_data',
  ORDERS: 'sims_orders_data',
};

// Safe JSON parse from localStorage with fallback
const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(item);
    return parsed;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

// Safe JSON write to localStorage
const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
};

/**
 * Storage Service: LocalStorage persistence engine with full CRUD and dynamic metric recalculation
 */
export const storageService = {
  // Initialize all collections if not present
  init() {
    getStored(KEYS.PROJECTS, mockProjects);
    getStored(KEYS.PAYMENTS, mockPayments);
    getStored(KEYS.ENQUIRIES, mockEnquiries);
    getStored(KEYS.SERVICE_TICKETS, mockServiceTickets);
    getStored(KEYS.ALERTS, mockAlerts);
    getStored(KEYS.INVENTORY, mockInventoryData);
    getStored(KEYS.ACTIVITIES, mockActivities);
    getStored(KEYS.CUSTOMERS, mockCustomers);
    getStored(KEYS.PRODUCTS, mockProducts);
    getStored(KEYS.ACCESS_REQUESTS, mockAccessRequests);
    getStored(KEYS.FOLLOW_UPS, mockFollowUps);
    getStored(KEYS.SURVEYS, mockSalesSurveys);
    getStored(KEYS.QUOTATIONS, mockSalesQuotations);
    getStored(KEYS.ORDERS, mockSalesOrders);
  },

  // --------------------------------------------------------------------------
  // ACTIVITIES (Audit Trail)
  // --------------------------------------------------------------------------
  getActivities() {
    return getStored(KEYS.ACTIVITIES, mockActivities);
  },

  logActivity(activity, module = 'System', status = 'Completed', user = 'Admin User') {
    const activities = this.getActivities();
    const newEntry = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      user,
      activity,
      module,
      timestamp: new Date().toISOString(),
      status,
    };
    const updated = [newEntry, ...activities].slice(0, 50); // retain latest 50
    setStored(KEYS.ACTIVITIES, updated);
    return newEntry;
  },

  // --------------------------------------------------------------------------
  // PROJECTS CRUD
  // --------------------------------------------------------------------------
  getProjects() {
    return getStored(KEYS.PROJECTS, mockProjects);
  },

  createProject(projectData) {
    const projects = this.getProjects();
    const newId = `SIMS-PRJ-${1080 + projects.length + 1}`;
    const newProject = {
      id: newId,
      projectName: projectData.projectName || 'New Solar Installation',
      customerName: projectData.customerName || 'Valued Customer',
      location: projectData.location || 'Rajasthan, India',
      capacity: Number(projectData.capacity) || 5.0,
      status: projectData.status || 'In Progress',
      assignedTechnician: projectData.assignedTechnician || 'Unassigned',
      createdDate: new Date().toISOString(),
    };

    const updated = [newProject, ...projects];
    setStored(KEYS.PROJECTS, updated);

    this.logActivity(
      `Created project ${newProject.id} (${newProject.capacity}kW) for ${newProject.customerName}`,
      'Projects',
      'Created'
    );

    return newProject;
  },

  updateProject(id, patch) {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Project with ID ${id} not found`);

    const updatedProject = {
      ...projects[index],
      ...patch,
      capacity: patch.capacity !== undefined ? Number(patch.capacity) : projects[index].capacity,
    };

    projects[index] = updatedProject;
    setStored(KEYS.PROJECTS, projects);

    this.logActivity(
      `Updated project ${id} stage to "${updatedProject.status}"`,
      'Projects',
      'Updated'
    );

    return updatedProject;
  },

  deleteProject(id) {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === id);
    const updated = projects.filter((p) => p.id !== id);
    setStored(KEYS.PROJECTS, updated);

    this.logActivity(
      `Deleted project record ${id} (${target?.projectName || 'Project'})`,
      'Projects',
      'Deleted'
    );

    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // PAYMENTS CRUD
  // --------------------------------------------------------------------------
  getPayments() {
    return getStored(KEYS.PAYMENTS, mockPayments);
  },

  createPayment(paymentData) {
    const payments = this.getPayments();
    const newId = `PAY-${8920 + payments.length + 1}`;
    const newPayment = {
      id: newId,
      customerName: paymentData.customerName || 'Customer',
      projectId: paymentData.projectId || 'SIMS-PRJ-GENERAL',
      amount: Number(paymentData.amount) || 0,
      paymentMethod: paymentData.paymentMethod || 'NEFT / RTGS',
      paymentStatus: paymentData.paymentStatus || 'Completed',
      paymentDate: paymentData.paymentDate || new Date().toISOString(),
    };

    const updated = [newPayment, ...payments];
    setStored(KEYS.PAYMENTS, updated);

    this.logActivity(
      `Recorded payment ${newPayment.id} of ₹${newPayment.amount.toLocaleString('en-IN')} from ${newPayment.customerName}`,
      'Payments',
      'Completed'
    );

    return newPayment;
  },

  updatePayment(id, patch) {
    const payments = this.getPayments();
    const index = payments.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Payment with ID ${id} not found`);

    const updatedPayment = {
      ...payments[index],
      ...patch,
      amount: patch.amount !== undefined ? Number(patch.amount) : payments[index].amount,
    };

    payments[index] = updatedPayment;
    setStored(KEYS.PAYMENTS, payments);

    this.logActivity(
      `Updated payment voucher ${id} status to "${updatedPayment.paymentStatus}"`,
      'Payments',
      'Updated'
    );

    return updatedPayment;
  },

  deletePayment(id) {
    const payments = this.getPayments();
    const updated = payments.filter((p) => p.id !== id);
    setStored(KEYS.PAYMENTS, updated);

    this.logActivity(`Deleted payment transaction voucher ${id}`, 'Payments', 'Deleted');

    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // ENQUIRIES CRUD
  // --------------------------------------------------------------------------
  getEnquiries() {
    return getStored(KEYS.ENQUIRIES, mockEnquiries);
  },

  createEnquiry(enquiryData) {
    const enquiries = this.getEnquiries();
    const newId = `ENQ-${4400 + enquiries.length + 1}`;
    const newEnquiry = {
      id: newId,
      customerName: enquiryData.customerName || 'Inbound Prospect',
      contactNumber: enquiryData.contactNumber || '+91 98000 00000',
      email: enquiryData.email || 'prospect@gmail.com',
      address: enquiryData.address || 'Jaipur, Rajasthan',
      files: enquiryData.files || 'Electricity_Bill.pdf',
      enquirySource: enquiryData.enquirySource || 'Website Form',
      capacity: enquiryData.capacity || '5 kW Rooftop',
      enquiryStatus: enquiryData.enquiryStatus || 'New',
      createdDate: new Date().toISOString(),
    };

    const updated = [newEnquiry, ...enquiries];
    setStored(KEYS.ENQUIRIES, updated);

    this.logActivity(
      `Added new solar enquiry ${newEnquiry.id} for ${newEnquiry.customerName}`,
      'Enquiries',
      'Created'
    );

    return newEnquiry;
  },

  updateEnquiry(id, patch) {
    const enquiries = this.getEnquiries();
    const index = enquiries.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Enquiry ${id} not found`);

    const updatedEnquiry = { ...enquiries[index], ...patch };
    enquiries[index] = updatedEnquiry;
    setStored(KEYS.ENQUIRIES, enquiries);

    this.logActivity(
      `Updated enquiry ${id} lead status to "${updatedEnquiry.enquiryStatus}"`,
      'Enquiries',
      'Updated'
    );

    return updatedEnquiry;
  },

  deleteEnquiry(id) {
    const enquiries = this.getEnquiries();
    const updated = enquiries.filter((e) => e.id !== id);
    setStored(KEYS.ENQUIRIES, updated);

    this.logActivity(`Removed enquiry lead ${id}`, 'Enquiries', 'Deleted');

    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // SERVICE TICKETS CRUD
  // --------------------------------------------------------------------------
  getServiceTickets() {
    return getStored(KEYS.SERVICE_TICKETS, mockServiceTickets);
  },

  createServiceTicket(ticketData) {
    const tickets = this.getServiceTickets();
    const newId = `TCK-${200 + tickets.length + 1}`;
    const newTicket = {
      id: newId,
      customerName: ticketData.customerName || 'Customer',
      issueType: ticketData.issueType || 'General Inverter Inspection',
      priority: ticketData.priority || 'Medium',
      assignedTechnician: ticketData.assignedTechnician || 'Unassigned',
      ticketStatus: ticketData.ticketStatus || 'Open',
      createdDate: new Date().toISOString(),
    };

    const updated = [newTicket, ...tickets];
    setStored(KEYS.SERVICE_TICKETS, updated);

    // If critical ticket, automatically register an alert!
    if (newTicket.priority === 'Critical') {
      this.createAlert({
        title: `Critical Ticket Logged: ${newTicket.id}`,
        description: `${newTicket.issueType} reported by ${newTicket.customerName}`,
        severity: 'critical',
        module: 'Service Tickets',
        actionRoute: '/admin/service-tickets',
      });
    }

    this.logActivity(
      `Logged support ticket ${newTicket.id} (${newTicket.priority}) for ${newTicket.customerName}`,
      'Service Tickets',
      'Created'
    );

    return newTicket;
  },

  updateServiceTicket(id, patch) {
    const tickets = this.getServiceTickets();
    const index = tickets.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Ticket ${id} not found`);

    const updatedTicket = { ...tickets[index], ...patch };
    tickets[index] = updatedTicket;
    setStored(KEYS.SERVICE_TICKETS, tickets);

    this.logActivity(
      `Updated ticket ${id} resolution status to "${updatedTicket.ticketStatus}"`,
      'Service Tickets',
      'Updated'
    );

    return updatedTicket;
  },

  deleteServiceTicket(id) {
    const tickets = this.getServiceTickets();
    const updated = tickets.filter((t) => t.id !== id);
    setStored(KEYS.SERVICE_TICKETS, updated);

    this.logActivity(`Deleted ticket record ${id}`, 'Service Tickets', 'Deleted');

    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // OPERATIONAL ALERTS CRUD
  // --------------------------------------------------------------------------
  getAlerts() {
    return getStored(KEYS.ALERTS, mockAlerts);
  },

  createAlert(alertData) {
    const alerts = this.getAlerts();
    const newId = `ALT-${100 + alerts.length + 1}`;
    const newAlert = {
      id: newId,
      title: alertData.title || 'System Notification',
      description: alertData.description || 'Action required',
      severity: alertData.severity || 'warning',
      module: alertData.module || 'System',
      timestamp: new Date().toISOString(),
      actionRoute: alertData.actionRoute || '/admin/dashboard',
    };

    const updated = [newAlert, ...alerts];
    setStored(KEYS.ALERTS, updated);

    return newAlert;
  },

  deleteAlert(id) {
    const alerts = this.getAlerts();
    const updated = alerts.filter((a) => a.id !== id);
    setStored(KEYS.ALERTS, updated);
    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // INVENTORY
  // --------------------------------------------------------------------------
  getInventory() {
    return getStored(KEYS.INVENTORY, mockInventoryData);
  },

  updateInventory(category, patch) {
    const inventory = this.getInventory();
    const index = inventory.findIndex((item) => item.category === category);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...patch };
      setStored(KEYS.INVENTORY, inventory);
      this.logActivity(`Updated inventory category "${category}"`, 'Inventory', 'Updated');
    }
    return inventory;
  },

  setInventoryStock(category, newAvailable) {
    const inventory = this.getInventory();
    const index = inventory.findIndex((item) => item.category === category);
    if (index !== -1) {
      const stock = Math.max(0, Number(newAvailable));
      inventory[index].available = stock;
      inventory[index].outOfStock = stock === 0 ? 1 : 0;
      setStored(KEYS.INVENTORY, inventory);
      this.logActivity(`Updated stock for "${category}" to ${stock} units`, 'Inventory', 'Updated');
    }
    return inventory;
  },

  deleteInventory(category) {
    const inventory = this.getInventory();
    const updated = inventory.filter((item) => item.category !== category);
    setStored(KEYS.INVENTORY, updated);
    this.logActivity(`Removed inventory category "${category}"`, 'Inventory', 'Deleted');
    return { category, success: true };
  },

  // --------------------------------------------------------------------------
  // CUSTOMERS CRUD
  // --------------------------------------------------------------------------
  getCustomers() {
    return getStored(KEYS.CUSTOMERS, mockCustomers);
  },

  createCustomer(customerData) {
    const customers = this.getCustomers();
    const newId = `CUST-${100 + customers.length + 1}`;
    const newCustomer = {
      id: newId,
      name: customerData.name || 'New Customer',
      phone: customerData.phone || '+91 98290 00000',
      email: customerData.email || 'customer@solar-sims.com',
      city: customerData.city || 'Jaipur, Rajasthan',
      address: customerData.address || customerData.city || 'Jaipur, Rajasthan',
      projectCount: Number(customerData.projectCount) || 0,
      totalCapacity: Number(customerData.totalCapacity) || 5.0,
      status: customerData.status || 'Active',
      type: customerData.type || (Number(customerData.totalCapacity) >= 20 ? 'Commercial' : 'Residential'),
      createdDate: new Date().toISOString(),
    };
    const updated = [newCustomer, ...customers];
    setStored(KEYS.CUSTOMERS, updated);
    this.logActivity(`Registered new customer ${newCustomer.name} (${newCustomer.id})`, 'Customers', 'Created');
    return newCustomer;
  },

  updateCustomer(id, patch) {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Customer with ID ${id} not found`);
    const updatedCustomer = {
      ...customers[index],
      ...patch,
      totalCapacity: patch.totalCapacity !== undefined ? Number(patch.totalCapacity) : customers[index].totalCapacity,
    };
    customers[index] = updatedCustomer;
    setStored(KEYS.CUSTOMERS, customers);
    this.logActivity(`Updated customer record ${id} (${updatedCustomer.name})`, 'Customers', 'Updated');
    return updatedCustomer;
  },

  deleteCustomer(id) {
    const customers = this.getCustomers();
    const target = customers.find((c) => c.id === id);
    const updated = customers.filter((c) => c.id !== id);
    setStored(KEYS.CUSTOMERS, updated);
    this.logActivity(`Deleted customer record ${id} (${target?.name || 'Customer'})`, 'Customers', 'Deleted');
    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // PRODUCTS CRUD
  // --------------------------------------------------------------------------
  getProducts() {
    return getStored(KEYS.PRODUCTS, mockProducts);
  },

  createProduct(productData) {
    const products = this.getProducts();
    const newId = `PRD-${100 + products.length + 1}`;
    const newProduct = {
      id: newId,
      name: productData.name || 'New Solar Equipment',
      type: productData.type || 'PV Module',
      brand: productData.brand || 'Tier-1 Brand',
      wattage: productData.wattage || '550 W',
      efficiency: productData.efficiency || '21.0%',
      price: Number(productData.price) || 15000,
      warranty: productData.warranty || '25 Years',
      createdDate: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    setStored(KEYS.PRODUCTS, updated);
    this.logActivity(`Added catalog product ${newProduct.id} (${newProduct.name})`, 'Products', 'Created');
    return newProduct;
  },

  updateProduct(id, patch) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Product with ID ${id} not found`);
    const updatedProduct = {
      ...products[index],
      ...patch,
      price: patch.price !== undefined ? Number(patch.price) : products[index].price,
    };
    products[index] = updatedProduct;
    setStored(KEYS.PRODUCTS, products);
    this.logActivity(`Updated product ${id} (${updatedProduct.name})`, 'Products', 'Updated');
    return updatedProduct;
  },

  deleteProduct(id) {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    setStored(KEYS.PRODUCTS, updated);
    this.logActivity(`Removed product ${id} (${target?.name || 'Product'}) from catalog`, 'Products', 'Deleted');
    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // ACCESS REQUESTS (Roles & Permissions)
  // --------------------------------------------------------------------------
  getAccessRequests() {
    return getStored(KEYS.ACCESS_REQUESTS, mockAccessRequests);
  },

  createAccessRequest(reqData) {
    const requests = this.getAccessRequests();
    const newId = `REQ-${100 + requests.length + 1}`;
    const newReq = {
      id: newId,
      name: reqData.name || 'New User',
      email: reqData.email || 'user@solar-sims.com',
      role: reqData.role || 'Field Service Staff',
      department: reqData.department || 'Operations',
      reason: reqData.reason || 'Requested panel access from login portal',
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };
    const updated = [newReq, ...requests];
    setStored(KEYS.ACCESS_REQUESTS, updated);

    // Instant Notification to Admin
    this.createAlert({
      title: `New Access Request: ${newReq.name}`,
      description: `${newReq.name} (${newReq.email}) requested "${newReq.role}" panel access`,
      severity: 'info',
      module: 'Roles & Permissions',
      actionRoute: '/admin/roles-permissions',
    });

    this.logActivity(`New access request submitted by ${newReq.name} for role "${newReq.role}"`, 'Security', 'Pending');
    return newReq;
  },

  updateAccessRequestStatus(id, newStatus) {
    const requests = this.getAccessRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Request with ID ${id} not found`);
    requests[index].status = newStatus;
    requests[index].reviewedAt = new Date().toISOString();
    setStored(KEYS.ACCESS_REQUESTS, requests);

    this.logActivity(
      `Admin ${newStatus.toLowerCase()} access request ${id} (${requests[index].name} as ${requests[index].role})`,
      'Roles & Permissions',
      newStatus === 'Approved' ? 'Success' : 'Rejected'
    );
    return requests[index];
  },

  updateAccessRequest(id, updateData) {
    const requests = this.getAccessRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Request with ID ${id} not found`);
    requests[index] = { ...requests[index], ...updateData, updatedAt: new Date().toISOString() };
    setStored(KEYS.ACCESS_REQUESTS, requests);

    this.logActivity(
      `Admin updated role permissions for ${requests[index].name} (${requests[index].role})`,
      'Roles & Permissions',
      'Updated'
    );
    return requests[index];
  },

  deleteAccessRequest(id) {
    const requests = this.getAccessRequests();
    const updated = requests.filter((r) => r.id !== id);
    setStored(KEYS.ACCESS_REQUESTS, updated);
    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // DYNAMIC RECALCULATIONS (KPIS & ANALYTICS BASED ON TIME-RANGE FILTER)
  // --------------------------------------------------------------------------
  getStats(timeRange = '30d') {
    const projects = this.getProjects();
    const payments = this.getPayments();
    const enquiries = this.getEnquiries();
    const tickets = this.getServiceTickets();
    const inventory = this.getInventory();

    const lowStockCount = inventory.filter(
      (i) => i.available <= i.lowStock || i.outOfStock > 0
    ).length;

    // Scale dynamically according to selected time range:
    if (timeRange === '7d') {
      return {
        totalRevenue: {
          value: 1240000,
          changePercentage: 18.2,
          trend: 'up',
          comparisonPeriod: 'vs last 7 days',
        },
        paymentsReceived: {
          value: 980000,
          changePercentage: 12.0,
          trend: 'up',
          comparisonPeriod: 'vs last 7 days',
        },
        outstandingPayments: {
          value: 260000,
          changePercentage: -5.4,
          trend: 'down',
          comparisonPeriod: 'vs last 7 days',
        },
        totalCustomers: {
          value: 28,
          changePercentage: 8.5,
          trend: 'up',
          comparisonPeriod: 'vs last 7 days',
        },
        totalEnquiries: {
          value: 42,
          changePercentage: 25.0,
          trend: 'up',
          comparisonPeriod: 'vs last 7 days',
        },
        activeProjects: {
          value: Math.min(projects.length, 9),
          changePercentage: 4.1,
          trend: 'up',
          comparisonPeriod: 'vs last 7 days',
        },
        pendingSurveys: {
          value: 3,
          changePercentage: -25.0,
          trend: 'down',
          comparisonPeriod: 'vs last 7 days',
        },
        openServiceTickets: {
          value: 2,
          changePercentage: 0.0,
          trend: 'neutral',
          comparisonPeriod: 'vs last 7 days',
        },
        lowStockAlerts: {
          value: Math.min(lowStockCount, 2),
          changePercentage: 0.0,
          trend: 'neutral',
          comparisonPeriod: 'critical stock items',
        },
      };
    }

    if (timeRange === '90d') {
      return {
        totalRevenue: {
          value: 14860000,
          changePercentage: 24.5,
          trend: 'up',
          comparisonPeriod: 'vs last quarter',
        },
        paymentsReceived: {
          value: 5840000,
          changePercentage: 19.2,
          trend: 'up',
          comparisonPeriod: 'vs last quarter',
        },
        outstandingPayments: {
          value: 9020000,
          changePercentage: -2.8,
          trend: 'down',
          comparisonPeriod: 'vs last quarter',
        },
        totalCustomers: {
          value: 68,
          changePercentage: 22.0,
          trend: 'up',
          comparisonPeriod: 'vs last quarter',
        },
        totalEnquiries: {
          value: 54,
          changePercentage: 31.4,
          trend: 'up',
          comparisonPeriod: 'vs last quarter',
        },
        activeProjects: {
          value: 28,
          changePercentage: 14.8,
          trend: 'up',
          comparisonPeriod: 'vs last quarter',
        },
        pendingSurveys: {
          value: 9,
          changePercentage: -8.0,
          trend: 'down',
          comparisonPeriod: 'vs last quarter',
        },
        openServiceTickets: {
          value: 7,
          changePercentage: 4.5,
          trend: 'up',
          comparisonPeriod: 'vs last quarter',
        },
        lowStockAlerts: {
          value: 6,
          changePercentage: 20.0,
          trend: 'up',
          comparisonPeriod: 'critical stock items',
        },
      };
    }

    if (timeRange === '1y' || timeRange === 'ytd') {
      return {
        totalRevenue: {
          value: 25084740,
          changePercentage: 38.4,
          trend: 'up',
          comparisonPeriod: 'vs last year',
        },
        paymentsReceived: {
          value: 9837350,
          changePercentage: 31.2,
          trend: 'up',
          comparisonPeriod: 'vs last year',
        },
        outstandingPayments: {
          value: 15247390,
          changePercentage: -11.5,
          trend: 'down',
          comparisonPeriod: 'vs last year',
        },
        totalCustomers: {
          value: 108,
          changePercentage: 42.0,
          trend: 'up',
          comparisonPeriod: 'vs last year',
        },
        totalEnquiries: {
          value: 82,
          changePercentage: 48.0,
          trend: 'up',
          comparisonPeriod: 'vs last year',
        },
        activeProjects: {
          value: 43,
          changePercentage: 26.5,
          trend: 'up',
          comparisonPeriod: 'vs last year',
        },
        pendingSurveys: {
          value: 14,
          changePercentage: -15.0,
          trend: 'down',
          comparisonPeriod: 'vs last year',
        },
        openServiceTickets: {
          value: 12,
          changePercentage: -6.2,
          trend: 'down',
          comparisonPeriod: 'vs last year',
        },
        lowStockAlerts: {
          value: 8,
          changePercentage: 15.0,
          trend: 'up',
          comparisonPeriod: 'critical stock items',
        },
      };
    }

    // Default 30 Days (standard baseline)
    return {
      totalRevenue: {
        value: 6240000,
        changePercentage: 14.2,
        trend: 'up',
        comparisonPeriod: 'vs last month',
      },
      paymentsReceived: {
        value: 2850000,
        changePercentage: 8.5,
        trend: 'up',
        comparisonPeriod: 'vs last month',
      },
      outstandingPayments: {
        value: 3390000,
        changePercentage: -4.1,
        trend: 'down',
        comparisonPeriod: 'vs last month',
      },
      totalCustomers: {
        value: 42,
        changePercentage: 18.0,
        trend: 'up',
        comparisonPeriod: 'vs last month',
      },
      totalEnquiries: {
        value: 35,
        changePercentage: 22.4,
        trend: 'up',
        comparisonPeriod: 'vs last month',
      },
      activeProjects: {
        value: 17,
        changePercentage: 5.2,
        trend: 'up',
        comparisonPeriod: 'vs last month',
      },
      pendingSurveys: {
        value: 5,
        changePercentage: -12.5,
        trend: 'down',
        comparisonPeriod: 'vs last month',
      },
      openServiceTickets: {
        value: 4,
        changePercentage: 0.0,
        trend: 'neutral',
        comparisonPeriod: 'vs last month',
      },
      lowStockAlerts: {
        value: 4,
        changePercentage: 33.3,
        trend: 'up',
        comparisonPeriod: 'critical stock items',
      },
    };
  },

  getProjectAnalytics() {
    const projects = this.getProjects();
    const statusColors = {
      Enquiry: '#38BDF8',
      'Survey Pending': '#F59E0B',
      'Quotation Pending': '#FB923C',
      Approved: '#10B981',
      'In Progress': '#0284C7',
      Completed: '#0369A1',
      Cancelled: '#EF4444',
    };

    const counts = {};
    Object.keys(statusColors).forEach((st) => (counts[st] = 0));

    projects.forEach((p) => {
      if (counts[p.status] !== undefined) {
        counts[p.status] += 1;
      } else {
        counts[p.status] = (counts[p.status] || 0) + 1;
      }
    });

    return Object.keys(counts).map((status) => ({
      status,
      count: counts[status],
      color: statusColors[status] || '#64748B',
    }));
  },

  getRevenueAnalytics(period = '12m') {
    // Dynamically adjust series if 7d, 30d, 90d, or 1y / 6m / 12m / ytd
    if (period === '7d') {
      return [
        { month: 'Mon', revenue: 160000, received: 130000, outstanding: 30000 },
        { month: 'Tue', revenue: 210000, received: 175000, outstanding: 35000 },
        { month: 'Wed', revenue: 140000, received: 115000, outstanding: 25000 },
        { month: 'Thu', revenue: 290000, received: 240000, outstanding: 50000 },
        { month: 'Fri', revenue: 220000, received: 180000, outstanding: 40000 },
        { month: 'Sat', revenue: 130000, received: 100000, outstanding: 30000 },
        { month: 'Sun', revenue: 90000, received: 40000, outstanding: 50000 },
      ];
    }
    if (period === '30d') {
      return [
        { month: 'Week 1', revenue: 9800000, received: 7500000, outstanding: 2300000 },
        { month: 'Week 2', revenue: 12400000, received: 9800000, outstanding: 2600000 },
        { month: 'Week 3', revenue: 11200000, received: 8400000, outstanding: 2800000 },
        { month: 'Week 4', revenue: 15100000, received: 10500000, outstanding: 4600000 },
      ];
    }
    if (period === '90d') {
      return [
        { month: 'Month 1', revenue: 42000000, received: 34000000, outstanding: 8000000 },
        { month: 'Month 2', revenue: 51000000, received: 41000000, outstanding: 10000000 },
        { month: 'Month 3', revenue: 55000000, received: 43000000, outstanding: 12000000 },
      ];
    }
    const base = mockRevenueAnalytics[period] || mockRevenueAnalytics['12m'];
    return base;
  },

  getInstallationAnalytics() {
    return mockInstallationData;
  },

  // --------------------------------------------------------------------------
  // SALES MODULE: FOLLOW-UPS CRUD
  // --------------------------------------------------------------------------
  getFollowUps() {
    return getStored(KEYS.FOLLOW_UPS, mockFollowUps);
  },

  createFollowUp(data) {
    const list = this.getFollowUps();
    const newId = `FOL-${300 + list.length + 1}`;
    const newFollowUp = {
      id: newId,
      enquiryId: data.enquiryId || 'ENQ-GENERAL',
      customerId: data.customerId || '',
      customerName: data.customerName || 'Prospect',
      contact: data.contact || '',
      followUpDate: data.followUpDate || new Date().toISOString().split('T')[0],
      followUpTime: data.followUpTime || '11:00 AM',
      type: data.type || 'Phone Call',
      purpose: data.purpose || 'Follow-up regarding solar requirement',
      priority: data.priority || 'Medium',
      status: 'Pending',
      notes: data.notes || '',
      assignedTo: data.assignedTo || 'Vikram Singh',
      createdAt: new Date().toISOString(),
    };

    const updated = [newFollowUp, ...list];
    setStored(KEYS.FOLLOW_UPS, updated);

    this.logActivity(
      `Scheduled ${newFollowUp.type} follow-up for ${newFollowUp.customerName} (${newFollowUp.followUpDate})`,
      'Sales Follow-ups',
      'Created'
    );

    return newFollowUp;
  },

  updateFollowUp(id, patch) {
    const list = this.getFollowUps();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) throw new Error(`Follow-up with ID ${id} not found`);

    const updated = { ...list[index], ...patch };
    list[index] = updated;
    setStored(KEYS.FOLLOW_UPS, list);

    this.logActivity(`Updated follow-up record ${id}`, 'Sales Follow-ups', 'Updated');
    return updated;
  },

  completeFollowUp(id, outcomeNotes = '') {
    const list = this.getFollowUps();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) throw new Error(`Follow-up with ID ${id} not found`);

    list[index] = {
      ...list[index],
      status: 'Completed',
      outcomeNotes: outcomeNotes || 'Follow-up completed successfully.',
      completedAt: new Date().toISOString(),
    };

    setStored(KEYS.FOLLOW_UPS, list);
    this.logActivity(
      `Completed follow-up ${id} for ${list[index].customerName}`,
      'Sales Follow-ups',
      'Completed'
    );
    return list[index];
  },

  rescheduleFollowUp(id, newDate, newTime, notes = '') {
    const list = this.getFollowUps();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) throw new Error(`Follow-up with ID ${id} not found`);

    list[index] = {
      ...list[index],
      followUpDate: newDate,
      followUpTime: newTime,
      status: 'Rescheduled',
      notes: notes ? `${list[index].notes ? list[index].notes + ' | ' : ''}Rescheduled: ${notes}` : list[index].notes,
    };

    setStored(KEYS.FOLLOW_UPS, list);
    this.logActivity(
      `Rescheduled follow-up ${id} for ${list[index].customerName} to ${newDate} ${newTime}`,
      'Sales Follow-ups',
      'Rescheduled'
    );
    return list[index];
  },

  deleteFollowUp(id) {
    const list = this.getFollowUps();
    const updated = list.filter((f) => f.id !== id);
    setStored(KEYS.FOLLOW_UPS, updated);
    this.logActivity(`Deleted follow-up ${id}`, 'Sales Follow-ups', 'Deleted');
    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // SALES MODULE: SITE SURVEYS CRUD
  // --------------------------------------------------------------------------
  getSurveys() {
    return getStored(KEYS.SURVEYS, mockSalesSurveys);
  },

  scheduleSurvey(data) {
    const list = this.getSurveys();
    const newId = `SRV-${200 + list.length + 1}`;
    const newSurvey = {
      id: newId,
      enquiryId: data.enquiryId || 'ENQ-GENERAL',
      customerId: data.customerId || '',
      customerName: data.customerName || 'Customer',
      contact: data.contact || '',
      siteLocation: data.siteLocation || 'Jaipur, Rajasthan',
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: data.scheduledTime || '10:30 AM',
      assignedSurveyor: data.assignedSurveyor || 'Kailash Chand (Field Tech)',
      status: 'Scheduled',
      roofType: data.roofType || 'RCC Flat Roof',
      roofAreaSqFt: Number(data.roofAreaSqFt) || 1000,
      shadowHazards: data.shadowHazards || 'None reported',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newSurvey, ...list];
    setStored(KEYS.SURVEYS, updated);

    // Also update linked enquiry status to 'Survey Scheduled'
    if (data.enquiryId) {
      try {
        this.updateEnquiry(data.enquiryId, { enquiryStatus: 'Survey Scheduled' });
      } catch {
        // ignore if enquiry doesn't exist
      }
    }

    this.logActivity(
      `Scheduled site survey ${newSurvey.id} for ${newSurvey.customerName} on ${newSurvey.scheduledDate}`,
      'Site Surveys',
      'Scheduled'
    );

    return newSurvey;
  },

  updateSurvey(id, patch) {
    const list = this.getSurveys();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Survey with ID ${id} not found`);

    const updated = { ...list[index], ...patch };
    list[index] = updated;
    setStored(KEYS.SURVEYS, list);
    this.logActivity(`Updated site survey ${id}`, 'Site Surveys', 'Updated');
    return updated;
  },

  deleteSurvey(id) {
    const list = this.getSurveys();
    const updated = list.filter((s) => s.id !== id);
    setStored(KEYS.SURVEYS, updated);
    this.logActivity(`Cancelled site survey ${id}`, 'Site Surveys', 'Deleted');
    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // SALES MODULE: QUOTATIONS CRUD
  // --------------------------------------------------------------------------
  getQuotations() {
    return getStored(KEYS.QUOTATIONS, mockSalesQuotations);
  },

  getQuotationById(id) {
    const list = this.getQuotations();
    return list.find((q) => q.id === id) || null;
  },

  createQuotation(data) {
    const list = this.getQuotations();
    const newId = `QUO-${700 + list.length + 1}`;
    
    // Auto calculate if items provided
    const items = data.items || [];
    const subtotal = data.subtotal || items.reduce((acc, curr) => acc + (Number(curr.lineTotal) || 0), 0);
    const subsidy = Number(data.subsidy) || 0;
    const discount = Number(data.discount) || 0;
    const taxRate = Number(data.taxRate) || 13.8;
    const taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : Math.round((subtotal - discount) * (taxRate / 100));
    const finalAmount = data.finalAmount || (subtotal - subsidy - discount + taxAmount);

    const newQuotation = {
      id: newId,
      enquiryId: data.enquiryId || '',
      customerId: data.customerId || '',
      customerName: data.customerName || 'Valued Client',
      contact: data.contact || '',
      systemCapacity: Number(data.systemCapacity) || 5.0,
      dailyGeneration: `${Math.round((Number(data.systemCapacity) || 5) * 4.5)} kWh`,
      items,
      subtotal,
      subsidy,
      discount,
      taxRate,
      taxAmount,
      finalAmount,
      createdDate: new Date().toISOString(),
      expiryDate: data.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      approvalStatus: data.approvalStatus || 'Draft',
      status: data.status || 'Draft',
      notes: data.notes || '',
    };

    const updated = [newQuotation, ...list];
    setStored(KEYS.QUOTATIONS, updated);

    // Link enquiry status if provided
    if (data.enquiryId) {
      try {
        this.updateEnquiry(data.enquiryId, { enquiryStatus: 'Quotation Sent' });
      } catch {
        // ignore
      }
    }

    this.logActivity(
      `Created quotation ${newQuotation.id} for ${newQuotation.customerName} (₹${newQuotation.finalAmount.toLocaleString('en-IN')})`,
      'Quotations',
      'Created'
    );

    return newQuotation;
  },

  updateQuotation(id, patch) {
    const list = this.getQuotations();
    const index = list.findIndex((q) => q.id === id);
    if (index === -1) throw new Error(`Quotation with ID ${id} not found`);

    const updated = { ...list[index], ...patch };
    list[index] = updated;
    setStored(KEYS.QUOTATIONS, list);
    this.logActivity(`Updated quotation ${id}`, 'Quotations', 'Updated');
    return updated;
  },

  approveQuotation(id) {
    return this.updateQuotation(id, { approvalStatus: 'Approved', status: 'Approved' });
  },

  acceptQuotation(id, convertToOrder = true) {
    const quotation = this.updateQuotation(id, { status: 'Accepted' });
    let linkedOrder = null;

    if (convertToOrder) {
      linkedOrder = this.createOrder({
        quotationId: quotation.id,
        enquiryId: quotation.enquiryId,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        contact: quotation.contact,
        capacity: `${quotation.systemCapacity} kW`,
        amount: quotation.finalAmount,
      });
    }

    this.logActivity(
      `Quotation ${id} accepted by customer. Converted into order ${linkedOrder?.id || ''}`,
      'Quotations',
      'Accepted'
    );

    return { quotation, order: linkedOrder };
  },

  deleteQuotation(id) {
    const list = this.getQuotations();
    const updated = list.filter((q) => q.id !== id);
    setStored(KEYS.QUOTATIONS, updated);
    this.logActivity(`Deleted quotation ${id}`, 'Quotations', 'Deleted');
    return { id, success: true };
  },

  // --------------------------------------------------------------------------
  // SALES MODULE: ORDERS CRUD
  // --------------------------------------------------------------------------
  getOrders() {
    const raw = getStored(KEYS.ORDERS, mockSalesOrders);
    let changed = false;
    const normalized = raw.map((ord) => {
      const milestones = ord.milestones || [];
      const completed = milestones.filter((m) => m.status === 'Completed').length;
      const is100 = (milestones.length > 0 && completed === milestones.length) || String(ord.orderStatus).toLowerCase() === 'done';
      if (is100) {
        if (ord.orderStatus !== 'Done' || !ord.paymentStatus?.toLowerCase().includes('full')) {
          changed = true;
          return {
            ...ord,
            orderStatus: 'Done',
            paymentStatus: 'Full payment received',
            stage: 'Completed',
          };
        }
      }
      return ord;
    });
    if (changed) {
      setStored(KEYS.ORDERS, normalized);
    }
    return normalized;
  },

  getOrderById(id) {
    const list = this.getOrders();
    return list.find((o) => o.id === id) || null;
  },

  createOrder(data) {
    const list = this.getOrders();
    const newId = `ORD-${900 + list.length + 1}`;
    const newOrder = {
      id: newId,
      quotationId: data.quotationId || 'QUO-DIRECT',
      enquiryId: data.enquiryId || '',
      customerId: data.customerId || '',
      customerName: data.customerName || 'Valued Customer',
      contact: data.contact || '',
      capacity: data.capacity || '5.0 kW',
      amount: Number(data.amount) || 250000,
      orderDate: new Date().toISOString(),
      paymentStatus: data.paymentStatus || 'Advance Paid (30%)',
      orderStatus: data.orderStatus || 'Confirmed',
      milestones: [
        { step: 'Order Contract Signed', status: 'Completed', date: new Date().toISOString().split('T')[0] },
        { step: 'DISCOM Application Submitted', status: 'In Progress', date: null },
        { step: 'Warehouse Material Staging', status: 'Pending', date: null },
        { step: 'Rooftop Installation', status: 'Pending', date: null },
        { step: 'Net Metering & Commissioning', status: 'Pending', date: null },
      ],
    };

    const updated = [newOrder, ...list];
    setStored(KEYS.ORDERS, updated);

    this.logActivity(
      `Converted confirmed solar order ${newOrder.id} for ${newOrder.customerName} (₹${newOrder.amount.toLocaleString('en-IN')})`,
      'Sales Orders',
      'Confirmed'
    );

    return newOrder;
  },

  updateOrderStatus(id, status, milestoneIndex = null) {
    const list = this.getOrders();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Order with ID ${id} not found`);

    const order = { ...list[index] };
    if (status) order.orderStatus = status;

    if (milestoneIndex !== null && order.milestones && order.milestones[milestoneIndex]) {
      order.milestones[milestoneIndex].status = 'Completed';
      order.milestones[milestoneIndex].date = new Date().toISOString().split('T')[0];
    }

    const completedCount = (order.milestones || []).filter((m) => m.status === 'Completed').length;
    const totalCount = (order.milestones || []).length;
    if ((totalCount > 0 && completedCount === totalCount) || order.orderStatus === 'Done') {
      order.orderStatus = 'Done';
      order.paymentStatus = 'Full payment received';
      order.stage = 'Completed';
    }

    list[index] = order;
    setStored(KEYS.ORDERS, list);
    this.logActivity(`Updated order ${id} status to "${order.orderStatus}"`, 'Sales Orders', 'Updated');
    return order;
  },

  // --------------------------------------------------------------------------
  // SALES MODULE: DYNAMIC METRICS & ANALYTICS
  // --------------------------------------------------------------------------
  getSalesStats() {
    const customers = this.getCustomers();
    const enquiries = this.getEnquiries();
    const followUps = this.getFollowUps();
    const surveys = this.getSurveys();
    const quotations = this.getQuotations();
    const orders = this.getOrders();

    const totalCustomers = customers.length;
    const totalEnquiries = enquiries.length;
    const newLeads = enquiries.filter((e) => (e.enquiryStatus || e.status) === 'New').length;
    const convertedEnquiries = enquiries.filter(
      (e) => (e.enquiryStatus || e.status) === 'Converted' || (e.enquiryStatus || e.status) === 'Quotation Accepted'
    ).length;

    const totalFollowUps = followUps.length;
    const pendingFollowUps = followUps.filter((f) => f.status === 'Pending' || f.status === 'Overdue').length;
    const completedFollowUps = followUps.filter((f) => f.status === 'Completed').length;

    const totalSurveys = surveys.length;
    const upcomingSurveys = surveys.filter((s) => s.status === 'Scheduled' || s.status === 'In Progress').length;
    const completedSurveys = surveys.filter((s) => s.status === 'Completed').length;

    const totalQuotations = quotations.length;
    const pendingQuotations = quotations.filter((q) => q.status === 'Draft' || q.status === 'Sent' || q.status === 'Submitted' || q.status === 'Approved').length;
    const acceptedQuotations = quotations.filter((q) => q.status === 'Accepted').length;

    const totalOrders = orders.length;

    // Monthly revenue from orders
    const monthlySalesRevenue = orders.reduce((acc, curr) => acc + (Number(curr.amount || curr.contractValue || curr.finalAmount) || 0), 0);
    const monthlyTarget = 6000000;
    const targetAchievementPercent = Math.min(100, Number(((monthlySalesRevenue / monthlyTarget) * 100).toFixed(1)));
    const conversionRate = totalEnquiries > 0 ? Number(((convertedEnquiries / totalEnquiries) * 100).toFixed(1)) : 0;

    return {
      totalCustomers,
      totalEnquiries,
      newLeads,
      convertedEnquiries,
      conversionRate,
      totalFollowUps,
      pendingFollowUps,
      completedFollowUps,
      totalSurveys,
      upcomingSurveys,
      completedSurveys,
      totalQuotations,
      pendingQuotations,
      acceptedQuotations,
      totalOrders,
      monthlySalesRevenue,
      monthlyTarget,
      targetAchievementPercent,
    };
  },

  getSalesAnalytics() {
    return mockSalesAnalytics;
  },

  // --------------------------------------------------------------------------
  // RESET ALL DATA TO PRISTINE SAMPLE STATE
  // --------------------------------------------------------------------------
  resetToDefaults() {
    setStored(KEYS.PROJECTS, mockProjects);
    setStored(KEYS.PAYMENTS, mockPayments);
    setStored(KEYS.ENQUIRIES, mockEnquiries);
    setStored(KEYS.SERVICE_TICKETS, mockServiceTickets);
    setStored(KEYS.ALERTS, mockAlerts);
    setStored(KEYS.INVENTORY, mockInventoryData);
    setStored(KEYS.ACTIVITIES, mockActivities);
    setStored(KEYS.CUSTOMERS, mockCustomers);
    setStored(KEYS.PRODUCTS, mockProducts);
    setStored(KEYS.ACCESS_REQUESTS, mockAccessRequests);
    setStored(KEYS.FOLLOW_UPS, mockFollowUps);
    setStored(KEYS.SURVEYS, mockSalesSurveys);
    setStored(KEYS.QUOTATIONS, mockSalesQuotations);
    setStored(KEYS.ORDERS, mockSalesOrders);

    this.logActivity('Reset all administrative and sales sample data to default baseline', 'System', 'Success');
    return true;
  },
};

// Auto-run init on load
storageService.init();

export default storageService;
