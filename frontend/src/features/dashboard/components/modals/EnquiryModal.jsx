import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/common/Button';

export const EnquiryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '+91 ',
    email: '',
    address: '',
    files: 'Electricity_Bill.pdf',
    enquirySource: 'Website Form',
    capacity: '5 kW Rooftop',
    enquiryStatus: 'New',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerName: initialData.customerName || '',
        contactNumber: initialData.contactNumber || '+91 ',
        email: initialData.email || '',
        address: initialData.address || '',
        files: initialData.files || 'Electricity_Bill.pdf',
        enquirySource: initialData.enquirySource || 'Website Form',
        capacity: initialData.capacity || '5 kW Rooftop',
        enquiryStatus: initialData.enquiryStatus || 'New',
      });
    } else {
      setFormData({
        customerName: '',
        contactNumber: '+91 ',
        email: '',
        address: '',
        files: 'Electricity_Bill.pdf',
        enquirySource: 'Website Form',
        capacity: '5 kW Rooftop',
        enquiryStatus: 'New',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.contactNumber) {
      alert('Please fill in customer name and contact phone.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Inbound Lead"
      subtitle="Record a prospective solar consumer enquiry with address and documentation"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Create Lead
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Customer / Entity Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Sunita Agarwal"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Contact Phone *</label>
            <input
              type="text"
              required
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="+91 98290 11223"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sunita.agarwal@gmail.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Site / Lead Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Malviya Nagar, Jaipur, Rajasthan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Attached Files</label>
            <input
              type="text"
              value={formData.files}
              onChange={(e) => setFormData({ ...formData, files: e.target.value })}
              placeholder="Electricity_Bill.pdf"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Required Capacity</label>
            <input
              type="text"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="e.g. 8 kW Rooftop"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Acquisition Source</label>
            <select
              value={formData.enquirySource}
              onChange={(e) => setFormData({ ...formData, enquirySource: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="Website Form">Website Form</option>
              <option value="Channel Partner">Channel Partner</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Referral">Referral</option>
              <option value="Direct Walk-in">Direct Walk-in</option>
              <option value="Solar Expo">Solar Expo</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EnquiryModal;
