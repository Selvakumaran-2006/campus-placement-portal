import { LogOut, User as UserIcon, Briefcase, Award, PlusCircle, Users, GraduationCap } from 'lucide-react';
import { User, RecruiterProfile } from '../types';

interface NavbarProps {
  user: User | null;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({ user, currentTab, onTabChange, onLogout, onOpenAuth }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 h-14 flex items-center shrink-0">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('home')} 
          className="flex items-center space-x-2.5 cursor-pointer group"
          id="nav-logo"
        >
          <div className="bg-blue-600 p-1.5 rounded text-white group-hover:bg-blue-700 transition-colors">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-sans font-bold text-base tracking-tight text-slate-900 block leading-none">
              CampusPlacement <span className="text-blue-600 font-semibold">Pro</span>
            </span>
            <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase block mt-0.5">
              TNP Cell
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Dynamic based on Role) - Highly Dense Tab Styling */}
        <div className="hidden md:flex items-center space-x-1" id="nav-tabs">
          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <button
                    onClick={() => onTabChange('jobs')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'jobs' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-jobs"
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Job Board</span>
                  </button>
                  <button
                    onClick={() => onTabChange('applications')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'applications' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-applications"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>My Applications</span>
                  </button>
                  <button
                    onClick={() => onTabChange('profile')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'profile' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-profile"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>My Profile</span>
                  </button>
                </>
              )}

              {user.role === 'recruiter' && (
                <>
                  <button
                    onClick={() => onTabChange('recruiter-jobs')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'recruiter-jobs' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-recruiter-jobs"
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Job Postings</span>
                  </button>
                  <button
                    onClick={() => onTabChange('recruiter-applications')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'recruiter-applications' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-recruiter-apps"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Applicants</span>
                  </button>
                  <button
                    onClick={() => onTabChange('recruiter-post')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'recruiter-post' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-recruiter-post"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Post Job</span>
                  </button>
                  <button
                    onClick={() => onTabChange('profile')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'profile' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-recruiter-profile"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Company Profile</span>
                  </button>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => onTabChange('admin-dashboard')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'admin-dashboard' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-admin-dashboard"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Admin Stats</span>
                  </button>
                  <button
                    onClick={() => onTabChange('admin-students')}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentTab === 'admin-students' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    id="tab-admin-students"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Students DB</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => onTabChange('home')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                currentTab === 'home' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
          )}
        </div>

        {/* Action Button: User Profile Info / Login / Logout */}
        <div className="flex items-center space-x-4" id="nav-actions">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden lg:block text-right">
                <span className="text-xs font-bold text-slate-800 block">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase block leading-none">
                  {user.role === 'recruiter' 
                    ? (user.profile as RecruiterProfile)?.companyName || 'Recruiter'
                    : user.role}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-blue-600">
                {user.name.charAt(0)}
              </div>
              <div className="border-l border-slate-200 pl-3 flex items-center">
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Logout"
                  id="btn-logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded uppercase tracking-wider shadow-sm transition-all flex items-center space-x-1.5"
              id="btn-login-trigger"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
