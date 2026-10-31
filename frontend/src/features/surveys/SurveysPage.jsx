import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import { ClipboardCheck, Check, Eye } from 'lucide-react';
import storageService from '../../services/storageService';
import { paginateCollection } from '../../services/mockData';

export const SurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const loadData = () => {
    const projects = storageService.getProjects();
    const surveyList = projects.map((p, i) => ({
      id: `SRV-${400 + i + 1}`,
      projectId: p.id,
      customerName: p.customerName,
      location: p.location,
      proposedCapacity: `${p.capacity} kW`,
      surveyor: p.assignedTechnician !== 'Unassigned' ? p.assignedTechnician : 'Amit Verma',
      roofType: i % 2 === 0 ? 'Reinforced Concrete (Flat)' : 'Tin Shed (Pitched)',
      shadowFreeArea: `${p.capacity * 90} sq.ft`,
      status: p.status === 'Survey Pending' ? 'Pending Approval' : 'Approved',
      date: p.createdDate,
    }));
    setSurveys(surveyList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (survey) => {
    storageService.logActivity(
      `Approved site survey report for ${survey.projectId} (${survey.customerName})`,
      'Surveys',
      'Approved'
    );
    setSurveys((prev) =>
      prev.map((s) => (s.id === survey.id ? { ...s, status: 'Approved' } : s))
    );
    setSelectedSurvey(null);
  };

  const paginated = paginateCollection(surveys, { page, pageSize });

  const columns = [
    {
      header: 'Survey ID',
      accessor: 'id',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      cell: ({ row }) => (
        <div className="max-w-[140px] truncate" title={row.customerName}>
          <span className="font-semibold text-slate-800 block truncate">{row.customerName}</span>
          <span className="text-[11px] text-slate-400 font-mono block truncate">{row.projectId}</span>
        </div>
      ),
    },
    {
      header: 'Site Location',
      accessor: 'location',
      cell: ({ value }) => <span className="text-xs text-slate-600 max-w-[150px] truncate block" title={value}>{value}</span>,
    },
    {
      header: 'Rooftop Type',
      accessor: 'roofType',
      cell: ({ value }) => <span className="text-xs text-slate-700">{value}</span>,
    },
    {
      header: 'Usable Space',
      accessor: 'shadowFreeArea',
      cell: ({ value }) => (
        <span className="text-xs font-semibold text-slate-800">{value}</span>
      ),
    },
    {
      header: 'Field Engineer',
      accessor: 'surveyor',
      cell: ({ value }) => <span className="text-xs text-slate-600 font-medium">{value}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Actions',
      align: 'center',
      stickyRight: true,
      headerClassName: 'w-32 text-center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="outline" size="xs" icon={Eye} onClick={() => setSelectedSurvey(row)}>
            Review
          </Button>
          {row.status === 'Pending Approval' && (
            <Button
              variant="primary"
              size="xs"
              icon={Check}
              onClick={() => handleApprove(row)}
            >
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Site Survey Management"
        subtitle="Manage rooftop shadow feasibility assessments, structure orientation angle checks, and engineer uploads"
      />

      <Card padding={false} className="overflow-hidden">
        <Table columns={columns} data={paginated.data} />
        <TablePagination
          currentPage={paginated.pagination.page}
          pageSize={paginated.pagination.pageSize}
          totalRecords={paginated.pagination.totalRecords}
          totalPages={paginated.pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(ps) => {
            setPageSize(ps);
            setPage(1);
          }}
        />
      </Card>

      {/* Review Modal */}
      {selectedSurvey && (
        <Modal
          isOpen={!!selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          title={`Survey Assessment: ${selectedSurvey.id}`}
          subtitle={`Site Feasibility for ${selectedSurvey.customerName}`}
          footer={
            <div className="flex justify-between w-full">
              {selectedSurvey.status === 'Pending Approval' ? (
                <Button variant="primary" size="sm" icon={Check} onClick={() => handleApprove(selectedSurvey)}>
                  Approve Survey & Authorize Quotation
                </Button>
              ) : (
                <span className="text-xs text-emerald-700 font-medium">✓ Survey Approved</span>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedSurvey(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Proposed Capacity</span>
              <span className="font-bold text-[#0284C7]">{selectedSurvey.proposedCapacity}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Rooftop Classification</span>
              <span className="font-semibold text-slate-800">{selectedSurvey.roofType}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Shadow-Free Usable Space</span>
              <span className="font-semibold text-slate-800">{selectedSurvey.shadowFreeArea}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">DISCOM Sanction Load Available</span>
              <span className="font-semibold text-slate-800">Yes (3-Phase 15kW)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Field Surveyor</span>
              <span className="font-semibold text-slate-800">{selectedSurvey.surveyor}</span>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default SurveysPage;
