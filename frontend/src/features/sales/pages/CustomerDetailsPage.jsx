import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import storageService from '../../../services/storageService';
import formatCurrency from '../../../utils/formatCurrency';
import formatDate from '../../../utils/formatDate';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  FileText,
  ShoppingCart,
  MessageSquare,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export const CustomerDetailsPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const customers = storageService.getCustomers();
    const found = customers.find((c) => c.id === customerId);
    setCustomer(found || null);

    if (found) {
      // Find linked enquiries
      const allEnquiries = storageService.getEnquiries();
      const linkedEnq = allEnquiries.filter(
        (e) =>
          e.customerId === found.id ||
          e.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setEnquiries(linkedEnq);

      // Find linked quotations
      const allQuotations = storageService.getQuotations();
      const linkedQuo = allQuotations.filter(
        (q) =>
          q.customerId === found.id ||
          q.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setQuotations(linkedQuo);

      // Find linked orders
      const allOrders = storageService.getOrders();
      const linkedOrd = allOrders.filter(
        (o) =>
          o.customerId === found.id ||
          o.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setOrders(linkedOrd);
    }
  }, [customerId]);

  if (!customer) {
    return (
      <PageContainer>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Customer not found</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/sales/customers')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Customers
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/customers')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {customer.name}
              </h1>
              <StatusBadge status={customer.status || 'Active'} />
            </div>
            <span className="font-mono text-xs text-[#0284C7] font-semibold">{customer.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/sales/enquiries?create=true&customer=${customer.name}`)}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1" /> Log Enquiry
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/sales/quotations?create=true&customer=${customer.name}`)}
          >
            <FileText className="w-3.5 h-3.5 mr-1" /> New Quotation
          </Button>
        </div>
      </div>

      {/* Customer Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Info Card */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#0284C7]" /> Customer Profile & Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Phone Contact</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#0284C7]" /> {customer.phone}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Email Address</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {customer.email || 'Not provided'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Segment Type</span>
              <span className="font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full inline-block mt-0.5">
                {customer.type || 'Residential'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Site City / Region</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {customer.city || 'Jaipur, Rajasthan'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-medium block">Installation Site Address</span>
              <p className="font-medium text-slate-700 mt-0.5">
                {customer.address || 'Address details registered on project contract.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Commercial Summary Tile */}
        <Card>
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Energy & System Metrics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Solar Capacity</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {customer.totalCapacity ? `${customer.totalCapacity} kW` : '10.5 kW'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Est. Daily Generation</span>
              <span className="font-bold text-emerald-600">
                ~{Math.round((customer.totalCapacity || 10.5) * 4.5)} kWh / day
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">DISCOM Meter Sanction</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 3-Phase Approved
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Account Sales Officer</span>
              <span className="font-semibold text-[#0284C7]">Vikram Singh</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Linked Enquiries Table */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0284C7]" /> Inbound Enquiries ({enquiries.length})
        </h3>
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Enquiry Ref</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Required Capacity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.length > 0 ? (
                  enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-[#0284C7]">{enq.id}</td>
                      <td className="p-3">{enq.enquirySource || 'Website'}</td>
                      <td className="p-3 font-semibold">{enq.capacity}</td>
                      <td className="p-3">
                        <StatusBadge status={enq.enquiryStatus || enq.status || 'New'} />
                      </td>
                      <td className="p-3 text-slate-500">{formatDate(enq.createdDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No enquiry records for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Linked Quotations */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0284C7]" /> Quotations & BOQ ({quotations.length})
        </h3>
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Quotation ID</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Net Payable</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.length > 0 ? (
                  quotations.map((quo) => (
                    <tr key={quo.id} className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-[#0284C7]">{quo.id}</td>
                      <td className="p-3 font-semibold">{quo.systemCapacity || quo.capacity} kW</td>
                      <td className="p-3">{formatCurrency(quo.subtotal || quo.totalCost)}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {formatCurrency(quo.finalAmount || quo.netPayable)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={quo.status} />
                      </td>
                      <td className="p-3 text-slate-500">{formatDate(quo.expiryDate || quo.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      No quotations issued yet for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CustomerDetailsPage;

