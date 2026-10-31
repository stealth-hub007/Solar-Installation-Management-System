import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/common/Button';

export const PaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    customerName: '',
    projectId: '',
    amount: 50000,
    paymentMethod: 'NEFT / RTGS',
    paymentStatus: 'Completed',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        customerName: initialData.customerName || '',
        projectId: initialData.projectId || '',
        amount: initialData.amount || 0,
        paymentMethod: initialData.paymentMethod || 'NEFT / RTGS',
        paymentStatus: initialData.paymentStatus || 'Completed',
      });
    } else {
      setFormData({
        customerName: '',
        projectId: 'SIMS-PRJ-1082',
        amount: 50000,
        paymentMethod: 'NEFT / RTGS',
        paymentStatus: 'Completed',
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
      title={isEditing ? `Edit Payment Voucher: ${initialData.id}` : 'Record Customer Payment'}
      subtitle={isEditing ? 'Modify transaction amount, status, or method' : 'Log a milestone payment, booking advance or subsidy clearance'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Record Transaction'}
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
              placeholder="e.g. Apex Textiles Ltd."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Project Reference *</label>
            <input
              type="text"
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              placeholder="e.g. SIMS-PRJ-1081"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Amount (₹ INR) *</label>
            <input
              type="number"
              min="1"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 185000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Payment Method *</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="NEFT / RTGS">NEFT / RTGS</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Online Gateway">Online Gateway</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Payment Status *</label>
          <select
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          >
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;

