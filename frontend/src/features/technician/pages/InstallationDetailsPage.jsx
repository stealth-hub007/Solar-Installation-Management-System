import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock,
  Boxes,
} from 'lucide-react';
import {
  fetchInstallationDetails,
  startInstallationJob,
  completeInstallationJob,
} from '../slices/assignedInstallationSlice';
import installationAPI from '../services/installationAPI';
import WorkTimeTracker from '../components/installations/WorkTimeTracker';
import InstallationChecklist from '../components/installations/InstallationChecklist';
import EquipmentVerificationTable from '../components/equipment/EquipmentVerificationTable';
import CustomerSignaturePad from '../components/signoff/CustomerSignaturePad';
import { validatePreCompletion } from '../utils/installationValidators';

export const InstallationDetailsPage = () => {
  const { installationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedJob: job, loading } = useSelector((state) => state.assignedInstallations);
  const [feedback, setFeedback] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (installationId) {
      dispatch(fetchInstallationDetails(installationId));
    }
  }, [dispatch, installationId]);

  if (loading || !job) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading installation engineering job details...
        </div>
      </PageContainer>
    );
  }

  const handleStartJob = async () => {
    await dispatch(startInstallationJob(job.id));
    setFeedback({ type: 'success', message: 'Installation job marked In-Progress.' });
  };

  const handleSaveChecklist = async (updatedChecklist) => {
    await installationAPI.updateChecklist(job.id, updatedChecklist);
  };

  const handleLogWorkHours = async (payload) => {
    await installationAPI.logWorkHours(job.id, payload);
    setFeedback({ type: 'success', message: `Logged ${payload.total_hours} work hours to project records.` });
  };

  const handleCustomerSignoff = async (formData) => {
    await installationAPI.captureSignoff(job.id, formData);
    setFeedback({ type: 'success', message: 'Customer digital sign-off and feedback captured successfully!' });
  };

  const preCompletion = validatePreCompletion({
    checklist: job.checklist,
    signoff: job.signoff,
    verifiedEquipments: job.equipments,
  });

  const handleCompleteJob = async () => {
    if (!preCompletion.canComplete) {
      setFeedback({
        type: 'error',
        message: 'Cannot complete installation: mandatory checklist items or customer signoff are pending.',
      });
      return;
    }

    setIsCompleting(true);
    try {
      const res = await dispatch(
        completeInstallationJob({
          id: job.id,
          data: {
            power_generated_watts: 9800,
            testing_results: 'Voc = 485V, Isc = 11.2A, Insulation Resistance > 50 Megohms. Generation verified on bi-directional net meter.',
            remarks: 'Turnkey rooftop solar installation commissioned without defects.',
          },
        })
      );
      if (!res.error) {
        setFeedback({
          type: 'success',
          message: 'Installation job successfully verified, completed, and closed!',
        });
      }
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowLeft}
          onClick={() => navigate('/technician/installations')}
          className="text-slate-500 hover:text-slate-800"
        >
          Back to Assigned Installations
        </Button>
      </div>

      <PageHeader
        title={`Installation Job: ${job.id} (${job.capacity})`}
        subtitle={`Order: ${job.orderNumber} • Project Ref: ${job.projectRef} • Warehouse: ${job.dispatchStatus}`}
        actions={
          <div className="flex items-center gap-2">
            {job.status === 'Scheduled' && (
              <Button variant="primary" icon={Wrench} onClick={handleStartJob}>
                Start Installation
              </Button>
            )}

            <Button
              variant="primary"
              icon={Award}
              onClick={handleCompleteJob}
              disabled={job.status === 'Completed'}
              isLoading={isCompleting}
              className={job.status === 'Completed' ? 'bg-emerald-600' : ''}
            >
              {job.status === 'Completed' ? 'Job Completed & Closed' : 'Final Complete & Handover'}
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`p-4 rounded-xl mb-6 text-xs flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Overview Card */}
      <Card padding={false} className="overflow-hidden mb-6">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Customer & Installation Site
            </span>
            <div className="font-bold text-base text-slate-900">{job.customerName}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.contact}</span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.installationAddress}</span>
            </div>
          </div>

          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Solar Array Hardware
            </span>
            <div className="text-xs font-semibold text-slate-800">{job.panels}</div>
            <div className="text-xs text-slate-600">{job.inverter}</div>
            <div className="text-xs text-slate-500">{job.battery}</div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Job Status & Timeline
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {job.dispatchStatus}
              </span>
            </div>
            <div className="text-xs text-slate-500 pt-1">
              Field Lead: <strong className="text-slate-800">Vikram Singh</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* 1. On-Site Work Time Tracking */}
      <WorkTimeTracker
        jobId={job.id}
        onLogHours={handleLogWorkHours}
        workLogs={job.workLogs}
      />

      {/* 2. Mandatory Installation Checklist */}
      <InstallationChecklist
        checklist={job.checklist}
        onSaveChecklist={handleSaveChecklist}
      />

      {/* 3. Delivered Hardware & Serial Traceability */}
      <EquipmentVerificationTable
        equipments={job.equipments}
        jobId={job.id}
      />

      {/* 4. Customer Sign-off & Digital Signature */}
      <CustomerSignaturePad
        customerName={job.customerName}
        onSaveSignoff={handleCustomerSignoff}
      />

      {/* Pre-Completion Review */}
      <Card padding={false} className="p-5 overflow-hidden">
        <h4 className="font-bold text-sm text-slate-900 mb-2">Final Completion Gate</h4>
        {preCompletion.canComplete ? (
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All mandatory checklist items verified, serial numbers matched, and customer signature confirmed.</span>
            </span>
            <Button
              size="xs"
              variant="primary"
              icon={Award}
              onClick={handleCompleteJob}
              disabled={job.status === 'Completed'}
            >
              Complete Job
            </Button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Items remaining before completion:</span>
            </div>
            {preCompletion.blockingReasons.map((reason, idx) => (
              <div key={idx} className="ml-5 list-disc">• {reason}</div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default InstallationDetailsPage;
