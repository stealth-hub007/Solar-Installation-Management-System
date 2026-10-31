import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import ContactForm from '../components/forms/ContactForm';

export const ContactUs = () => {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-[#F0F9FF] to-white py-14 sm:py-18 border-b border-sky-100 text-center px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Solar Consultation</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Contact SunPower Solutions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Have questions about solar rooftop feasibility, government subsidy schemes, or commercial payback? Our solar engineers are ready to assist.
          </p>
        </div>
      </section>

      {/* Main Content Grid: Contact Details (Left) + Form (Right) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-sky-100 p-6 sm:p-8 shadow-card space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Corporate Office
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Headquarters & EPC Depot</h4>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Solar Technology Park, Mansarovar Industrial Area, Jaipur, Rajasthan 302020
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Direct Sales & Support</h4>
                    <p className="text-slate-600 mt-0.5">
                      <a href="tel:+919829012345" className="hover:text-[#0284C7] transition font-medium">
                        +91 98290 12345
                      </a>
                    </p>
                    <p className="text-[11px] text-slate-400">Available Monday through Saturday</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email Inquiries</h4>
                    <p className="text-slate-600 mt-0.5">
                      <a href="mailto:contact@sunpower.com" className="hover:text-[#0284C7] transition font-medium">
                        contact@sunpower.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] border border-sky-200 text-[#0284C7] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Business Hours</h4>
                    <p className="text-slate-600 mt-0.5">Monday – Saturday: 9:00 AM – 7:00 PM</p>
                    <p className="text-[11px] text-slate-400">Sunday: Emergency Dispatch & Technicians Only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality assurance guarantee card */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" />
                <span>Our Turnaround Commitment</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                  <span>Feasibility feedback within 24 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                  <span>On-site shadow & load survey in 48 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                  <span>Detailed 3D CAD proposal & generation estimate</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;

