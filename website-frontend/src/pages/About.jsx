import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  ShieldCheck,
  Award,
  Users,
  Compass,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Building,
  Target,
} from 'lucide-react';

export const About = () => {
  const values = [
    {
      title: 'Engineering Rigor',
      desc: 'Every rooftop project is modeled with precise shadow analysis, certified structural load testing, and IEC-compliant earthing protection.',
      icon: Compass,
    },
    {
      title: 'Tier-1 Equipment Only',
      desc: 'We strictly partner with tier-1 Bloomberg NEF listed photovoltaic module makers and European-standard string inverters.',
      icon: ShieldCheck,
    },
    {
      title: 'Transparency & Integrity',
      desc: 'No hidden installation charges, no fabricated performance claims. We provide guaranteed minimum energy generation contracts.',
      icon: Award,
    },
    {
      title: 'Lifecycle Customer Care',
      desc: 'Our relationship begins on commissioning day. We provide 25-year performance monitoring, routine thermography scans, and preventive cleaning.',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F0F9FF] to-white py-16 sm:py-20 border-b border-sky-100 text-center px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5" />
            <span>Engineering Clean Energy Futures</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About SunPower Solutions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We are a premier solar Engineering, Procurement, and Construction (EPC) firm dedicated to transitioning residential homes, educational institutions, and industrial plants to sustainable, high-yield clean power.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-sky-100 p-8 sm:p-10 shadow-card space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To make solar electricity accessible, dependable, and highly profitable for property owners by combining world-class engineering standards, rapid government subsidy processing, and zero-defect rooftop installations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-sky-100 p-8 sm:p-10 shadow-card space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To power 100+ Megawatts of clean solar generation across regional communities, driving energy independence, eliminating millions of tons of carbon emissions, and helping our customers achieve zero electricity bills.
            </p>
          </div>
        </div>
      </section>

      {/* Core Engineering Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">Our Foundations</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            The Principles Behind Our EPC Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">{val.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#0C4A6E] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Partner with SunPower Solutions?
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
            Let our experienced solar engineers review your rooftop structure and electricity consumption to provide a customized project feasibility report.
          </p>
          <div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-sm shadow-md transition"
            >
              <span>Get in Touch with Our Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

