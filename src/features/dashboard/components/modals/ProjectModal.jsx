import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/common/Button';

export const ProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    projectName: '',
    customerName: '',
    location: '',
    capacity: 5.0,
    status: 'In Progress',
    assignedTechnician: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        projectName: initialData.projectName || '',
        customerName: initialData.customerName || '',
        location: initialData.location || '',
        capacity: initialData.capacity || 5.0,
        status: initialData.status || 'In Progress',
        assignedTechnician: initialData.assignedTechnician || '',
      });
    } else {
      setFormData({
        projectName: '',
        customerName: '',
        location: '',
        capacity: 5.0,
        status: 'In Progress',
        assignedTechnician: '',
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
      title={isEditing ? `Edit Project: ${initialData.id}` : 'Create New Solar Project'}
      subtitle={isEditing ? 'Update project capacity, technician, or lifecycle stage' : 'Register a new customer solar rooftop installation'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Project Name *</label>
          <input
            type="text"
            required
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            placeholder="e.g. Radhey Residency Rooftop"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Customer Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Rajesh Sharma"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Capacity (kW) *</label>
            <input
              type="number"
              step="0.1"
              min="1"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="e.g. 10.5"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Location / Site Address *</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Mansarovar, Jaipur, Rajasthan"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Project Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="Enquiry">Enquiry</option>
              <option value="Survey Pending">Survey Pending</option>
              <option value="Quotation Pending">Quotation Pending</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Assigned Technician</label>
            <input
              type="text"
              value={formData.assignedTechnician}
              onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
              placeholder="e.g. Vikram Singh"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;

