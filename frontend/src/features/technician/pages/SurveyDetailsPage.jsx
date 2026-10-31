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
  Send,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  fetchSurveyDetails,
  updateSurveyMeasurements,
  submitSurvey,
} from '../slices/assignedSurveySlice';
import surveyAPI from '../services/surveyAPI';
import SiteMeasurementForm from '../components/surveys/SiteMeasurementForm';
import SitePhotographUpload from '../components/surveys/SitePhotographUpload';
import { validateSurveyPreSubmission } from '../utils/surveyValidators';

export const SurveyDetailsPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedSurvey: survey, loading, saving } = useSelector((state) => state.assignedSurveys);
  const [photos, setPhotos] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyDetails(surveyId)).then((res) => {
        if (res.payload?.photos) {
          setPhotos(res.payload.photos);
        }
      });
    }
  }, [dispatch, surveyId]);

  if (loading || !survey) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading site survey specifications...
        </div>
      </PageContainer>
    );
  }

  const handleSaveMeasurements = async (measurements) => {
    await dispatch(updateSurveyMeasurements({ id: survey.id, measurements }));
  };

  const handleUploadPhoto = async (file, caption) => {
    setIsUploadingPhoto(true);
    try {
      const res = await surveyAPI.uploadPhoto(survey.id, file, caption);
      setPhotos((prev) => [...prev, res]);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const preSubmissionCheck = validateSurveyPreSubmission(survey, photos);

  const handleSubmitSurvey = async () => {
    if (!preSubmissionCheck.canSubmit) {
      setSubmissionFeedback({
        type: 'error',
        message: 'Please complete all mandatory measurements and upload at least 2 photographs before submitting.',
      });
      return;
    }
    const res = await dispatch(submitSurvey(survey.id));
    if (!res.error) {
      setSubmissionFeedback({
        type: 'success',
        message: 'Site survey successfully submitted for management approval!',
      });
    }
  };

  return (
    <PageContainer>
      {/* Back button and Header */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowLeft}
          onClick={() => navigate('/technician/surveys')}
          className="text-slate-500 hover:text-slate-800"
        >
          Back to Assigned Surveys
        </Button>
      </div>

      <PageHeader
        title={`Survey Inspection: ${survey.id}`}
        subtitle="Rooftop structural measurements, electrical layout validation, and photographic evidence"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              icon={Send}
              onClick={handleSubmitSurvey}
              disabled={survey.status === 'Submitted' || survey.status === 'Completed'}
            >
              {survey.status === 'Submitted' ? 'Submitted for Approval' : 'Submit for Approval'}
            </Button>
          </div>
        }
      />

      {submissionFeedback && (
        <div
          className={`p-4 rounded-xl mb-6 text-xs flex items-center gap-3 ${
            submissionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {submissionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{submissionFeedback.message}</span>
        </div>
      )}

      {/* Customer & Assignment Meta Card */}
      <Card padding={false} className="overflow-hidden mb-6">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer info */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Client & Site Details
            </span>
            <div className="font-bold text-base text-slate-900">{survey.customerName}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{survey.contact || '+91 98290 11223'}</span>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{survey.siteAddress}</span>
            </div>
          </div>

          {/* Survey specifications */}
          <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Survey Specifications
            </span>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Proposed Capacity:</span>
              <span className="font-bold text-slate-900">{survey.proposedCapacity}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Roof Category:</span>
              <span className="font-semibold text-slate-800">{survey.roofType}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Inspection Schedule:</span>
              <span className="font-semibold text-slate-800">{survey.scheduledDate}</span>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workflow Status
            </span>
            <div className="flex items-center gap-2 pt-1">
              <StatusBadge status={survey.status} />
              {survey.approvalStatus && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {survey.approvalStatus}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 pt-2">
              Assigned Field Lead: <strong className="text-slate-800">Vikram Singh</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Precision Measurements Form */}
      <SiteMeasurementForm
        survey={survey}
        onSave={handleSaveMeasurements}
        isSaving={saving}
      />

      {/* 3. Site Photographs Upload */}
      <SitePhotographUpload
        photos={photos}
        onUploadPhoto={handleUploadPhoto}
        isUploading={isUploadingPhoto}
      />

      {/* 4. Pre-Submission Status Card */}
      <Card padding={false} className="p-5 overflow-hidden">
        <h4 className="font-bold text-sm text-slate-900 mb-2">Pre-Submission Validation</h4>
        {preSubmissionCheck.canSubmit ? (
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All mandatory measurements and minimum 2 photographs are recorded. Ready for submission.</span>
            </span>
            <Button
              size="xs"
              variant="primary"
              icon={Send}
              onClick={handleSubmitSurvey}
              disabled={survey.status === 'Submitted' || survey.status === 'Completed'}
            >
              Submit Now
            </Button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Pending items before submission can be accepted:</span>
            </div>
            {preSubmissionCheck.issues.map((issue, idx) => (
              <div key={idx} className="ml-5 list-disc">• {issue}</div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default SurveyDetailsPage;

