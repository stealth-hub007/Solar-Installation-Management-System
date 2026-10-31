import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Home as HomeIcon,
  Building2,
  Factory,
  BatteryCharging,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const Services = () => {
  const serviceList = [
    {
      id: 'residential',
      icon: HomeIcon,
      title: 'Residential Rooftop Solar',
      subtitle: 'PM Surya Ghar Subsidy Compliant',
      desc: 'High-efficiency mono PERC bi-facial rooftop systems customized for independent homes, row villas, and residential bungalows. Eliminate up to 90% of electricity bills with net-metering synchronization.',
      benefits: [
        'Direct subsidy up to ₹78,000 under National Rooftop Scheme',
        '25-year performance warranty with linear generation guarantee',
        'Hot-dip galvanized, cyclone-proof mounting structures',
        'Bi-directional net meter installation with Discom liaison',
      ],
      idealFor: 'Independent Houses, Villas, Farmhouses, Residential Societies',
    },
    {
      id: 'commercial',
      icon: Building2,
      title: 'Commercial Solar Net-Metering',
      subtitle: 'Schools, Hospitals, Hotels & Corporate Offices',
      desc: 'Turn large unused commercial rooftop areas into high-yield capital assets. Lower monthly daytime operational expenses and hedge your organization against future electricity tariff hikes.',
      benefits: [
        'Claim 40% accelerated depreciation tax deduction in Year 1',
        'Drastic reduction in peak commercial tariff charges',
        'Remote cloud telemetry with live energy generation dashboards',
        'Zero interruption to business operations during installation',
      ],
      idealFor: 'Hospitals, Universities, Corporate Headquarters, Hotels, Shopping Malls',
    },
    {
      id: 'industrial',
      icon: Factory,
      title: 'Industrial High-Voltage Power Plants',
      subtitle: 'Textile Mills, Factories & Warehouses',
      desc: 'Engineered multi-hundred kilowatt and megawatt solar power plants designed for heavy manufacturing facilities, industrial sheds, and cold storage units requiring high continuous power.',
      benefits: [
        'Customized shadow-free trapezoidal metal sheet mounting',
        'HT (High Tension) transformer and HT panel synchronization',
        'Comprehensive CEIG safety clearance and statutory permits',
        'Rapid capital payback in 2.5 to 3.5 years',
      ],
      idealFor: 'Textile Mills, Cold Storages, Agro-Processing, Manufacturing Units',
    },
    {
      id: 'battery',
      icon: BatteryCharging,
      title: 'Hybrid & Off-Grid Battery Systems',
      subtitle: 'Continuous Uninterrupted Solar Power 24/7',
      desc: 'For facilities experiencing erratic power cuts or remote operations without grid access. Combines solar arrays with high-cycle Lithium Iron Phosphate (LiFePO4) battery energy storage systems.',
      benefits: [
        'Automatic transfer switch ensures zero millisecond power interruption',
        'Long-life LiFePO4 battery packs with 6,000+ cycle life',
        'Quiet, clean replacement for polluting diesel generators',
        'Micro-grid management with intelligent load balancing',
      ],
      idealFor: 'Remote Resorts, Sensitive Medical Labs, Telecom Towers, Farmhouses',
    },
    {
      id: 'maintenance',
      icon: Wrench,
      title: 'Solar Operations, Maintenance & AMC',
      subtitle: 'Preventive Care to Maximize Lifetime kWh Generation',
      desc: 'Prevent solar soiling losses and equipment degradation. Our dedicated solar maintenance crews provide high-pressure module washing, IV-curve testing, inverter health checks, and thermal imaging.',
      benefits: [
        'Infrared thermography to detect micro-cracks and hot spots',
        'Scheduled de-mineralized water module cleaning cycles',
        'Inverter firmware updates and earthing resistance testing',
        'Rapid on-site technician response for emergency faults',
      ],
      idealFor: 'Existing Solar Plant Owners, Residential & Commercial Portfolios',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* Services Header Banner */}
      <section className="bg-gradient-to-b from-[#F0F9FF] to-white py-16 sm:py-20 border-b border-sky-100 text-center px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Turnkey EPC Engineering</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Solar Solutions & Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From initial drone site analysis to Discom net metering approvals and long-term AMC, we deliver world-class solar infrastructure for every application.
          </p>
        </div>
      </section>

      {/* Services Detailed Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {serviceList.map((service, idx) => {
          const Icon = service.icon;
          const isEven = idx % 2 === 0;

          return (
            <div
              key={service.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 lg:p-12 hover:border-[#BAE6FD] hover:shadow-elevated transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={`lg:col-span-8 space-y-5 ${!isEven ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-xs font-bold text-[#0284C7]">{service.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {service.desc}
                  </p>

                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-800">Key Engineering Benefits:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.benefits.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-slate-500 font-medium">
                    <span className="font-bold text-slate-700">Ideal For:</span> {service.idealFor}
                  </div>
                </div>

                <div className={`lg:col-span-4 bg-[#F0F9FF] border border-sky-100 rounded-2xl p-6 text-center space-y-4 flex flex-col justify-center ${!isEven ? 'lg:order-1' : ''}`}>
                  <div className="w-16 h-16 rounded-full bg-white shadow-xs text-[#0284C7] mx-auto flex items-center justify-center">
                    <Sun className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Customized Feasibility</h4>
                    <p className="text-xs text-slate-600 mt-1">Get an estimated calculation of your solar savings and government subsidy eligibility.</p>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-xs transition"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#0C4A6E] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5">
          <h3 className="text-2xl sm:text-3xl font-black">Not Sure Which System Fits Your Sanctioned Load?</h3>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
            Speak directly with our Chief Solar Engineer. We analyze your electricity bill and recommend the optimum inverter and module capacity.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs shadow transition"
            >
              Request Free Feasibility Assessment
            </Link>
            <a
              href="tel:+919829012345"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
            >
              Call Us: +91 98290 12345
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

