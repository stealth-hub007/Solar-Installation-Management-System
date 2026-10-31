import React, { useState } from 'react';
import { Search, RotateCcw, Eye, Zap, Plus, Edit2, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import Table, { TablePagination } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/common/Button';
import ProjectModal from './modals/ProjectModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import formatDate from '../../../utils/formatDate';
import formatNumber from '../../../utils/formatNumber';
import useDebounce from '../../../hooks/useDebounce';

export const RecentProjects = ({
  data = [],
  pagination,
  filters,
  isLoading = false,
  error = null,
  onPageChange,
  onPageSizeChange,
  onFiltersChange,
  onResetFilters,
  onRetry,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [viewProject, setViewProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleStatusFilterChange = (status) => {
    onFiltersChange({ status });
  };

  const handleSort = (field) => {
    const isSame = filters.sortBy === field;
    const nextDirection = isSame && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ sortBy: field, sortDirection: nextDirection });
  };

  const handleCreateSubmit = async (formData) => {
    if (onCreateProject) {
      await onCreateProject(formData);
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    if (onUpdateProject && editingProject) {
      await onUpdateProject({ id: editingProject.id, data: formData });
      setEditingProject(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (onDeleteProject && deletingProject) {
      await onDeleteProject(deletingProject.id);
      setDeletingProject(null);
    }
  };

  const columns = [
    {
      header: 'Project ID',
      accessor: 'id',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Project Name',
      accessor: 'projectName',
      cell: ({ row }) => (
        <div className="max-w-[160px] truncate" title={`${row.projectName} (${row.location})`}>
          <span className="font-semibold text-slate-800 truncate block">{row.projectName}</span>
          <span className="text-[11px] text-slate-400 truncate block">{row.location}</span>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-medium text-slate-800 max-w-[130px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      sortable: true,
      align: 'right',
      cell: ({ value }) => (
        <span className="font-bold text-slate-900">{formatNumber(value)} kW</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Technician',
      accessor: 'assignedTechnician',
      cell: ({ value }) => (
        <span className="text-xs text-slate-600 font-medium max-w-[110px] truncate block" title={value || 'Unassigned'}>
          {value || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdDate',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-xs text-slate-500">{formatDate(value, { format: 'short' })}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setViewProject(row)}
            className="p-1 rounded-md text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="View Specifications"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditingProject(row)}
            className="p-1 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
            title="Edit Project"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingProject(row)}
            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <CardHeader
            icon={Zap}
            title="Recent Solar Projects"
            subtitle="Real-time execution pipeline and rooftop installation stages"
            className="mb-0"
          />

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="self-start sm:self-auto shrink-0"
          >
            Add New Project
          </Button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search project ID, customer or city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Statuses</option>
              <option value="Enquiry">Enquiry</option>
              <option value="Survey Pending">Survey Pending</option>
              <option value="Quotation Pending">Quotation Pending</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <Button
              variant="outline"
              size="xs"
              icon={RotateCcw}
              onClick={() => {
                setSearchInput('');
                onResetFilters();
              }}
              title="Reset Search and Filters"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        sortField={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSort={handleSort}
        emptyTitle="No projects found"
        emptyDescription="Try adjusting your search keywords or project status filter."
      />

      {/* Server Pagination */}
      <TablePagination
        currentPage={pagination?.page || 1}
        pageSize={pagination?.pageSize || 10}
        totalRecords={pagination?.totalRecords || 0}
        totalPages={pagination?.totalPages || 1}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
      />

      {/* Detail Modal */}
      {viewProject && (
        <Modal
          isOpen={!!viewProject}
          onClose={() => setViewProject(null)}
          title={`Project Details: ${viewProject.id}`}
          subtitle={viewProject.projectName}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEditingProject(viewProject);
                  setViewProject(null);
                }}
              >
                Edit Project
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewProject(null)}>
                Close Details
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer</span>
                <span className="font-semibold text-slate-800">{viewProject.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Location</span>
                <span className="font-semibold text-slate-800">{viewProject.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Installed Capacity</span>
                <span className="font-bold text-[#0284C7]">{viewProject.capacity} kW System</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Stage</span>
                <StatusBadge status={viewProject.status} />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Lead Engineer</span>
                <span className="font-semibold text-slate-800">{viewProject.assignedTechnician}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registered Date</span>
                <span className="font-semibold text-slate-800">{formatDate(viewProject.createdDate, { includeTime: true })}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <ProjectModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Edit Modal */}
      {editingProject && (
        <ProjectModal
          isOpen={!!editingProject}
          initialData={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingProject && (
        <ConfirmDeleteModal
          isOpen={!!deletingProject}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Solar Project"
          message={`Are you sure you want to permanently delete project ${deletingProject.id}? This will remove all associated installation velocity and pipeline records.`}
          itemIdentifier={`${deletingProject.id} — ${deletingProject.projectName}`}
        />
      )}
    </Card>
  );
};

export default RecentProjects;
