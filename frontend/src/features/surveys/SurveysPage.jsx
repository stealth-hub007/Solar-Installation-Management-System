import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import { ClipboardCheck, Check, Eye, X, RefreshCw, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

export const SurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const loadSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/v1/surveys');
      const raw = res.data?.data?.items || res.data?.data || res.data || [];
      setSurveys(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleApprove = async (survey) => {
    setApprovingId(survey.id);
    try {
      await axiosInstance.post(`/v1/surveys/${survey.id}/review`, {
        approval_status: 'APPROVED',
      });
      setSuccessMsg(`Survey for ${survey.customer_name || survey.id} approved successfully.`);
      await loadSurveys();
      setSelectedSurvey(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setRejectingId(rejectModal.id);
    try {
      await axiosInstance.post(`/v1/surveys/${rejectModal.id}/review`, {
        approval_status: 'REJECTED',
        rejection_reason: rejectionNotes || 'Rejected by Admin — corrections required.',
      });
      setSuccessMsg(`Survey rejected. Technician will be notified.`);
      await loadSurveys();
      setRejectModal(null);
      setRejectionNotes('');
      setSelectedSurvey(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Rejection failed');
    } finally {
      setRejectingId(null);
    }
  };

  // Paginate client-side
  const totalRecords = surveys.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginated = surveys.slice((page - 1) * pageSize, page * pageSize);

  const getApprovalStatus = (s) => s.approval_status || s.approvalStatus || 'PENDING_APPROVAL';
  const getSurveyStatus = (s) => s.survey_status || s.surveyStatus || s.status || 'SCHEDULED';

  const columns = [
    {
      header: 'Survey ID',
      accessor: 'id',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">
          {String(value).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      cell: ({ row }) => (
        <div className="max-w-[160px]">
          <span className="font-semibold text-slate-800 block truncate">
            {row.customer_name || row.customer?.full_name || '—'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono block truncate">
            {row.survey_number || ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Site Location',
      accessor: 'site_address',
      cell: ({ value }) => (
        <span className="text-xs text-slate-600 max-w-[150px] truncate block" title={value}>
          {value || '—'}
        </span>
      ),
    },
    {
      header: 'Surveyor',
      accessor: 'technician_name',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.technician_name || row.technician?.full_name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Survey Status',
      accessor: 'survey_status',
      cell: ({ row }) => <StatusBadge status={getSurveyStatus(row)} />,
    },
    {
      header: 'Approval',
      accessor: 'approval_status',
      cell: ({ row }) => <StatusBadge status={getApprovalStatus(row)} />,
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-40 text-center',
      cell: ({ row }) => {
        const approvalStatus = getApprovalStatus(row);
        const isPending = approvalStatus === 'PENDING_APPROVAL';
        return (
          <div className="flex items-center justify-center gap-1">
            <Button variant="outline" size="xs" icon={Eye} onClick={() => setSelectedSurvey(row)}>
              Review
            </Button>
            {isPending && (
              <>
                <Button
                  variant="primary"
                  size="xs"
                  icon={Check}
                  loading={approvingId === row.id}
                  onClick={() => handleApprove(row)}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="xs"
                  icon={X}
                  onClick={() => setRejectModal(row)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Site Survey Management"
        subtitle="Review rooftop feasibility assessments, approve or reject submitted surveys, and authorize quotation generation"
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadSurveys} loading={loading}>
            Refresh
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Card padding={false} className="overflow-hidden">
        <Table
          columns={columns}
          data={paginated}
          loading={loading}
          emptyTitle="No surveys found"
          emptyDescription="No site surveys have been scheduled yet."
        />
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(ps) => { setPageSize(ps); setPage(1); }}
        />
      </Card>

      {/* Review Modal */}
      {selectedSurvey && (
        <Modal
          isOpen={!!selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          title={`Survey Review: ${String(selectedSurvey.id).slice(0, 8).toUpperCase()}`}
          subtitle={`Site Feasibility for ${selectedSurvey.customer_name || selectedSurvey.customer?.full_name || '—'}`}
          footer={
            <div className="flex justify-between w-full gap-2">
              {getApprovalStatus(selectedSurvey) === 'PENDING_APPROVAL' ? (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    loading={approvingId === selectedSurvey.id}
                    onClick={() => handleApprove(selectedSurvey)}
                  >
                    Approve & Authorize Quotation
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={X}
                    onClick={() => setRejectModal(selectedSurvey)}
                  >
                    Reject Survey
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {getApprovalStatus(selectedSurvey) === 'APPROVED' ? 'Survey Approved' : 'Survey Rejected'}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedSurvey(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs sm:text-sm">
            {[
              ['Survey Number', selectedSurvey.survey_number || '—'],
              ['Scheduled Date', selectedSurvey.scheduled_date ? new Date(selectedSurvey.scheduled_date).toLocaleDateString('en-IN') : '—'],
              ['Site Address', selectedSurvey.site_address || '—'],
              ['Roof Type', selectedSurvey.roof_type || '—'],
              ['Roof Area (sq.ft)', selectedSurvey.roof_area_sqft ? `${selectedSurvey.roof_area_sqft} sq.ft` : '—'],
              ['Shadow-Free Area', selectedSurvey.shadow_free_area_sqft ? `${selectedSurvey.shadow_free_area_sqft} sq.ft` : '—'],
              ['Roof Orientation', selectedSurvey.roof_orientation || '—'],
              ['Proposed Capacity', selectedSurvey.proposed_capacity_kw ? `${selectedSurvey.proposed_capacity_kw} kW` : '—'],
              ['Assigned Technician', selectedSurvey.technician_name || selectedSurvey.technician?.full_name || 'Unassigned'],
              ['Survey Status', getSurveyStatus(selectedSurvey)],
              ['Approval Status', getApprovalStatus(selectedSurvey)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800 text-right max-w-[55%] truncate">{val}</span>
              </div>
            ))}
            {selectedSurvey.surveyor_notes && (
              <div className="pt-2 border-t">
                <p className="text-slate-500 mb-1 text-xs font-medium">Surveyor Notes</p>
                <p className="text-slate-700 text-xs leading-relaxed">{selectedSurvey.surveyor_notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModal && (
        <Modal
          isOpen={!!rejectModal}
          onClose={() => { setRejectModal(null); setRejectionNotes(''); }}
          title="Reject Survey"
          subtitle="Provide a reason — this will be visible to the assigned technician"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => { setRejectModal(null); setRejectionNotes(''); }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={X}
                loading={rejectingId === rejectModal?.id}
                onClick={handleRejectConfirm}
              >
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Rejecting survey for <strong>{rejectModal.customer_name || '—'}</strong>. The technician will need to redo the survey.
            </p>
            <textarea
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="Enter rejection reason / corrections required..."
              rows={4}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
            />
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default SurveysPage;
