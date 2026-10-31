import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckSquare,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Play,
  CheckCircle2,
  FileCheck2,
  Wrench,
  ShieldCheck,
  PenTool,
  RefreshCw,
  Eye,
  MessageSquare,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import Card from '../../../components/ui/Card';
import surveyAPI from '../services/surveyAPI';
import installationAPI from '../services/installationAPI';

export const MyTasksPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [surveys, setSurveys] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [selectedCorrection, setSelectedCorrection] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [surveyRes, instRes] = await Promise.allSettled([
        surveyAPI.getAssignedSurveys(),
        installationAPI.getAssignedInstallations(),
      ]);

      if (surveyRes.status === 'fulfilled') {
        setSurveys(surveyRes.value || []);
      }
      if (instRes.status === 'fulfilled') {
        setInstallations(instRes.value || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Build unified task list
  const unifiedTasks = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Process Site Surveys
    surveys.forEach((s) => {
      const isNeedsCorrection = s.approval_status === 'REJECTED';
      const isApproved = s.approval_status === 'APPROVED';
      const isSubmitted = s.survey_status === 'SUBMITTED' || s.survey_status === 'COMPLETED';
      const scheduledDateStr = s.scheduled_date ? s.scheduled_date.split('T')[0] : '';
      const isToday = scheduledDateStr === todayStr;
      const isOverdue = scheduledDateStr && scheduledDateStr < todayStr && !isSubmitted;
      const isUpcoming = scheduledDateStr && scheduledDateStr > todayStr;

      let category = 'SURVEY';
      let requiredAction = 'View Details';
      let actionType = 'view_survey';

      if (isNeedsCorrection) {
        requiredAction = 'Review Comments & Correct';
        actionType = 'correction';
      } else if (s.survey_status === 'SCHEDULED') {
        requiredAction = 'Start Survey';
        actionType = 'start_survey';
      } else if (s.survey_status === 'IN_PROGRESS') {
        requiredAction = 'Continue & Submit Survey';
        actionType = 'continue_survey';
      } else if (isSubmitted && !isApproved) {
        requiredAction = 'Awaiting Approval';
        actionType = 'view_survey';
      }

      list.push({
        id: `task-survey-${s.id}`,
        rawId: s.id,
        reference: s.displayId || `SRV-${s.id.slice(0, 8).toUpperCase()}`,
        taskType: 'Site Survey',
        category,
        customerName: s.customerName || `Customer #${s.customer_id?.slice(0, 8) || 'N/A'}`,
        projectRef: `ENQ-${s.enquiry_id?.slice(0, 8).toUpperCase() || 'REF'}`,
        siteAddress: s.siteAddress || 'Site inspection rooftop location',
        scheduledDate: s.scheduled_date,
        dueDate: s.scheduled_date,
        priority: s.priority || (isNeedsCorrection ? 'High' : 'Normal'),
        backendStatus: s.survey_status || 'SCHEDULED',
        approvalStatus: s.approval_status,
        isToday,
        isOverdue,
        isUpcoming,
        isCompleted: isSubmitted && isApproved,
        isNeedsCorrection,
        rejectionReason: s.rejection_reason,
        requiredAction,
        actionType,
        targetRoute: `/technician/surveys/${s.id}`,
      });
    });

    // 2. Process Installation Jobs
    installations.forEach((j) => {
      const scheduledDateStr = j.scheduled_date ? j.scheduled_date.split('T')[0] : '';
      const isToday = scheduledDateStr === todayStr;
      const isCompleted = j.installation_status === 'COMPLETED';
      const isOverdue = scheduledDateStr && scheduledDateStr < todayStr && !isCompleted;
      const isUpcoming = scheduledDateStr && scheduledDateStr > todayStr;

      const checklistCompleted = j.checklistCompleted || 0;
      const checklistDone = checklistCompleted >= 8;
      const hasSignoff = !!j.signoff;

      let category = 'INSTALLATION';
      let requiredAction = 'View Job';
      let actionType = 'view_job';

      if (j.installation_status === 'PENDING_ASSIGNMENT' || j.installation_status === 'SCHEDULED') {
        requiredAction = 'Start Installation';
        actionType = 'start_job';
      } else if (j.installation_status === 'IN_PROGRESS' || j.installation_status === 'TESTING') {
        if (!checklistDone) {
          requiredAction = 'Verify & Complete Checklist';
          actionType = 'checklist';
        } else if (!hasSignoff) {
          requiredAction = 'Customer Digital Sign-off';
          actionType = 'signoff';
        } else {
          requiredAction = 'Complete & Handover';
          actionType = 'complete_job';
        }
      } else if (isCompleted) {
        requiredAction = 'Commissioned & Closed';
        actionType = 'view_job';
      }

      list.push({
        id: `task-inst-${j.id}`,
        rawId: j.id,
        reference: j.job_number || `JOB-${j.id.slice(0, 8).toUpperCase()}`,
        taskType: 'Installation',
        category,
        customerName: j.customerName || `Customer #${j.customer_id?.slice(0, 8) || 'N/A'}`,
        projectRef: `ORD-${j.order_id?.slice(0, 8).toUpperCase() || 'REF'}`,
        siteAddress: j.installationAddress || 'Rooftop mounting & array installation',
        scheduledDate: j.scheduled_date,
        dueDate: j.scheduled_date,
        priority: isOverdue ? 'High' : 'Normal',
        backendStatus: j.installation_status || 'SCHEDULED',
        approvalStatus: isCompleted ? 'APPROVED' : 'IN_PROGRESS',
        isToday,
        isOverdue,
        isUpcoming,
        isCompleted,
        isNeedsCorrection: false,
        rejectionReason: null,
        requiredAction,
        actionType,
        targetRoute: `/technician/installations/${j.id}`,
      });
    });

    return list;
  }, [surveys, installations]);

  // Tab Filtering
  const filteredTasks = useMemo(() => {
    return unifiedTasks.filter((task) => {
      // 1. Tab Match
      if (activeTab === 'today' && !task.isToday) return false;
      if (activeTab === 'upcoming' && !task.isUpcoming) return false;
      if (activeTab === 'pending' && (task.backendStatus !== 'SCHEDULED' && task.backendStatus !== 'PENDING_ASSIGNMENT')) return false;
      if (activeTab === 'in_progress' && (task.backendStatus !== 'IN_PROGRESS' && task.backendStatus !== 'TESTING')) return false;
      if (activeTab === 'overdue' && !task.isOverdue) return false;
      if (activeTab === 'completed' && !task.isCompleted) return false;
      if (activeTab === 'correction' && !task.isNeedsCorrection) return false;

      // 2. Type Filter Match
      if (typeFilter !== 'ALL' && task.category !== typeFilter) return false;

      // 3. Search Match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesRef = task.reference.toLowerCase().includes(q);
        const matchesCust = task.customerName.toLowerCase().includes(q);
        const matchesProj = task.projectRef.toLowerCase().includes(q);
        const matchesAddr = task.siteAddress.toLowerCase().includes(q);
        if (!matchesRef && !matchesCust && !matchesProj && !matchesAddr) return false;
      }

      return true;
    });
  }, [unifiedTasks, activeTab, typeFilter, searchTerm]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: unifiedTasks.length,
      today: unifiedTasks.filter((t) => t.isToday).length,
      upcoming: unifiedTasks.filter((t) => t.isUpcoming).length,
      pending: unifiedTasks.filter((t) => t.backendStatus === 'SCHEDULED' || t.backendStatus === 'PENDING_ASSIGNMENT').length,
      in_progress: unifiedTasks.filter((t) => t.backendStatus === 'IN_PROGRESS' || t.backendStatus === 'TESTING').length,
      overdue: unifiedTasks.filter((t) => t.isOverdue).length,
      completed: unifiedTasks.filter((t) => t.isCompleted).length,
      correction: unifiedTasks.filter((t) => t.isNeedsCorrection).length,
    };
  }, [unifiedTasks]);

  const handleActionClick = (task) => {
    if (task.actionType === 'correction') {
      setSelectedCorrection(task);
    } else {
      navigate(task.targetRoute);
    }
  };

  const getStatusBadge = (task) => {
    if (task.isNeedsCorrection) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3" />
          Needs Correction
        </span>
      );
    }
    if (task.isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (task.backendStatus === 'IN_PROGRESS' || task.backendStatus === 'TESTING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Play className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    if (task.approvalStatus === 'PENDING_APPROVAL' || task.backendStatus === 'SUBMITTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <FileCheck2 className="w-3 h-3" />
          Awaiting Approval
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        Scheduled
      </span>
    );
  };

  return (
    <PageContainer>
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unified My Tasks</h1>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-[#0284C7] border border-sky-200">
              Live Field Queue
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Centralized field engineering tasks, inspection visits, site surveys, and equipment commissioning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            loading={refreshing}
            className="text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            Refresh Queue
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CheckSquare}
            onClick={() => navigate('/technician/surveys')}
            className="bg-[#0284C7] hover:bg-[#0369A1] shadow-sm"
          >
            Go to Surveys
          </Button>
        </div>
      </div>

      {/* 2. Operational Metrics Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{counts.all}</div>
            <div className="text-xs text-slate-500 font-medium">Total Assigned</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600">{counts.today}</div>
            <div className="text-xs text-slate-500 font-medium">Scheduled Today</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-600">{counts.in_progress}</div>
            <div className="text-xs text-slate-500 font-medium">Active In-Progress</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-rose-600">{counts.correction}</div>
            <div className="text-xs text-slate-500 font-medium">Needs Correction</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{counts.completed}</div>
            <div className="text-xs text-slate-500 font-medium">Completed & Handed</div>
          </div>
        </div>
      </div>

      {/* 3. Search and Quick Filters */}
      <Card className="p-4 mb-6 shadow-sm border-slate-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reference, customer name, project or site address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter tasks by operational category"
              className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            >
              <option value="ALL">All Categories</option>
              <option value="SURVEY">Site Surveys Only</option>
              <option value="INSTALLATION">Installations Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {[
          { key: 'all', label: 'All Tasks', count: counts.all },
          { key: 'today', label: "Today's Tasks", count: counts.today },
          { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'in_progress', label: 'In Progress', count: counts.in_progress },
          { key: 'overdue', label: 'Overdue', count: counts.overdue, alert: counts.overdue > 0 },
          { key: 'correction', label: 'Needs Correction', count: counts.correction, alert: counts.correction > 0 },
          { key: 'completed', label: 'Completed', count: counts.completed },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchParams({ tab: tab.key });
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.alert
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Tasks List View */}
      {loading ? (
        <Card className="p-12 text-center border-slate-200">
          <RefreshCw className="w-8 h-8 text-[#0284C7] animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Loading Assigned Tasks...</h3>
          <p className="text-xs text-slate-500">Querying real-time assignments from the database.</p>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-12 text-center border-slate-200">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No tasks found for this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm
              ? `No assignments match "${searchTerm}". Try resetting your search terms or filters.`
              : 'You currently have no tasks matching the selected filter tab.'}
          </p>
          {(searchTerm || activeTab !== 'all' || typeFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('all');
                setSearchTerm('');
                setTypeFilter('ALL');
                setSearchParams({ tab: 'all' });
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isSurvey = task.category === 'SURVEY';
            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Task Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-sm ${
                      isSurvey
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                        : 'bg-gradient-to-br from-[#0284C7] to-[#0369A1]'
                    }`}
                  >
                    {isSurvey ? <CheckSquare className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{task.reference}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {task.taskType}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{task.projectRef}</span>
                      {task.priority === 'High' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                          High Priority
                        </span>
                      )}
                      {task.isOverdue && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Overdue
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-semibold text-slate-900 truncate mb-1">
                      {task.customerName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{task.siteAddress}</span>
                      </div>
                      {task.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(task.scheduledDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {task.isNeedsCorrection && task.rejectionReason && (
                      <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Correction Required:</strong> {task.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Status & Action Controls */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(task)}
                  </div>

                  <div className="flex items-center gap-2">
                    {task.isNeedsCorrection ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={MessageSquare}
                        onClick={() => handleActionClick(task)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                      >
                        Review Comments
                      </Button>
                    ) : (
                      <Button
                        variant={task.actionType === 'start_survey' || task.actionType === 'start_job' ? 'primary' : 'outline'}
                        size="sm"
                        icon={task.isCompleted ? Eye : ChevronRight}
                        onClick={() => handleActionClick(task)}
                        className={`text-xs font-semibold ${
                          task.actionType === 'start_survey' || task.actionType === 'start_job'
                            ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm'
                            : 'text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {task.requiredAction}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Reviewer Comments Modal */}
      {selectedCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900">Reviewer Correction Comments</h3>
              </div>
              <button
                onClick={() => setSelectedCorrection(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignment Reference</span>
                <p className="text-sm font-bold text-slate-900">{selectedCorrection.reference} ({selectedCorrection.taskType})</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer & Project</span>
                <p className="text-sm text-slate-800">{selectedCorrection.customerName} • {selectedCorrection.projectRef}</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-900">
                <span className="font-bold block mb-1">Supervisor/Admin Feedback:</span>
                <p className="leading-relaxed whitespace-pre-wrap">{selectedCorrection.rejectionReason || 'Please revisit site to verify roof tilt angles and take higher-resolution photos of the AC breaker distribution box.'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCorrection(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ChevronRight}
                onClick={() => {
                  const target = selectedCorrection.targetRoute;
                  setSelectedCorrection(null);
                  navigate(target);
                }}
                className="bg-[#0284C7] hover:bg-[#0369A1]"
              >
                Open Survey for Revision
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default MyTasksPage;
