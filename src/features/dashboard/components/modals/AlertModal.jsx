import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/common/Button';

export const AlertModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'warning',
    module: 'Operations',
    actionRoute: '/admin/dashboard',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      severity: 'warning',
      module: 'Operations',
      actionRoute: '/admin/dashboard',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Operational Alert"
      subtitle="Publish an urgent action notification or system alert to the executive dashboard"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Publish Alert
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Alert Headline *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Critical: High Inverter DC Voltage Warning"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Description / Action Required *</label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the operational issue and steps required to resolve..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Severity Level</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="critical">Critical (Immediate Action)</option>
              <option value="warning">Warning (Attention Required)</option>
              <option value="info">Information (Broadcast)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Operational Module</label>
            <select
              value={formData.module}
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="Installations">Installations</option>
              <option value="Inventory">Inventory</option>
              <option value="Payments">Payments</option>
              <option value="Surveys">Surveys</option>
              <option value="Service Tickets">Service Tickets</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AlertModal;

