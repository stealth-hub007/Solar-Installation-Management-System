import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Construction, CheckCircle } from 'lucide-react';
import PageContainer from '../layout/PageContainer';
import Card from '../ui/Card';
import Button from './Button';

export const ModulePlaceholder = ({
  moduleName = 'Module',
  description = 'This SIMS operational module is currently queued for subsequent development sprints.',
  features = [],
}) => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto py-12">
        <Card className="text-center p-8 sm:p-10 border-dashed border-2 border-slate-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <Construction className="w-8 h-8 stroke-[1.8]" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            SIMS Phase II Planned Module
          </span>

          <h2 className="text-2xl font-bold text-slate-900 mt-3 mb-2">{moduleName}</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            {description}
          </p>

          {features.length > 0 && (
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-md mx-auto mb-6">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Planned Capabilities:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/dashboard')}
          >
            Return to Active Dashboard
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ModulePlaceholder;

