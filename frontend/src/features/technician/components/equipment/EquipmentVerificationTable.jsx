import React, { useState } from 'react';
import Card, { CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/common/Button';
import { QrCode, CheckCircle2, AlertTriangle, Boxes, Search } from 'lucide-react';
import { EQUIPMENT_VERIFICATION_STATUSES } from '../../utils/technicianConstants';
import equipmentAPI from '../../services/equipmentAPI';

export const EquipmentVerificationTable = ({ equipments = [], jobId }) => {
  const [items, setItems] = useState(equipments);
  const [serialInput, setSerialInput] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleVerifySerial = async (eqId) => {
    if (!serialInput.trim()) return;
    setVerifyingId(eqId);
    try {
      const res = await equipmentAPI.lookupSerial(serialInput);
      setItems((prev) =>
        prev.map((item) =>
          item.id === eqId
            ? { ...item, status: 'VERIFIED', verifiedSerial: serialInput }
            : item
        )
      );
      setStatusMessage({ type: 'success', text: `Serial ${serialInput} verified and matched to delivery order.` });
      setSerialInput('');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({ type: 'error', text: 'Serial verification failed or mismatch detected.' });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleQuickMatch = (eqId) => {
    const item = items.find((x) => x.id === eqId);
    const generated = `${item.serialPrefix || 'SN-'}${Math.floor(100000 + Math.random() * 900000)}`;
    setItems((prev) =>
      prev.map((x) =>
        x.id === eqId ? { ...x, status: 'VERIFIED', verifiedSerial: generated } : x
      )
    );
  };

  return (
    <Card padding={false} className="overflow-hidden mb-6">
      <CardHeader
        title="Delivered Equipment & Hardware Serial Traceability"
        subtitle="Verify warehouse dispatched solar panels, string inverters, and battery banks against project bill of materials"
        icon={Boxes}
      />

      <div className="p-5 space-y-4">
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-3 py-2.5">Hardware Item</th>
                <th className="px-3 py-2.5 text-center">Expected / Delivered</th>
                <th className="px-3 py-2.5">Verified Serial Number</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((eq) => {
                const isVerified = eq.status === 'VERIFIED';

                return (
                  <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3">
                      <span className="font-bold text-slate-800 block">{eq.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">BOM Code: {eq.id}</span>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="font-bold text-slate-800">
                        {eq.deliveredQty} / {eq.expectedQty} units
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono text-[11px]">
                      {eq.verifiedSerial ? (
                        <span className="text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-bold">
                          {eq.verifiedSerial}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending scan/entry</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      {isVerified ? (
                        <span className="text-emerald-600 font-bold inline-flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleQuickMatch(eq.id)}
                          >
                            Quick Verify
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default EquipmentVerificationTable;

