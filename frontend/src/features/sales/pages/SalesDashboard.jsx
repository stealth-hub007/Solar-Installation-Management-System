import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import SalesWelcome from '../components/dashboard/SalesWelcome';
import SalesStats from '../components/dashboard/SalesStats';
import SalesOverviewChart from '../components/dashboard/SalesOverviewChart';
import EnquirySourceChart from '../components/dashboard/EnquirySourceChart';
import SalesPipelineChart from '../components/dashboard/SalesPipelineChart';
import MonthlyTargetProgress from '../components/dashboard/MonthlyTargetProgress';
import UpcomingFollowUps from '../components/dashboard/UpcomingFollowUps';
import PendingTasks from '../components/dashboard/PendingTasks';
import RecentSalesActivities from '../components/dashboard/RecentSalesActivities';

import Modal from '../../../components/ui/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';

import {
  fetchSalesStats,
  fetchSalesAnalytics,
  fetchUpcomingFollowUps,
  fetchSalesActivities,
} from '../slices/salesDashboardSlice';

import { createCustomer } from '../slices/customerSlice';
import { createEnquiry } from '../slices/enquirySlice';
import { createFollowUp, completeFollowUp, rescheduleFollowUp } from '../slices/followUpSlice';
import { createQuotation } from '../slices/quotationSlice';
import { selectCurrentUser, selectUserRole } from '../../auth/authSlice';

import { CUSTOMER_TYPES, FOLLOWUP_TYPES, FOLLOWUP_PRIORITIES } from '../utils/salesConstants';
import { validateCustomerForm, validateEnquiryForm, validateFollowUpForm } from '../utils/salesValidators';

export const SalesDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { stats, analytics, upcomingFollowUps, activities, loading } = useSelector(
    (state) => state.salesDashboard
  );

  const reduxUser = useSelector(selectCurrentUser);
  const reduxRole = useSelector(selectUserRole);

  // Determine current active user with role-based detection
  const authUser = reduxUser || (() => {
    try {
      const saved = localStorage.getItem('sims_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })() || { full_name: 'Sales Executive', email: 'sales@sunpower.com', role: 'SALES' };

  const currentRole = (reduxRole || authUser.role || '').toUpperCase();
  const isAdmin = currentRole === 'ADMIN' || currentRole === 'SUPER ADMINISTRATOR';
  const activeUserName = authUser.full_name || authUser.name || (isAdmin ? 'Administrator' : 'Sales Executive');

  // Quick Action Modal states
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isCreateEnquiryOpen, setIsCreateEnquiryOpen] = useState(false);
  const [isScheduleFollowUpOpen, setIsScheduleFollowUpOpen] = useState(false);
  const [completingFollowUp, setCompletingFollowUp] = useState(null);
  const [reschedulingFollowUp, setReschedulingFollowUp] = useState(null);

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '+91 ',
    email: '',
    city: 'Jaipur',
    type: 'Residential',
    address: '',
    notes: '',
  });
  const [customerErrors, setCustomerErrors] = useState({});

  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: '',
    contactNumber: '+91 ',
    email: '',
    source: 'Website Form',
    capacity: 5.0,
    location: 'Jaipur, Rajasthan',
    propertyType: 'Residential',
    notes: '',
  });
  const [enquiryErrors, setEnquiryErrors] = useState({});

  // Follow-up Form State
  const [followUpForm, setFollowUpForm] = useState({
    customerName: '',
    contact: '+91 ',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '11:00 AM',
    type: 'Phone Call',
    purpose: '',
    priority: 'Medium',
    notes: '',
  });
  const [followUpErrors, setFollowUpErrors] = useState({});

  // Complete / Reschedule inputs
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  // Initial Data Fetch & Real-time Live Sync
  useEffect(() => {
    dispatch(fetchSalesStats());
    dispatch(fetchSalesAnalytics());
    dispatch(fetchUpcomingFollowUps());
    dispatch(fetchSalesActivities());

    const refreshDashboard = () => {
      dispatch(fetchSalesStats());
      dispatch(fetchUpcomingFollowUps());
      dispatch(fetchSalesActivities());
    };

    window.addEventListener('storage', refreshDashboard);
    window.addEventListener('focus', refreshDashboard);
    return () => {
      window.removeEventListener('storage', refreshDashboard);
      window.removeEventListener('focus', refreshDashboard);
    };
  }, [dispatch]);

  // Handle Quick Add Customer Submit
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateCustomerForm(customerForm);
    if (!isValid) {
      setCustomerErrors(errors);
      return;
    }

    await dispatch(createCustomer(customerForm));
    dispatch(fetchSalesStats());
    dispatch(fetchSalesActivities());
    setIsAddCustomerOpen(false);
    setCustomerForm({
      name: '',
      phone: '+91 ',
      email: '',
      city: 'Jaipur',
      type: 'Residential',
      address: '',
      notes: '',
    });
    setCustomerErrors({});
  };

  // Handle Quick Create Enquiry Submit
  const handleCreateEnquirySubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateEnquiryForm(enquiryForm);
    if (!isValid) {
      setEnquiryErrors(errors);
      return;
    }

    await dispatch(
      createEnquiry({
        customerName: enquiryForm.customerName,
        contactNumber: enquiryForm.contactNumber,
        email: enquiryForm.email,
        address: enquiryForm.location,
        enquirySource: enquiryForm.source,
        capacity: `${enquiryForm.capacity} kW Rooftop`,
        enquiryStatus: 'New',
        notes: enquiryForm.notes,
      })
    );

    dispatch(fetchSalesStats());
    dispatch(fetchSalesActivities());
    setIsCreateEnquiryOpen(false);
    setEnquiryForm({
      customerName: '',
      contactNumber: '+91 ',
      email: '',
      source: 'Website Form',
      capacity: 5.0,
      location: 'Jaipur, Rajasthan',
      propertyType: 'Residential',
      notes: '',
    });
    setEnquiryErrors({});
  };

  // Handle Schedule Follow-up Submit
  const handleScheduleFollowUpSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateFollowUpForm(followUpForm);
    if (!isValid) {
      setFollowUpErrors(errors);
      return;
    }

    await dispatch(createFollowUp(followUpForm));
    dispatch(fetchSalesStats());
    dispatch(fetchUpcomingFollowUps());
    dispatch(fetchSalesActivities());
    setIsScheduleFollowUpOpen(false);
    setFollowUpForm({
      customerName: '',
      contact: '+91 ',
      followUpDate: new Date().toISOString().split('T')[0],
      followUpTime: '11:00 AM',
      type: 'Phone Call',
      purpose: '',
      priority: 'Medium',
      notes: '',
    });
    setFollowUpErrors({});
  };

  // Handle Complete Follow-up Submit
  const handleCompleteFollowUpSubmit = async () => {
    if (!completingFollowUp) return;
    await dispatch(
      completeFollowUp({
        id: completingFollowUp.id,
        outcomeNotes,
      })
    );
    dispatch(fetchSalesStats());
    dispatch(fetchUpcomingFollowUps());
    dispatch(fetchSalesActivities());
    setCompletingFollowUp(null);
    setOutcomeNotes('');
  };

  // Handle Reschedule Follow-up Submit
  const handleRescheduleFollowUpSubmit = async () => {
    if (!reschedulingFollowUp || !rescheduleDate) return;
    await dispatch(
      rescheduleFollowUp({
        id: reschedulingFollowUp.id,
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        notes: rescheduleNotes,
      })
    );
    dispatch(fetchSalesStats());
    dispatch(fetchUpcomingFollowUps());
    dispatch(fetchSalesActivities());
    setReschedulingFollowUp(null);
    setRescheduleDate('');
    setRescheduleNotes('');
  };

  return (
    <PageContainer>
      {/* 1. Welcome Banner with Quick Actions */}
      <SalesWelcome
        salesRepName={activeUserName}
        isAdmin={isAdmin}
        stats={stats}
        onAddCustomer={() => setIsAddCustomerOpen(true)}
        onCreateEnquiry={() => setIsCreateEnquiryOpen(true)}
        onScheduleFollowUp={() => setIsScheduleFollowUpOpen(true)}
        onCreateQuotation={() => navigate('/sales/quotations?create=true')}
      />

      {/* 2. Key Sales Metrics Grid (10 KPI Cards) */}
      <SalesStats stats={stats} loading={loading} />

      {/* 3. Primary Visual Analytics: Revenue Trend & Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SalesOverviewChart data={analytics?.revenueTrend || []} />
        </div>
        <div>
          <EnquirySourceChart data={analytics?.enquirySources} />
        </div>
      </div>

      {/* 4. Secondary Analytics: Pipeline Funnel & Monthly Target */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SalesPipelineChart data={analytics?.salesPipeline} />
        </div>
        <div>
          <MonthlyTargetProgress
            target={stats?.monthlyTarget || 6000000}
            achieved={stats?.monthlySalesRevenue || 4850000}
            percentage={stats?.targetAchievementPercent || 80.8}
          />
        </div>
      </div>

      {/* 5. Follow-ups, Pending Tasks & Recent Sales Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UpcomingFollowUps
          followUps={upcomingFollowUps}
          onComplete={(item) => setCompletingFollowUp(item)}
          onReschedule={(item) => {
            setReschedulingFollowUp(item);
            setRescheduleDate(item.followUpDate);
            setRescheduleTime(item.followUpTime);
          }}
        />

        <PendingTasks tasks={analytics?.pendingTasks} />

        <RecentSalesActivities activities={activities} />
      </div>

      {/* MODAL: Add Customer */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Add New Solar Customer"
        size="md"
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <Input
            label="Customer / Company Name"
            required
            value={customerForm.name}
            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
            placeholder="e.g. Ramesh Chandra / Apex Tech"
            error={customerErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              required
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              placeholder="+91 98290 12345"
              error={customerErrors.phone}
            />
            <Input
              label="Email Address"
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              placeholder="client@example.com"
              error={customerErrors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City / Location"
              required
              value={customerForm.city}
              onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
              placeholder="e.g. Jaipur, Rajasthan"
              error={customerErrors.city}
            />
            <Select
              label="Customer Segment"
              value={customerForm.type}
              onChange={(e) => setCustomerForm({ ...customerForm, type: e.target.value })}
              options={CUSTOMER_TYPES}
            />
          </div>

          <Input
            label="Site Address"
            type="textarea"
            rows={2}
            value={customerForm.address}
            onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
            placeholder="Full site address details..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddCustomerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Create Enquiry */}
      <Modal
        isOpen={isCreateEnquiryOpen}
        onClose={() => setIsCreateEnquiryOpen(false)}
        title="Create New Solar Enquiry"
        size="md"
      >
        <form onSubmit={handleCreateEnquirySubmit} className="space-y-4">
          <Input
            label="Customer Name"
            required
            value={enquiryForm.customerName}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, customerName: e.target.value })}
            placeholder="e.g. Rajesh Kumar"
            error={enquiryErrors.customerName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              required
              value={enquiryForm.contactNumber}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, contactNumber: e.target.value })}
              placeholder="+91 98290 12345"
              error={enquiryErrors.contactNumber}
            />
            <Input
              label="Email Address"
              type="email"
              value={enquiryForm.email}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
              placeholder="client@gmail.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Required Capacity (kW)"
              type="number"
              required
              suffix="kW"
              value={enquiryForm.capacity}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, capacity: Number(e.target.value) })}
              error={enquiryErrors.capacity}
            />
            <Select
              label="Lead Source"
              value={enquiryForm.source}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, source: e.target.value })}
              options={[
                'Website Form',
                'Referral',
                'Social Media',
                'Direct Call / Walk-in',
                'Campaign / Expo',
              ]}
            />
          </div>

          <Input
            label="Site Location / Address"
            required
            value={enquiryForm.location}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, location: e.target.value })}
            placeholder="e.g. Malviya Nagar, Jaipur"
            error={enquiryErrors.location}
          />

          <Input
            label="Notes / Power Consumption Details"
            type="textarea"
            rows={2}
            value={enquiryForm.notes}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
            placeholder="e.g. Monthly bill ₹8,000, 3-phase meter"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateEnquiryOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Enquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Schedule Follow-up */}
      <Modal
        isOpen={isScheduleFollowUpOpen}
        onClose={() => setIsScheduleFollowUpOpen(false)}
        title="Schedule Client Follow-up"
        size="md"
      >
        <form onSubmit={handleScheduleFollowUpSubmit} className="space-y-4">
          <Input
            label="Customer Name"
            required
            value={followUpForm.customerName}
            onChange={(e) => setFollowUpForm({ ...followUpForm, customerName: e.target.value })}
            placeholder="Customer name"
            error={followUpErrors.customerName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Follow-up Date"
              type="date"
              required
              value={followUpForm.followUpDate}
              onChange={(e) => setFollowUpForm({ ...followUpForm, followUpDate: e.target.value })}
              error={followUpErrors.followUpDate}
            />
            <Input
              label="Time Slot"
              value={followUpForm.followUpTime}
              onChange={(e) => setFollowUpForm({ ...followUpForm, followUpTime: e.target.value })}
              placeholder="e.g. 11:30 AM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Communication Type"
              value={followUpForm.type}
              onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
              options={FOLLOWUP_TYPES}
            />
            <Select
              label="Priority Level"
              value={followUpForm.priority}
              onChange={(e) => setFollowUpForm({ ...followUpForm, priority: e.target.value })}
              options={FOLLOWUP_PRIORITIES}
            />
          </div>

          <Input
            label="Follow-up Objective / Purpose"
            required
            value={followUpForm.purpose}
            onChange={(e) => setFollowUpForm({ ...followUpForm, purpose: e.target.value })}
            placeholder="e.g. Quotation discussion and subsidy calculation"
            error={followUpErrors.purpose}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsScheduleFollowUpOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Complete Follow-up */}
      <Modal
        isOpen={!!completingFollowUp}
        onClose={() => setCompletingFollowUp(null)}
        title="Mark Follow-up Completed"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Completing follow-up for{' '}
            <span className="font-bold text-slate-800">{completingFollowUp?.customerName}</span>.
          </p>

          <Input
            label="Meeting / Call Outcome Notes"
            type="textarea"
            rows={3}
            value={outcomeNotes}
            onChange={(e) => setOutcomeNotes(e.target.value)}
            placeholder="e.g. Customer agreed to 8 kW rooftop proposal. Scheduled survey."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setCompletingFollowUp(null)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleCompleteFollowUpSubmit}>
              Mark Completed
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Reschedule Follow-up */}
      <Modal
        isOpen={!!reschedulingFollowUp}
        onClose={() => setReschedulingFollowUp(null)}
        title="Reschedule Follow-up"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Rescheduling for{' '}
            <span className="font-bold text-slate-800">{reschedulingFollowUp?.customerName}</span>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="New Date"
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
            <Input
              label="Time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
            />
          </div>

          <Input
            label="Reason for Rescheduling"
            type="textarea"
            rows={2}
            value={rescheduleNotes}
            onChange={(e) => setRescheduleNotes(e.target.value)}
            placeholder="e.g. Customer was traveling; requested call back next week."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReschedulingFollowUp(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRescheduleFollowUpSubmit}>
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default SalesDashboard;

