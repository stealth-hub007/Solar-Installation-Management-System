import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/common/Button';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to permanently delete this record? This action cannot be undone.',
  itemIdentifier,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Delete Permanently
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="text-slate-700">{message}</p>
          {itemIdentifier && (
            <p className="font-semibold text-slate-900 bg-slate-100 p-2 rounded border border-slate-200 font-mono text-xs">
              {itemIdentifier}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;

