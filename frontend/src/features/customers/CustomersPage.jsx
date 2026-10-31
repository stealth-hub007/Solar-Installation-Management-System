import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../dashboard/components/modals/ConfirmDeleteModal';
import { Users, Plus, Search, Phone, MapPin, Mail, Eye, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import storageService from '../../services/storageService';
import { paginateCollection } from '../../services/mockData';
import useDebounce from '../../hooks/useDebounce';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Controlled form state for Create
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '+91 ',
    email: '',
    city: '',
    address: '',
    type: 'Residential',
    totalCapacity: 5.0,
    status: 'Active',
  });

  // Controlled form state for Edit
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    type: 'Residential',
    totalCapacity: 5.0,
    status: 'Active',
  });

  const debouncedSearch = useDebounce(search, 300);

  // Load customers directly from persistent storageService
  const loadCustomers = () => {
    const list = storageService.getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // When editCustomer changes, populate edit form
  useEffect(() => {
    if (editingCustomer) {
      setEditForm({
        name: editingCustomer.name || '',
        phone: editingCustomer.phone || '',
        email: editingCustomer.email || '',
        city: editingCustomer.city || '',
        address: editingCustomer.address || editingCustomer.city || '',
        type: editingCustomer.type || 'Residential',
        totalCapacity: editingCustomer.totalCapacity || 5.0,
        status: editingCustomer.status || 'Active',
      });
    }
  }, [editingCustomer]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.phone) {
      alert('Please fill in customer name and contact phone.');
      return;
    }
    storageService.createCustomer(createForm);
    loadCustomers();
    setIsCreateOpen(false);
    setCreateForm({
      name: '',
      phone: '+91 ',
      email: '',
      city: '',
      address: '',
      type: 'Residential',
      totalCapacity: 5.0,
      status: 'Active',
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    storageService.updateCustomer(editingCustomer.id, editForm);
    loadCustomers();
    setEditingCustomer(null);
    if (viewCustomer && viewCustomer.id === editingCustomer.id) {
      setViewCustomer({ ...viewCustomer, ...editForm });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingCustomer) return;
    storageService.deleteCustomer(deletingCustomer.id);
    loadCustomers();
    setDeletingCustomer(null);
    if (viewCustomer && viewCustomer.id === deletingCustomer.id) {
      setViewCustomer(null);
    }
  };

  const paginated = paginateCollection(customers, {
    page,
    pageSize,
    search: debouncedSearch,
    filterKey: 'status',
    filterVal: statusFilter,
  });

  const columns = [
    {
      header: 'Customer ID',
      accessor: 'id',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: 'name',
      cell: ({ row }) => (
        <div className="max-w-[160px] truncate" title={row.name}>
          <span className="font-semibold text-slate-800 block truncate">{row.name}</span>
          <span className="text-[11px] text-slate-400 font-normal">({row.type})</span>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <a
            href={`tel:${row.phone}`}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0284C7] whitespace-nowrap font-mono"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{row.phone}</span>
          </a>
          {row.email && (
            <a
              href={`mailto:${row.email}`}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-[#0284C7] truncate max-w-[170px]"
              title={row.email}
            >
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{row.email}</span>
            </a>
          )}
        </div>
      ),
    },
    {
      header: 'Location / Address',
      accessor: 'city',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.address || row.city}>
          <span className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{row.city}</span>
          </span>
          {row.address && row.address !== row.city && (
            <span className="text-[11px] text-slate-400 block truncate pl-5">
              {row.address}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Installations',
      accessor: 'projectCount',
      align: 'center',
      cell: ({ value, row }) => (
        <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
          {value || 0} site ({row.totalCapacity} kW)
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Actions',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setViewCustomer(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="View Customer Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditingCustomer(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
            title="Edit Customer Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingCustomer(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Customer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Customer Management"
        subtitle="Maintain KYC documentation, registered solar consumer accounts, and installed rooftop sites"
      >
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          Register Customer
        </Button>
      </PageHeader>

      <Card padding={false} className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search customer name, phone or city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Consumer Statuses</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={paginated.data}
          emptyTitle="No customers found"
          emptyDescription="No customer records match your filter criteria."
        />

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

      {/* Customer Detail Modal */}
      {viewCustomer && (
        <Modal
          isOpen={!!viewCustomer}
          onClose={() => setViewCustomer(null)}
          title={`Customer Record: ${viewCustomer.id}`}
          subtitle={viewCustomer.name}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEditingCustomer(viewCustomer);
                  setViewCustomer(null);
                }}
              >
                Edit Customer
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewCustomer(null)}>
                Close Profile
              </Button>
            </div>
          }
        >
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Consumer Category</span>
              <span className="font-semibold text-slate-800">{viewCustomer.type}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Contact Number</span>
              <span className="font-mono text-slate-800">{viewCustomer.phone}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Email Address</span>
              <span className="text-slate-800">{viewCustomer.email || 'Not specified'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">City / Region</span>
              <span className="text-slate-800">{viewCustomer.city}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Site Address</span>
              <span className="text-slate-800">{viewCustomer.address || viewCustomer.city}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Installed Solar Capacity</span>
              <span className="font-bold text-[#0284C7]">{viewCustomer.totalCapacity} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Status</span>
              <StatusBadge status={viewCustomer.status} />
            </div>
          </div>
        </Modal>
      )}

      {/* Register Customer Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Register New Customer"
          subtitle="Add an enterprise or residential solar consumer"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateSubmit}>
                Save Customer
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Customer / Organization Name *</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Anand Textiles Pvt Ltd"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+91 98290 00000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">City / Region *</label>
                <input
                  type="text"
                  required
                  value={createForm.city}
                  onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Detailed Street Address</label>
                <input
                  type="text"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  placeholder="e.g. Plot 12, RIICO Phase 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Consumer Category</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Capacity (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={createForm.totalCapacity}
                  onChange={(e) => setCreateForm({ ...createForm, totalCapacity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <Modal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          title={`Edit Customer: ${editingCustomer.id}`}
          subtitle={`Update profile for ${editingCustomer.name}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingCustomer(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Customer / Organization Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">City / Region *</label>
                <input
                  type="text"
                  required
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Detailed Street Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Consumer Category</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Capacity (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={editForm.totalCapacity}
                  onChange={(e) => setEditForm({ ...editForm, totalCapacity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Customer Confirmation */}
      {deletingCustomer && (
        <ConfirmDeleteModal
          isOpen={!!deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onConfirm={handleDeleteConfirm}
          title="Remove Customer Record"
          message={`Are you sure you want to remove customer "${deletingCustomer.name}"? This action will remove the record from SIMS directory.`}
          itemIdentifier={deletingCustomer.name}
        />
      )}
    </PageContainer>
  );
};

export default CustomersPage;
