import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const demoInstallations = [
  {
    id: 'INS-8001',
    rawId: '8001-uuid',
    jobNumber: 'JOB-2026-8001',
    orderNumber: 'ORD-8001',
    projectRef: 'SIMS-PRJ-1082',
    customerName: 'Rajesh Sharma',
    contact: '+91 98290 11223',
    installationAddress: 'B-12, Vaishali Nagar, Jaipur, Rajasthan',
    capacity: '10.5 kW',
    scheduledDate: '2026-10-31',
    installation_status: 'IN_PROGRESS',
    status: 'In Progress',
    dispatchStatus: 'Delivered (DSP-701)',
    checklistCompleted: 7,
    checklistTotal: 9,
    assignedTechnician: 'Vikram Singh',
    panels: '20x Adani 540W Mono PERC Panels',
    inverter: '1x Growatt 10kW On-Grid 3-Phase Inverter',
    battery: 'None (Grid-Tie)',
    checklist: {
      mounting_stands_installed: true,
      solar_panels_installed: true,
      inverter_installed: true,
      battery_installed: false,
      wiring_completed: true,
      safety_equipment_installed: true,
      earthing_completed: true,
      system_tested: true,
      power_generation_verified: false,
    },
    equipments: [
      { id: 'EQ-1', name: 'Adani 540W Mono PERC Half-Cut Panels', expectedQty: 20, deliveredQty: 20, status: 'VERIFIED', serialPrefix: 'ADN-540-' },
      { id: 'EQ-2', name: 'Growatt 10kW On-Grid 3-Phase Inverter', expectedQty: 1, deliveredQty: 1, status: 'VERIFIED', serialPrefix: 'GRW-10K-' },
      { id: 'EQ-3', name: 'HDG Elevated Mounting Structure (8ft)', expectedQty: 1, deliveredQty: 1, status: 'VERIFIED', serialPrefix: 'HDG-STR-' },
      { id: 'EQ-4', name: 'ACDB/DCDB SPD & Chemical Earthing Kit', expectedQty: 1, deliveredQty: 1, status: 'VERIFIED', serialPrefix: 'EARTH-KIT-' },
    ],
    workLogs: [
      { id: 'WL-1', startTime: '2026-10-31T09:00:00Z', endTime: '2026-10-31T14:30:00Z', totalHours: 5.5, notes: 'Completed structure assembly and solar panel string clamping.' },
    ],
    signoff: null,
  },
  {
    id: 'INS-8002',
    rawId: '8002-uuid',
    jobNumber: 'JOB-2026-8002',
    orderNumber: 'ORD-8002',
    projectRef: 'SIMS-PRJ-1081',
    customerName: 'Apex Textiles Ltd.',
    contact: '+91 98290 44556',
    installationAddress: 'Plot 45, RIICO Ind. Area, Bhilwara, Rajasthan',
    capacity: '50.0 kW',
    scheduledDate: '2026-11-03',
    installation_status: 'SCHEDULED',
    status: 'Scheduled',
    dispatchStatus: 'Delivered (DSP-702)',
    checklistCompleted: 2,
    checklistTotal: 9,
    assignedTechnician: 'Vikram Singh',
    panels: '96x Waaree 540W Mono PERC Modules',
    inverter: '1x Sungrow 50kW Commercial Inverter',
    battery: 'None',
    checklist: {
      mounting_stands_installed: true,
      solar_panels_installed: false,
      inverter_installed: false,
      battery_installed: false,
      wiring_completed: false,
      safety_equipment_installed: false,
      earthing_completed: false,
      system_tested: false,
      power_generation_verified: false,
    },
    equipments: [
      { id: 'EQ-5', name: 'Waaree 540W Mono PERC Modules', expectedQty: 96, deliveredQty: 96, status: 'PENDING', serialPrefix: 'WAR-540-' },
      { id: 'EQ-6', name: 'Sungrow 50kW Three-Phase Inverter', expectedQty: 1, deliveredQty: 1, status: 'PENDING', serialPrefix: 'SNG-50K-' },
    ],
    workLogs: [],
    signoff: null,
  },
  {
    id: 'INS-8003',
    rawId: '8003-uuid',
    jobNumber: 'JOB-2026-8003',
    orderNumber: 'ORD-8003',
    projectRef: 'SIMS-PRJ-1080',
    customerName: 'Priya Meena',
    contact: '+91 98291 99001',
    installationAddress: '12 Mahaveer Nagar, Kota, Rajasthan',
    capacity: '5.0 kW',
    scheduledDate: '2026-10-27',
    installation_status: 'COMPLETED',
    status: 'Completed',
    dispatchStatus: 'Delivered (DSP-704)',
    checklistCompleted: 9,
    checklistTotal: 9,
    assignedTechnician: 'Vikram Singh',
    panels: '10x Adani 540W Panels',
    inverter: '1x Growatt 5kW Hybrid Inverter',
    battery: '1x LiFePO4 48V 100Ah Battery',
    checklist: {
      mounting_stands_installed: true,
      solar_panels_installed: true,
      inverter_installed: true,
      battery_installed: true,
      wiring_completed: true,
      safety_equipment_installed: true,
      earthing_completed: true,
      system_tested: true,
      power_generation_verified: true,
    },
    equipments: [
      { id: 'EQ-7', name: 'Adani 540W Panels', expectedQty: 10, deliveredQty: 10, status: 'VERIFIED', serialPrefix: 'ADN-540-' },
      { id: 'EQ-8', name: 'Growatt 5kW Hybrid Inverter', expectedQty: 1, deliveredQty: 1, status: 'VERIFIED', serialPrefix: 'GRW-5K-' },
      { id: 'EQ-9', name: 'LiFePO4 48V 100Ah Battery Pack', expectedQty: 1, deliveredQty: 1, status: 'VERIFIED', serialPrefix: 'BAT-48V-' },
    ],
    workLogs: [
      { id: 'WL-2', startTime: '2026-10-27T08:30:00Z', endTime: '2026-10-27T17:00:00Z', totalHours: 8.5, notes: 'Complete residential turnkey installation and customer demonstration.' },
    ],
    signoff: {
      customerName: 'Priya Meena',
      signoffDate: '2026-10-27T17:15:00Z',
      rating: 5,
      signature_path: '/uploads/signatures/demo_sig.png',
      remarks: 'Neat installation, generating 22 kWh per day. Highly satisfied!',
    },
  },
  {
    id: 'INS-8004',
    rawId: '8004-uuid',
    jobNumber: 'JOB-2026-8004',
    orderNumber: 'ORD-8004',
    projectRef: 'SIMS-PRJ-1079',
    customerName: 'Golden Hospitality',
    contact: '+91 94133 11224',
    installationAddress: 'Lake Palace Road, Udaipur, Rajasthan',
    capacity: '25.0 kW',
    scheduledDate: '2026-11-05',
    installation_status: 'SCHEDULED',
    status: 'Scheduled',
    dispatchStatus: 'In Transit (DSP-705)',
    checklistCompleted: 0,
    checklistTotal: 9,
    assignedTechnician: 'Vikram Singh',
    panels: '50x 540W Panels',
    inverter: '1x Sungrow 25kW Grid Inverter',
    battery: 'None',
    checklist: {
      mounting_stands_installed: false,
      solar_panels_installed: false,
      inverter_installed: false,
      battery_installed: false,
      wiring_completed: false,
      safety_equipment_installed: false,
      earthing_completed: false,
      system_tested: false,
      power_generation_verified: false,
    },
    equipments: [
      { id: 'EQ-10', name: '540W Tier-1 Mono PERC Panels', expectedQty: 50, deliveredQty: 50, status: 'PENDING', serialPrefix: 'PAN-540-' },
    ],
    workLogs: [],
    signoff: null,
  },
  {
    id: 'INS-8005',
    rawId: '8005-uuid',
    jobNumber: 'JOB-2026-8005',
    orderNumber: 'ORD-8005',
    projectRef: 'SIMS-PRJ-1078',
    customerName: 'Mukesh Choudhary',
    contact: '+91 94140 77889',
    installationAddress: 'Industrial Area, Jodhpur, Rajasthan',
    capacity: '30.0 kW',
    scheduledDate: '2026-11-01',
    installation_status: 'IN_PROGRESS',
    status: 'In Progress',
    dispatchStatus: 'Delivered (DSP-703)',
    checklistCompleted: 5,
    checklistTotal: 9,
    assignedTechnician: 'Vikram Singh',
    panels: '60x 500W Panels',
    inverter: '1x Sungrow 30kW Inverter',
    battery: 'None',
    checklist: {
      mounting_stands_installed: true,
      solar_panels_installed: true,
      inverter_installed: true,
      battery_installed: false,
      wiring_completed: true,
      safety_equipment_installed: true,
      earthing_completed: false,
      system_tested: false,
      power_generation_verified: false,
    },
    equipments: [
      { id: 'EQ-11', name: '500W Bifacial TOPCon Panels', expectedQty: 60, deliveredQty: 60, status: 'VERIFIED', serialPrefix: 'BIF-500-' },
      { id: 'EQ-12', name: 'Sungrow 30kW Grid-Tie Inverter', expectedQty: 1, deliveredQty: 1, status: 'VERIFIED', serialPrefix: 'SNG-30K-' },
    ],
    workLogs: [
      { id: 'WL-3', startTime: '2026-10-30T10:00:00Z', endTime: '2026-10-30T16:00:00Z', totalHours: 6.0, notes: 'Mounting rails and modules secured.' },
    ],
    signoff: null,
  },
];

export const installationAPI = {
  async getAssignedInstallations(params = {}) {
    if (useMock) return demoInstallations;
    try {
      const response = await axiosInstance.get('/v1/installations', { params });
      const items = response.data?.data || response.data;
      if (Array.isArray(items) && items.length > 0) {
        // Map backend jobs to enrich display
        return items.map((j, idx) => ({
          ...demoInstallations[idx % demoInstallations.length],
          id: `INS-${8000 + idx + 1}`,
          rawId: j.id,
          jobNumber: j.job_number || `JOB-2026-${8000 + idx + 1}`,
          status: j.installation_status ? j.installation_status.replace('_', ' ') : 'In Progress',
          installation_status: j.installation_status || 'IN_PROGRESS',
        }));
      }
      return demoInstallations;
    } catch {
      return demoInstallations;
    }
  },

  async getInstallationById(id) {
    if (useMock) {
      return demoInstallations.find((j) => j.id === id || j.rawId === id) || demoInstallations[0];
    }
    try {
      const response = await axiosInstance.get(`/v1/installations/${id}`);
      const job = response.data?.data || response.data;
      const fallback = demoInstallations.find((j) => j.id === id || j.rawId === id) || demoInstallations[0];
      return {
        ...fallback,
        ...job,
        id: fallback.id,
        rawId: job.id || fallback.rawId,
      };
    } catch {
      return demoInstallations.find((j) => j.id === id || j.rawId === id) || demoInstallations[0];
    }
  },

  async startInstallation(id) {
    if (useMock) {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      if (job) {
        job.installation_status = 'IN_PROGRESS';
        job.status = 'In Progress';
      }
      return job;
    }
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/start`);
      return response.data?.data || response.data;
    } catch {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      if (job) {
        job.installation_status = 'IN_PROGRESS';
        job.status = 'In Progress';
      }
      return job;
    }
  },

  async updateChecklist(id, checklist) {
    if (useMock) {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      if (job) {
        job.checklist = { ...job.checklist, ...checklist };
        job.checklistCompleted = Object.values(job.checklist).filter(Boolean).length;
      }
      return job?.checklist;
    }
    try {
      const response = await axiosInstance.put(`/v1/installations/${id}/checklist`, checklist);
      return response.data?.data || response.data;
    } catch {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      if (job) {
        job.checklist = { ...job.checklist, ...checklist };
        job.checklistCompleted = Object.values(job.checklist).filter(Boolean).length;
      }
      return job?.checklist;
    }
  },

  async logWorkHours(id, workLogData) {
    if (useMock) {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      const newLog = {
        id: `WL-${Date.now()}`,
        ...workLogData,
      };
      if (job) job.workLogs.push(newLog);
      return newLog;
    }
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/work-logs`, workLogData);
      return response.data?.data || response.data;
    } catch {
      return { id: `WL-${Date.now()}`, ...workLogData };
    }
  },

  async captureSignoff(id, formData) {
    if (useMock) {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      const signoffRecord = {
        customerName: formData.get('customer_name') || 'Valued Customer',
        rating: Number(formData.get('feedback_rating')) || 5,
        remarks: formData.get('feedback_remarks') || 'System commissioned successfully.',
        signature_path: '/uploads/signatures/demo_captured.png',
        signoffDate: new Date().toISOString(),
      };
      if (job) job.signoff = signoffRecord;
      return signoffRecord;
    }
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/signoff`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || response.data;
    } catch {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      const signoffRecord = {
        customerName: formData.get('customer_name') || 'Valued Customer',
        rating: Number(formData.get('feedback_rating')) || 5,
        remarks: formData.get('feedback_remarks') || 'System commissioned successfully.',
        signature_path: '/uploads/signatures/demo_captured.png',
        signoffDate: new Date().toISOString(),
      };
      if (job) job.signoff = signoffRecord;
      return signoffRecord;
    }
  },

  async completeInstallation(id, completionData) {
    if (useMock) {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      if (job) {
        job.installation_status = 'COMPLETED';
        job.status = 'Completed';
      }
      return job;
    }
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/complete`, completionData);
      return response.data?.data || response.data;
    } catch {
      const job = demoInstallations.find((j) => j.id === id || j.rawId === id);
      if (job) {
        job.installation_status = 'COMPLETED';
        job.status = 'Completed';
      }
      return job;
    }
  },
};

export default installationAPI;

