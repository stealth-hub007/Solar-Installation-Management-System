import React, { useState } from 'react';
import Card, { CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/common/Button';
import { CheckSquare, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MANDATORY_CHECKLIST_ITEMS } from '../../utils/technicianConstants';
import { validateInstallationChecklist } from '../../utils/installationValidators';

export const InstallationChecklist = ({ checklist = {}, onSaveChecklist, isSaving }) => {
  const [itemsState, setItemsState] = useState(checklist);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleItem = (key) => {
    setItemsState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (onSaveChecklist) {
      await onSaveChecklist(itemsState);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const status = validateInstallationChecklist(itemsState);

  return (
    <Card padding={false} className="overflow-hidden mb-6">
      <CardHeader
        title="Mandatory Field Installation Checklist"
        subtitle="Verify mechanical mounting, electrical cabling, surge protection, earthing, and DISCOM synchronization"
        icon={CheckSquare}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">{status.completionPercentage}% Complete</span>
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Installation checklist saved and verified.</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              status.isFullyComplete ? 'bg-emerald-500' : 'bg-[#0284C7]'
            }`}
            style={{ width: `${status.completionPercentage}%` }}
          />
        </div>

        {/* Checklist Item Toggles */}
        <div className="divide-y divide-slate-100">
          {MANDATORY_CHECKLIST_ITEMS.map((item, idx) => {
            const isChecked = !!itemsState[item.key];

            return (
              <div
                key={item.key}
                onClick={() => toggleItem(item.key)}
                className="py-3 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 rounded-lg px-2 transition-colors select-none"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by parent div onClick
                    className="w-4 h-4 mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-bold block ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>
                      {idx + 1}. {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Category: {item.category} {item.optional ? '• (Optional if no battery pack)' : '• Mandatory'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                    isChecked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {isChecked ? 'Verified' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer save */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {status.isFullyComplete ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All checklist verification items are 100% complete.
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                {status.incompleteItems.length} mandatory item(s) pending.
              </span>
            )}
          </div>

          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Save Checklist Progress
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InstallationChecklist;
