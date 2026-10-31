import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Mail, Phone, MapPin, ArrowUpRight, Lock, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const crmUrl = import.meta.env.VITE_CRM_URL || 'http://localhost:3000';

  return (
    <footer className="bg-[#0C4A6E] text-slate-200 border-t border-sky-900/60">
      {/* Top benefits strip */}
      <div className="bg-[#075985] py-6 px-4 sm:px-8 border-b border-sky-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
            <span>25-Year Performance Warranty on Modules</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
            <span>Direct Government Subsidy Assistance</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
            <span>Certified Rooftop EPC Engineers</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#38BDF8] shrink-0" />
            <span>Net Metering Discom Approval Guarantee</span>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
        {/* Column 1: Company Profile */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-sm">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">SunPower Solutions</span>
              <p className="text-[11px] text-sky-200 font-medium">Solar EPC & Clean Energy Architecture</p>
            </div>
          </div>
          <p className="text-xs text-sky-100/80 leading-relaxed max-w-sm">
            Empowering homes, commercial institutions, and industrial factories with tier-1 rooftop solar systems, high-efficiency solar inverters, and seamless grid synchronization.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#38BDF8] hover:text-white transition"
            >
              <span>Schedule a Free Site Feasibility Survey</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Solar Services */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Our Solutions</h4>
          <ul className="space-y-2 text-xs text-sky-100/80">
            <li><Link to="/services" className="hover:text-white transition">Residential Rooftop Solar</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Commercial Solar Net-Metering</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Industrial High-Voltage Plants</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Hybrid Battery Inverter Systems</Link></li>
            <li><Link to="/services" className="hover:text-white transition">Operations & Module Maintenance</Link></li>
          </ul>
        </div>

        {/* Column 3: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Company</h4>
          <ul className="space-y-2 text-xs text-sky-100/80">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About Our Engineering</Link></li>
            <li><Link to="/services" className="hover:text-white transition">EPC Services</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact & Quote</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Head Office</h4>
          <ul className="space-y-2.5 text-xs text-sky-100/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <span>Solar Technology Park, Mansarovar Industrial Area, Jaipur, Rajasthan 302020</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <a href="tel:+919829012345" className="hover:text-white transition">+91 98290 12345</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <a href="mailto:contact@sunpower.com" className="hover:text-white transition">contact@sunpower.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Discreet Employee Login Link */}
      <div className="border-t border-sky-800/50 py-5 px-4 sm:px-8 bg-[#082F49] text-[11px] text-sky-200/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {currentYear} SunPower Solutions Ltd. All rights reserved. Registered Solar EPC Contractor.</p>
          
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-white transition">Privacy & Quality Policy</Link>
            <span>•</span>
            {/* Discreet Employee Login Link per Section 5 */}
            <a
              href={`${crmUrl}/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950 hover:bg-[#0284C7] text-sky-200 hover:text-white border border-sky-800 hover:border-sky-500 transition duration-150"
              title="Internal staff login for Admin, Sales, Warehouse and Technicians"
            >
              <Lock className="w-3 h-3 text-[#38BDF8]" />
              <span className="font-semibold">Employee Login</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

