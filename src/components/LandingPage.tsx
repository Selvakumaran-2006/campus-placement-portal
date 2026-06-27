import { GraduationCap, Briefcase, Award, ArrowRight, ShieldCheck, CheckCircle, Sparkles, Star, Target, Zap } from 'lucide-react';
import { PlacementStats } from '../types';

interface LandingPageProps {
  stats: PlacementStats | null;
  onOpenAuth: () => void;
}

export default function LandingPage({ stats, onOpenAuth }: LandingPageProps) {
  const defaultStats = stats || {
    totalStudents: 154,
    placedStudents: 121,
    totalCompanies: 24,
    totalJobs: 48,
    averagePackage: '8.8 LPA',
    highestPackage: '32.0 LPA'
  };

  const steps = [
    {
      icon: <Target className="h-4.5 w-4.5 text-blue-600" />,
      title: "1. Build Your Profile",
      desc: "Fill in your department, branch, CGPA, contact details, and construct a highly dense plain-text resume snapshot."
    },
    {
      icon: <Zap className="h-4.5 w-4.5 text-blue-600" />,
      title: "2. Explore Active Drives",
      desc: "Instantly browse jobs. Precision filters will highlight placement drives matching your CGPA and branch eligibility."
    },
    {
      icon: <Sparkles className="h-4.5 w-4.5 text-blue-600" />,
      title: "3. One-Click Apply",
      desc: "Apply instantly in one single click! We package your college credentials and resume snapshot straight to recruiter dashboards."
    },
    {
      icon: <Award className="h-4.5 w-4.5 text-blue-600" />,
      title: "4. Real-Time Tracking",
      desc: "Track candidate process status: Applied, Pending, Shortlisted, Interview Scheduled, and Recruiter Offers."
    }
  ];

  return (
    <div className="space-y-12 py-10" id="landing-page">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full animate-pulse" id="hero-announcement">
          <Star className="h-3.5 w-3.5 text-blue-600 fill-blue-600/10" />
          <span className="text-[10px] font-bold text-blue-700 tracking-wider uppercase">
            Campus Placement & Internship Drive 2026 Live
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight" id="hero-title">
          The Intelligent Placement Cell for <span className="text-blue-600">Ambitious Colleges</span>
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed" id="hero-subtitle">
          Bridging the gap between students, recruiters, and the college placement cell. Post job postings, build professional portfolios, and track pipeline status milestones with high density.
        </p>

        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={onOpenAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded uppercase tracking-wider shadow-sm hover:shadow transition-all flex items-center space-x-2"
            id="btn-hero-start"
          >
            <span>Enter Placement Portal</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="bg-white border-y border-slate-200 py-6" id="landing-stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Placed</span>
            <span className="text-2xl font-extrabold text-slate-800 block font-sans">
              {defaultStats.placedStudents} +
            </span>
          </div>

          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average CTC</span>
            <span className="text-2xl font-extrabold text-emerald-600 block font-sans">
              {defaultStats.averagePackage}
            </span>
          </div>

          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Highest CTC Offer</span>
            <span className="text-2xl font-extrabold text-slate-800 block font-sans">
              {defaultStats.highestPackage}
            </span>
          </div>

          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Recruiting Partners</span>
            <span className="text-2xl font-extrabold text-blue-600 block font-sans">
              {defaultStats.totalCompanies} +
            </span>
          </div>
        </div>
      </div>

      {/* Steps Visual Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="landing-workflow">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">How the Platform Streamlines Hiring</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our portal organizes the recruitment pipeline into four transparent stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2.5 hover:border-slate-300 transition-colors"
            >
              <div className="bg-blue-50 border border-blue-100 p-1.5 rounded w-max">
                {step.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-xs">{step.title}</h3>
              <p className="text-[11px] text-slate-500 leading-normal">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="landing-cta">
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-6 text-center space-y-3.5 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Ready to Accelerate Campus Placement Pipeline?
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Create your profile or access your partner recruiter dashboard to post opportunities and review applicant portfolios instantly.
          </p>
          <div className="pt-1">
            <button
              onClick={onOpenAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded uppercase tracking-wider shadow-sm transition-colors inline-flex items-center space-x-1.5"
              id="btn-cta-start"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
