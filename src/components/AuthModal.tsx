import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Building, Shield, FileText, X } from 'lucide-react';
import { User, UserRole, StudentProfile, RecruiterProfile } from '../types';

interface AuthModalProps {
  onAuthSuccess: (user: User, token: string) => void;
  onClose: () => void;
}

export default function AuthModal({ onAuthSuccess, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Additional Fields based on role for Signup
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    // Construct body
    const body: any = { email, password };
    if (!isLogin) {
      body.name = name;
      body.role = role;

      if (role === 'student') {
        body.profile = {
          rollNumber,
          department,
          batch: '2026',
          cgpa: Number(cgpa) || 0,
          skills: [],
          contact: '',
          bio: '',
          resumeText: ''
        } as StudentProfile;
      } else if (role === 'recruiter') {
        body.profile = {
          companyName,
          designation,
          companyDescription: '',
          contact: '',
          website: ''
        } as RecruiterProfile;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Information Technology',
    'Civil Engineering'
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white border border-slate-200 rounded-lg w-full max-w-md overflow-hidden shadow-lg relative animate-in fade-in zoom-in-95 duration-150"
        id="auth-modal-card"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1 rounded transition-colors cursor-pointer"
          id="btn-close-auth"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight" id="auth-title">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isLogin ? 'Access your placement portal account' : 'Register to get started with the portal'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3.5 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-bold text-center" id="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Toggle Role for Signup / Display for Info */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Portal Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-1.5 px-3 rounded border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      role === 'student'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                    id="btn-role-student"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`py-1.5 px-3 rounded border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      role === 'recruiter'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                    id="btn-role-recruiter"
                  >
                    <Building className="h-3.5 w-3.5" />
                    <span>Recruiter</span>
                  </button>
                </div>
              </div>
            )}

            {/* Common Fields */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded pl-8.5 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'student@college.edu' : 'recruiter@company.com'}
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-8.5 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-8.5 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Role-Specific Sign Up Fields */}
            {!isLogin && role === 'student' && (
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-150 mt-1.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="CS22B1001"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="8.5"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Department</label>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {!isLogin && role === 'recruiter' && (
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-150 mt-1.5">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2 text-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google India"
                      className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block">Your Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Technical Recruiter"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-2 rounded text-xs uppercase tracking-wider transition-all duration-150 mt-2.5 shadow-sm cursor-pointer"
              id="btn-auth-submit"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
              id="btn-toggle-auth-mode"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
