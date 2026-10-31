import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Sun, Menu, X, Phone } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4 px-3 sm:px-6 lg:px-8">
      {/* Floating Elevated Navigation Bar Container with Top Margin & Padding */}
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-sky-100 shadow-card px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between transition-all">
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Sun className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-[#0284C7] transition-colors">
                SunPower
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                Solar
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 -mt-0.5">Engineering & Clean Energy</span>
          </div>
        </Link>

        {/* Desktop navigation links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-[#0284C7] bg-[#F0F9FF]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Right side contact phone */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="tel:+919829012345"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#0284C7] hover:bg-sky-50 transition border border-transparent hover:border-sky-100"
          >
            <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>+91 98290 12345</span>
          </a>
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 bg-white rounded-2xl border border-sky-100 p-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'text-[#0284C7] bg-[#F0F9FF] font-bold border-l-4 border-[#0284C7]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-slate-100">
            <a
              href="tel:+919829012345"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-sky-200 text-[#0284C7] bg-[#F0F9FF] text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Solar Engineer: +91 98290 12345</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
