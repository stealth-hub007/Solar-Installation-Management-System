import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import { ArrowLeft, Send, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchSurveyDetails, submitSurvey } from '../slices/assignedSurveySlice';
import { validateSurveyPreSubmission } from '../utils/surveyValidators';

export const SurveySubmissionPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedSurvey: survey, loading } = useSelector((state) => state.assignedSurveys);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (surveyId) {
      dispatch(fetchSurveyDetails(surveyId));
    }
  }, [dispatch, surveyId]);

  if (loading || !survey) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading submission summary...
        </div>
      </PageContainer>
    );
  }

  const preCheck = validateSurveyPreSubmission(survey, survey.photos || []);

  const handleSubmit = async () => {
    const res = await dispatch(submitSurvey(survey.id));
    if (!res.error) {
      setFeedback({ type: 'success', text: 'Survey submitted for management and sales review!' });
    }
  };

  return (
    <PageContainer>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="xs"
          icon={ArrowLeft}
          onClick={() => navigate(`/technician/surveys/${survey.id}`)}
          className="text-slate-500 hover:text-slate-800"
        >
          Back to Survey Inspection
        </Button>
      </div>

      <PageHeader
        title={`Final Survey Submission: ${survey.id}`}
        subtitle={`Customer: ${survey.customerName} • Proposed Capacity: ${survey.proposedCapacity}`}
      />

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{feedback.text}</span>
        </div>
      )}

      <Card padding={false} className="p-6 overflow-hidden mb-6">
        <h4 className="font-bold text-sm text-slate-900 mb-4">Inspection Summary & Evidence</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block">Usable Roof Area:</span>
            <span className="font-bold text-slate-800">{survey.roof_area_sqft} sq. ft</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block">Shadow-Free Area:</span>
            <span className="font-bold text-slate-800">{survey.shadow_free_area_sqft} sq. ft</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block">Roof Orientation & Tilt:</span>
            <span className="font-bold text-slate-800">{survey.roof_orientation} ({survey.roof_tilt_degrees}°)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block">Cable Routing Run:</span>
            <span className="font-bold text-slate-800">{survey.cable_distance_meters} meters</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current Status: <strong className="text-[#0284C7]">{survey.status}</strong>
          </span>
          <Button
            variant="primary"
            icon={Send}
            onClick={handleSubmit}
            disabled={!preCheck.canSubmit || survey.status === 'Submitted'}
          >
            {survey.status === 'Submitted' ? 'Already Submitted' : 'Confirm & Submit to Management'}
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
};

export default SurveySubmissionPage;

