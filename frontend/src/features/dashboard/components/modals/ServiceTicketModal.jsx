import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/common/Button';

export const ServiceTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    customerName: '',
    issueType: 'Inverter Grid Error',
    priority: 'Medium',
    assignedTechnician: '',
    ticketStatus: 'Open',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerName: initialData.customerName || '',
        issueType: initialData.issueType || 'Inverter Grid Error',
        priority: initialData.priority || 'Medium',
        assignedTechnician: initialData.assignedTechnician || '',
        ticketStatus: initialData.ticketStatus || 'Open',
      });
    } else {
      setFormData({
        customerName: '',
        issueType: 'Inverter Grid Error 04',
        priority: 'Medium',
        assignedTechnician: '',
        ticketStatus: 'Open',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Service Ticket: ${initialData.id}` : 'Log New Support / O&M Ticket'}
      subtitle={isEditing ? 'Update engineer assignment or breakdown resolution status' : 'Register a customer maintenance request or warranty claim'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Log Ticket'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Customer Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Arvind Verma"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Priority Level *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Issue Classification / Diagnosis *</label>
          <input
            type="text"
            required
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
            placeholder="e.g. Inverter Grid Error 04, Low Generation Output"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Assigned Service Engineer</label>
            <input
              type="text"
              value={formData.assignedTechnician}
              onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
              placeholder="e.g. Dinesh Kumar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Ticket Status *</label>
            <select
              value={formData.ticketStatus}
              onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceTicketModal;

