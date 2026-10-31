import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/common/Button';
import { ArrowLeft, CheckSquare, Wrench } from 'lucide-react';
import { fetchInstallationDetails } from '../slices/assignedInstallationSlice';
import installationAPI from '../services/installationAPI';
import InstallationChecklist from '../components/installations/InstallationChecklist';

export const InstallationChecklistPage = () => {
  const { installationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedJob: job, loading } = useSelector((state) => state.assignedInstallations);

  useEffect(() => {
    if (installationId) {
      dispatch(fetchInstallationDetails(installationId));
    }
  }, [dispatch, installationId]);

  if (loading || !job) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading checklist...
        </div>
      </PageContainer>
    );
  }

  const handleSaveChecklist = async (checklist) => {
    await installationAPI.updateChecklist(job.id, checklist);
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowLeft}
          onClick={() => navigate(`/technician/installations/${job.id}`)}
          className="text-slate-500 hover:text-slate-800"
        >
          Back to Installation Job {job.id}
        </Button>
      </div>

      <PageHeader
        title={`Field Checklist: ${job.customerName} (${job.capacity})`}
        subtitle={`Job: ${job.jobNumber} • Order: ${job.orderNumber} • Site: ${job.installationAddress}`}
      />

      <InstallationChecklist
        checklist={job.checklist}
        onSaveChecklist={handleSaveChecklist}
      />
    </PageContainer>
  );
};

export default InstallationChecklistPage;

