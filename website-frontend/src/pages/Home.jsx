import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingDown,
  Award,
  CheckCircle2,
  Building2,
  Home as HomeIcon,
  Factory,
  Sparkles,
  ClipboardCheck,
  Compass,
  Wrench,
} from 'lucide-react';

export const Home = () => {
  const stats = [
    { value: '50+ MW', label: 'Solar Capacity Commissioned' },
    { value: '4,200+', label: 'Homes & Enterprises Powered' },
    { value: '80%', label: 'Average Electricity Bill Reduction' },
    { value: '25 Yrs', label: 'Linear Performance Warranty' },
  ];

  const solutions = [
    {
      icon: HomeIcon,
      title: 'Residential Solar',
      subtitle: 'PM Surya Ghar & State Subsidy',
      desc: 'Eliminate monthly power bills for villas, independent homes, and residential complexes with tier-1 bi-facial mono PERC panels.',
      roi: '3.5 - 4.5 Years Payback',
      features: ['Up to ₹78,000 Govt. Subsidy', 'Zero-Export Net Metering', 'Grid-Tied & Hybrid Inverters'],
      badge: 'Most Popular',
    },
    {
      icon: Building2,
      title: 'Commercial Solar',
      subtitle: 'Schools, Hospitals & Offices',
      desc: 'Lower operating overheads and claim 40% accelerated depreciation tax benefits with high-yield commercial rooftop solar plants.',
      roi: '3 - 4 Years Payback',
      features: ['Accelerated Depreciation Benefits', 'Peak Demand Power Shaving', 'Cloud-Based Remote Monitoring'],
      badge: 'High ROI',
    },
    {
      icon: Factory,
      title: 'Industrial Mega-Watts',
      subtitle: 'Manufacturing Plants & Warehouses',
      desc: 'Engineered high-voltage solar plants with customized shadow-free mounting structures, HT net metering, and zero production downtime.',
      roi: '2.5 - 3.5 Years Payback',
      features: ['High-Voltage Substation Interfacing', 'Heavy-Duty GI Mounting Structures', 'Dedicated AMC & SCADA Logging'],
      badge: 'Enterprise',
    },
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Free Feasibility Survey',
      desc: 'Our certified solar engineers conduct drone rooftop shadowing analysis and evaluate your current Discom electricity sanction load.',
      icon: Compass,
    },
    {
      step: '02',
      title: '3D CAD Engineering Design',
      desc: 'We optimize panel placement, string inverter sizing, and safety earthing layouts to maximize kilowatt-hour generation year-round.',
      icon: ClipboardCheck,
    },
    {
      step: '03',
      title: 'Discom & Net Metering Approvals',
      desc: 'We manage all paperwork, government subsidy portal registrations, inspectorate CEIG approvals, and bi-directional meter installation.',
      icon: Award,
    },
    {
      step: '04',
      title: 'Turnkey Installation & Commissioning',
      desc: 'Fast 7-10 day execution by licensed technicians with high-voltage testing, lightning arrestors, and mobile generation app setup.',
      icon: Wrench,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Full-Width Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F9FF] via-white to-[#F8FAFC] pt-16 sm:pt-24 pb-20 sm:pb-28 border-b border-sky-100">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10 text-center">
          <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-[#0284C7]" />
              <span>Premier Solar EPC & Clean Energy Solutions</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Slash Your Power Bills with <span className="text-[#0284C7]">Engineered Solar Energy</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              Turn your idle rooftop into a clean power generator. We deliver end-to-end solar engineering, tier-1 bi-facial panels, fast Discom approvals, and direct government subsidy facilitation.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition active:scale-95"
              >
                <span>Request Free Rooftop Feasibility</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-semibold border border-slate-200 shadow-xs transition"
              >
                <span>Explore Solar Systems</span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="pt-8 border-t border-sky-100/90 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white/80 py-2.5 px-4 rounded-xl border border-sky-100 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span>25-Yr Linear Warranty</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white/80 py-2.5 px-4 rounded-xl border border-sky-100 shadow-xs">
                <TrendingDown className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span>Up to 90% Bill Savings</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white/80 py-2.5 px-4 rounded-xl border border-sky-100 shadow-xs">
                <Zap className="w-4 h-4 text-[#0284C7] shrink-0" />
                <span>100% Net Metering</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl border border-sky-100 shadow-card p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-[#0284C7] tracking-tight">{s.value}</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
            <Zap className="w-4 h-4" />
            <span>Engineered Solar Offerings</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Tailored Solar Solutions for Every Property
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            From compact 3kW home rooftops to multi-megawatt industrial ground mounts, our EPC solutions maximize clean energy yield.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-[#BAE6FD] hover:shadow-elevated transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#F0F9FF] group-hover:bg-[#E0F2FE] border border-sky-200 text-[#0284C7] flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200">
                      {sol.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
                      {sol.title}
                    </h3>
                    <p className="text-xs font-semibold text-sky-600 mt-0.5">{sol.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{sol.desc}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Key Highlights:</div>
                    {sol.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {sol.roi}
                  </span>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#0369A1] transition"
                  >
                    <span>Get Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="bg-[#F0F9FF] border-y border-sky-100 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">
              Seamless Turnkey Execution
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our 4-Step Solar Commissioning Journey
            </h2>
            <p className="text-sm text-slate-600">
              We handle every step of the installation so you never have to deal with paperwork or regulatory roadblocks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm relative group">
                  <div className="text-3xl font-black text-sky-200 group-hover:text-[#0284C7] transition-colors mb-3">
                    {st.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-br from-[#0284C7] to-[#075985] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-elevated relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide">
                Quality Engineering Guarantee
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Why SunPower Solutions is the Preferred Solar EPC Partner
              </h2>
              <p className="text-sm text-sky-100 leading-relaxed">
                We combine tier-1 hardware standards, automated net metering approvals, and dedicated field maintenance crews to guarantee minimum kilowatt-hour output.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
                  <span>Tier-1 Bi-facial Half-Cut Mono PERC Solar Panels</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
                  <span>Certified High-Efficiency String & Micro Inverters (98.6% Efficiency)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
                  <span>Wind Load Tested Aluminium & Hot-Dip Galvanized Mounting Structures</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
                  <span>Real-Time Cloud Generation Telemetry via Mobile App</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-sky-50 text-[#0284C7] font-bold text-sm shadow-md transition active:scale-95"
                >
                  <span>Book a Solar Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8 space-y-4 text-white">
              <h3 className="text-xl font-bold">Fast-Track PM Surya Ghar Subsidy</h3>
              <p className="text-xs text-sky-100 leading-relaxed">
                Eligible residential installations receive direct government subsidy credit into your bank account. Our regulatory team handles the full portal upload, inspection coordination, and net meter sync.
              </p>
              <div className="bg-white/20 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>1 kW - 2 kW Capacity:</span>
                  <span className="font-bold">₹30,000 - ₹60,000 Subsidy</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>3 kW Capacity:</span>
                  <span className="font-bold">₹78,000 Maximum Subsidy</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Discom Net Metering:</span>
                  <span className="font-bold">Full 1:1 Credit</span>
                </div>
              </div>
              <div className="text-[11px] text-sky-200">
                * Subsidy figures based on national rooftop solar guidelines.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
