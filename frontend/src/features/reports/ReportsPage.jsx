import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/common/Button';
import { BarChart3, Download, Zap, Sun, TreePine } from 'lucide-react';
import storageService from '../../services/storageService';

export const ReportsPage = () => {
  const projects = storageService.getProjects();
  const totalCapacityKW = projects.reduce((acc, p) => acc + (p.capacity || 0), 0);
  const estimatedAnnualMWh = Math.round(totalCapacityKW * 1.5); // ~1500 units/kW/year
  const carbonOffsetTons = Math.round(estimatedAnnualMWh * 0.82); // ~0.82t CO2 per MWh
  const equivalentTrees = Math.round(carbonOffsetTons * 45);

  const handleDownload = (format) => {
    storageService.logActivity(`Generated and exported system operational report (${format.toUpperCase()})`, 'Reports', 'Completed');
    alert(`Generating ${format.toUpperCase()} executive report with active project metrics...`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reports & Green Energy Analytics"
        subtitle="Export operational KPIs, clean electricity generation statistics, and environmental impact assessments"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={() => handleDownload('csv')}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={() => handleDownload('pdf')}>
            Export PDF Report
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-subtle flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Clean Energy Generated</span>
            <div className="text-2xl font-bold text-slate-900">{estimatedAnnualMWh.toLocaleString()} MWh</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Annualized Estimate</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-subtle flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Carbon Emissions Prevented</span>
            <div className="text-2xl font-bold text-slate-900">{carbonOffsetTons.toLocaleString()} Metric Tons</div>
            <span className="text-[11px] text-slate-400">~{equivalentTrees.toLocaleString()} trees planted</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-subtle flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Installed Generation Capacity</span>
            <div className="text-2xl font-bold text-[#0284C7]">{totalCapacityKW.toLocaleString()} kWp</div>
            <span className="text-[11px] text-slate-400">across {projects.length} sites</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            icon={BarChart3}
            title="Operational Performance Insights"
            subtitle="Benchmark metrics across project milestones"
          />
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-600">Average Turnaround Time (Enquiry to Commissioning)</span>
              <span className="font-bold text-slate-900">18.4 Days</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-600">Survey Approval Conversion Rate</span>
              <span className="font-bold text-emerald-700">92.6%</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-600">DISCOM Net Meter Synchronization SLA</span>
              <span className="font-bold text-slate-900">4.2 Days (Target: 7 Days)</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-600">First-Time Resolution on Inverter Service Tickets</span>
              <span className="font-bold text-slate-900">88.5%</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ReportsPage;

