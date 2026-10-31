import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Shield, Lock, Mail, User, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import storageService from '../../services/storageService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'request'

  // Sign In Form
  const [email, setEmail] = useState('admin@solar-sims.com');
  const [password, setPassword] = useState('••••••••••••');
  const [signInError, setSignInError] = useState('');

  // Request Access Form
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
    role: 'Operations Manager',
    department: 'Supply Chain & Field Execution',
    reason: '',
  });
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email) {
      setSignInError('Please enter an email address');
      return;
    }
    // Simulate authentication
    localStorage.setItem('sims_auth_user', JSON.stringify({ email, role: 'Super Administrator' }));
    storageService.logActivity(`Admin User authenticated into SIMS administrative console`, 'Authentication', 'Success');
    navigate('/admin/dashboard');
  };

  const handleRequestAccess = (e) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.email) {
      alert('Please fill in your name and corporate email address.');
      return;
    }

    // Submit request to storageService which also triggers instant Admin notification
    const newReq = storageService.createAccessRequest(requestForm);
    setRequestSuccess(true);
    setRequestForm({
      name: '',
      email: '',
      role: 'Operations Manager',
      department: 'Supply Chain & Field Execution',
      reason: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F0F7FF] to-[#E0F2FE] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated border border-slate-200/80 overflow-hidden">
        {/* Brand Header */}
        <div className="p-6 bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sun className="w-7 h-7 text-amber-300 fill-amber-300 animate-[spin_20s_linear_infinite]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Solar Management System</h1>
          <p className="text-xs text-sky-100 mt-1">SIMS Enterprise Operational Cloud</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('signin');
              setRequestSuccess(false);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'signin'
                ? 'border-[#0284C7] text-[#0284C7] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In to Panel
          </button>
          <button
            onClick={() => {
              setActiveTab('request');
              setRequestSuccess(false);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              activeTab === 'request'
                ? 'border-[#0284C7] text-[#0284C7] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Request Panel Access
          </button>
        </div>

        {/* Tab 1: Sign In */}
        {activeTab === 'signin' && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-800">Administrator Sign In</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in to manage solar assets, inventory and lead pipelines
              </p>
            </div>

            {signInError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {signInError}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@solar-sims.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>
              </div>

              <Button variant="primary" size="md" className="w-full justify-center mt-2" type="submit">
                Enter Admin Console <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Are you a Manager or Staff member without access?{' '}
                <button
                  onClick={() => setActiveTab('request')}
                  className="text-[#0284C7] font-semibold hover:underline"
                >
                  Request verification here
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Request Panel Access */}
        {activeTab === 'request' && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-800">Request Role Authorization</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff, Managers & Field Engineers request access verified by the Super Administrator
              </p>
            </div>

            {requestSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Access Request Submitted!</h3>
                <p className="text-xs text-slate-600">
                  Your request has been forwarded to the Super Administrator. An instant notification has been dispatched to their console. You will gain panel clearance once approved.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="mt-3 w-full justify-center"
                >
                  Go to Demo Dashboard
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={requestForm.name}
                      onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                      placeholder="e.g. Vikram Shekhawat"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Corporate Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={requestForm.email}
                      onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                      placeholder="vikram@solar-sims.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Requested Role *</label>
                    <select
                      value={requestForm.role}
                      onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                    >
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Field Service Staff">Field Service Staff</option>
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Field Service Engineer">Field Service Engineer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Department</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={requestForm.department}
                        onChange={(e) => setRequestForm({ ...requestForm, department: e.target.value })}
                        placeholder="e.g. Operations"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Reason for Access / Project Ref</label>
                  <textarea
                    rows={2}
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    placeholder="e.g. Assigned to Rajasthan rooftop commissioning batches..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>

                <Button variant="primary" size="md" className="w-full justify-center mt-2" type="submit">
                  Submit for Admin Verification
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

