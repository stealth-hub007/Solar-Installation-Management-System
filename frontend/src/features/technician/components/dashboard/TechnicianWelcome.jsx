import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardCheck, Wrench, Clock, CheckCircle2 } from 'lucide-react';
import Button from '../../../../components/common/Button';

export const TechnicianWelcome = ({
  technicianName = 'Vikram Singh',
  assignedSurveys = 4,
  assignedInstallations = 5,
  loggedHours = 34.5,
}) => {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#0EA5E9] p-6 sm:p-7 text-white shadow-md mb-6">
      {/* Background Solar Array Graphic Pattern */}
      <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
        <div className="grid grid-cols-4 gap-2 transform rotate-12 scale-125">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-12 h-16 border-2 border-white rounded" />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-semibold mb-3">
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>{currentDate}</span>
          <span className="w-1 h-1 rounded-full bg-sky-200" />
          <span>Field Engineering & Commissioning Unit</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Welcome back, {technicianName}
        </h1>

        <p className="text-sky-100 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl">
          You have <strong className="text-white font-bold">{assignedSurveys} site surveys</strong> and{' '}
          <strong className="text-white font-bold">{assignedInstallations} installation jobs</strong> assigned. Total{' '}
          <strong className="text-white font-bold">{loggedHours} hours</strong> logged on site this month across active solar arrays.
        </p>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ClipboardCheck}
            onClick={() => navigate('/technician/surveys')}
            className="bg-white text-[#0369A1] hover:bg-sky-50 font-bold border-none shadow-sm"
          >
            Assigned Surveys
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Wrench}
            onClick={() => navigate('/technician/installations')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            Installation Jobs
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Clock}
            onClick={() => navigate('/technician/profile')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm hidden sm:inline-flex"
          >
            Work Hours & Attendance
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianWelcome;

