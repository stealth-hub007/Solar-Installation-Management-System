import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import storageService from '../../../services/storageService';
import formatCurrency from '../../../utils/formatCurrency';
import formatDate from '../../../utils/formatDate';
import {
  ArrowLeft,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
  Zap,
  Building,
  User,
  Phone,
  ShieldCheck,
  Download,
} from 'lucide-react';

export const QuotationDetailsPage = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);

  useEffect(() => {
    const found = storageService.getQuotationById(quotationId);
    setQuotation(found || null);
  }, [quotationId]);

  const handleAcceptConfirm = () => {
    if (!quotation) return;
    const { quotation: updated, order } = storageService.acceptQuotation(quotation.id, true);
    setQuotation(updated);
    setIsAcceptOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!quotation) {
    return (
      <PageContainer>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Quotation not found</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/sales/quotations')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Quotations
          </Button>
        </div>
      </PageContainer>
    );
  }

  const items = quotation.items || [
    { name: 'Solar PV Modules', quantity: 20, unitPrice: 13000, lineTotal: 260000 },
    { name: 'Solar Inverter System', quantity: 1, unitPrice: 85000, lineTotal: 85000 },
    { name: 'Mounting Structure & Civil Hardware', quantity: 1, unitPrice: 42000, lineTotal: 42000 },
    { name: 'Balance of System & ACDB/DCDB', quantity: 1, unitPrice: 38000, lineTotal: 38000 },
    { name: 'Testing & Net Metering Commissioning', quantity: 1, unitPrice: 45000, lineTotal: 45000 },
  ];

  return (
    <PageContainer>
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/quotations')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Quotation {quotation.id}
              </h1>
              <StatusBadge status={quotation.status} />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Client: <span className="font-bold text-slate-800">{quotation.customerName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1" /> Print Proposal
          </Button>

          {quotation.status !== 'Accepted' && (
            <Button variant="success" size="sm" onClick={() => setIsAcceptOpen(true)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Accepted & Convert
            </Button>
          )}
        </div>
      </div>

      {/* Formal Bill / Quotation Document Container */}
      <Card className="p-6 sm:p-8 border border-slate-200 shadow-elevated bg-white max-w-4xl mx-auto print:shadow-none print:border-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold text-[#0284C7]">
              <span>SIMS SOLAR SYSTEMS</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Solar Installation & Energy EPC Solutions</p>
            <p className="text-xs text-slate-500">GSTIN: 08AAACS1234F1Z8 | RERA Registered</p>
            <p className="text-xs text-slate-500">Sitapura Industrial Area, Jaipur, Rajasthan</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block">
              Official Quotation
            </span>
            <span className="text-lg font-mono font-extrabold text-slate-900 block mt-0.5">
              {quotation.id}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Date: <span className="font-semibold">{formatDate(quotation.createdDate || quotation.date)}</span>
            </span>
            <span className="text-xs text-slate-500 block">
              Valid Till: <span className="font-semibold">{formatDate(quotation.expiryDate)}</span>
            </span>
          </div>
        </div>

        {/* Bill-To & Project Spec */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-6">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Quotation Issued To:
            </span>
            <p className="font-extrabold text-slate-900 text-sm">{quotation.customerName}</p>
            <p className="text-slate-600 mt-0.5">{quotation.contact || '+91 98290 11223'}</p>
            <p className="text-slate-600">Jaipur Region, Rajasthan</p>
          </div>

          <div className="sm:text-right">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Solar Installation Specs:
            </span>
            <p className="font-bold text-[#0284C7] text-sm">
              {quotation.systemCapacity || quotation.capacity} kW On-Grid System
            </p>
            <p className="text-slate-600 mt-0.5">
              Est. Generation: ~{Math.round((quotation.systemCapacity || 10) * 4.5)} kWh / day
            </p>
            <p className="text-emerald-600 font-semibold flex items-center sm:justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> PM Surya Ghar Scheme Qualified
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
                <th className="py-2.5 px-3">Item & Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-medium text-slate-900">{item.name}</td>
                  <td className="py-3 px-3 text-center">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Summary Box */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-80 space-y-2 text-xs border-t border-slate-200 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Component Subtotal:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(quotation.subtotal || quotation.totalCost)}
              </span>
            </div>

            {(quotation.subsidy > 0) && (
              <div className="flex justify-between py-1 text-emerald-600 font-semibold">
                <span>Govt PM Surya Ghar Subsidy:</span>
                <span>- {formatCurrency(quotation.subsidy)}</span>
              </div>
            )}

            {(quotation.discount > 0) && (
              <div className="flex justify-between py-1 text-amber-600 font-semibold">
                <span>Special Commercial Discount:</span>
                <span>- {formatCurrency(quotation.discount)}</span>
              </div>
            )}

            <div className="flex justify-between py-1">
              <span className="text-slate-500">GST (13.8% Composite):</span>
              <span className="font-semibold text-slate-800">
                + {formatCurrency(quotation.taxAmount || Math.round((quotation.subtotal || quotation.totalCost) * 0.138))}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-t-2 border-slate-800 text-sm font-extrabold text-slate-900">
              <span>Net Customer Payable:</span>
              <span className="text-base text-[#0284C7]">
                {formatCurrency(quotation.finalAmount || quotation.netPayable)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Signatures */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
          <div>
            <span className="font-bold text-slate-700 block mb-1">Terms & Conditions:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>25 years performance warranty on solar PV modules.</li>
              <li>5 years comprehensive warranty on solar inverter.</li>
              <li>Payment terms: 30% advance, 50% on material delivery, 20% post testing.</li>
            </ul>
          </div>

          <div className="text-right flex flex-col justify-end">
            <div className="w-32 border-b border-slate-300 ml-auto mb-1" />
            <span className="font-bold text-slate-800">Authorized Signatory</span>
            <span className="text-[10px] text-slate-400">SIMS Solar Energy EPC Ltd.</span>
          </div>
        </div>
      </Card>

      {/* DIALOG: Confirm Accept Quotation */}
      <ConfirmDialog
        isOpen={isAcceptOpen}
        onClose={() => setIsAcceptOpen(false)}
        onConfirm={handleAcceptConfirm}
        title="Accept Quotation & Convert to Order"
        message={`Mark quotation ${quotation.id} as Accepted by customer ${quotation.customerName}? An official solar installation order will be generated automatically.`}
        type="success"
        confirmText="Confirm Acceptance & Create Order"
      />
    </PageContainer>
  );
};

export default QuotationDetailsPage;

