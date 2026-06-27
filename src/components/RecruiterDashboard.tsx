import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Users, Award, FileText, CheckCircle2, XCircle, Clock, ExternalLink, MessageSquare, PlusCircle } from 'lucide-react';
import { User, Job, Application, RecruiterProfile } from '../types';

interface RecruiterDashboardProps {
  user: User;
  token: string;
  subTab: 'recruiter-jobs' | 'recruiter-applications' | 'recruiter-post' | 'profile';
  onProfileUpdate: (updatedUser: User) => void;
  onTabChange: (tab: string) => void;
}

export default function RecruiterDashboard({ user, token, subTab, onProfileUpdate, onTabChange }: RecruiterDashboardProps) {
  // Recruiter Profile state
  const rProfile = user.profile as RecruiterProfile || {
    companyName: '',
    designation: '',
    companyDescription: '',
    contact: '',
    website: ''
  };

  const [companyName, setCompanyName] = useState(rProfile.companyName || '');
  const [designation, setDesignation] = useState(rProfile.designation || '');
  const [companyDescription, setCompanyDescription] = useState(rProfile.companyDescription || '');
  const [contact, setContact] = useState(rProfile.contact || '');
  const [website, setWebsite] = useState(rProfile.website || '');

  // Post Job form states
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobSalaryNumeric, setJobSalaryNumeric] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobMinCgpa, setJobMinCgpa] = useState('7.0');
  const [jobType, setJobType] = useState<'Full-time' | 'Internship'>('Full-time');
  const [requirementInput, setRequirementInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);

  // DB data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Filter by recruiter jobs
      const response = await fetch('/api/jobs');
      const data = await response.json();
      if (response.ok) {
        // filter on client side for security validation matching token recruiterId
        const recJobs = data.filter((j: Job) => j.recruiterId === user.id);
        setJobs(recJobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  useEffect(() => {
    if (subTab === 'recruiter-jobs') {
      fetchJobs();
    } else if (subTab === 'recruiter-applications') {
      fetchApplications();
    }
  }, [subTab]);

  // Handle Post Job
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!rProfile.companyName) {
      setMessage({ type: 'error', text: 'Please complete your Company Name in the Profile tab before posting a vacancy.' });
      return;
    }

    if (requirements.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one requirement skill.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDesc,
          requirements,
          minCgpa: Number(jobMinCgpa) || 0,
          salary: jobSalary,
          salaryNumeric: Number(jobSalaryNumeric) || 0,
          location: jobLocation,
          jobType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post vacancy.');
      }

      setMessage({ type: 'success', text: `Vacancy for "${jobTitle}" posted successfully!` });
      // Reset form
      setJobTitle('');
      setJobDesc('');
      setJobSalary('');
      setJobSalaryNumeric('');
      setJobLocation('');
      setJobMinCgpa('7.0');
      setRequirements([]);
      onTabChange('recruiter-jobs');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const updatedProfile: RecruiterProfile = {
      companyName,
      designation,
      companyDescription,
      contact,
      website
    };

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update company profile.');
      }

      onProfileUpdate(data.user);
      setMessage({ type: 'success', text: 'Company profile details updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Update Application Status
  const handleUpdateStatus = async (appId: string, status: string) => {
    setActionLoading(appId);
    setMessage(null);

    const feedback = feedbackInput[appId] || '';

    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, feedback })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update application status.');
      }

      setMessage({ type: 'success', text: `Application status updated to "${status}" successfully!` });
      fetchApplications();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="recruiter-dashboard">
      {/* Messages */}
      {message && (
        <div 
          className={`mb-5 p-3.5 rounded border flex items-start space-x-2.5 shadow-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
          id="status-alert"
        >
          <div className="mt-0.5 shrink-0">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">{message.text}</p>
          </div>
        </div>
      )}

      {/* RECRUITER JOBS LISTING TAB */}
      {subTab === 'recruiter-jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Placement Vacancies</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage active vacancies posted on behalf of your company.</p>
            </div>
            <button
              onClick={() => onTabChange('recruiter-post')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded shadow-sm transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Job</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500 font-bold text-xs">Loading posted jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-lg">
              <p className="text-slate-500 text-xs mb-2">You haven't posted any jobs yet.</p>
              <button 
                onClick={() => onTabChange('recruiter-post')}
                className="text-blue-600 hover:text-blue-700 font-bold text-xs"
              >
                Post your first placement vacancy
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm" id={`posted-job-${job.id}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-extrabold text-slate-900">{job.title}</h3>
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                          {job.jobType}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold text-emerald-600">{job.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-3.5 w-3.5 text-slate-400" />
                          <span>Min CGPA: <span className="font-bold text-slate-800">{job.minCgpa}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => onTabChange('recruiter-applications')}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 transition-colors"
                      >
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>View Applicants ({job.applicantsCount || 0})</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3.5 border-t border-slate-100 pt-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICANTS MANAGEMENT TAB */}
      {subTab === 'recruiter-applications' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Placement Applicants</h1>
            <p className="text-xs text-slate-500 mt-0.5">Review student applications, read dynamic resume files, and schedule interview status.</p>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-lg">
              <p className="text-slate-500 text-xs">No students have applied to your active job vacancies yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm" id={`applicant-card-${app.id}`}>
                  {/* Student Header Summary */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 pb-3.5">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-extrabold text-slate-900">{app.studentName}</h3>
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] uppercase">
                          {app.studentDepartment}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                          CGPA: {app.studentCgpa}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono mt-1 block">Applied to role: <span className="text-slate-900 font-sans font-extrabold">{app.jobTitle}</span></span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Skills Display */}
                  <div className="my-2.5 flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xs font-bold text-slate-600">Skills Alignment:</span>
                    {app.studentSkills && app.studentSkills.length > 0 ? (
                      app.studentSkills.map(skill => (
                        <span key={skill} className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None specified</span>
                    )}
                  </div>

                  {/* Student Dynamic Resume */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-3.5 my-3">
                    <div className="flex items-center space-x-1.5 mb-2 border-b border-slate-200 pb-1.5 text-[11px] text-blue-700 font-bold">
                      <FileText className="h-3.5 w-3.5" />
                      <span>One-Click Student Resume Snapshot</span>
                    </div>
                    <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                      {app.resumeText}
                    </pre>
                  </div>

                  {/* Status controls with feedback box */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      <div className="w-full relative">
                        <MessageSquare className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={feedbackInput[app.id] || ''}
                          onChange={(e) => setFeedbackInput({ ...feedbackInput, [app.id]: e.target.value })}
                          placeholder="Add recruiter review notes or schedule details (e.g. Zoom Link)..."
                          className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>

                      <div className="flex items-center justify-end w-full sm:w-auto space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                          disabled={actionLoading === app.id}
                          className="px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'Interview Scheduled')}
                          disabled={actionLoading === app.id}
                          className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'Offered')}
                          disabled={actionLoading === app.id}
                          className="px-2.5 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 rounded text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Offer
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                          disabled={actionLoading === app.id}
                          className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    
                    {/* Display current status and notes */}
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>Current pipeline state:</span>
                      <span className="font-extrabold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase text-[10px]">
                        {app.status}
                      </span>
                      {app.feedback && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="italic text-blue-700 font-semibold">"{app.feedback}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POST JOB VACANCY TAB */}
      {subTab === 'recruiter-post' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span>Post Placement Opportunity</span>
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Your post will immediately be indexed on student dashboards. Update details carefully.
              </p>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Job Title / Role</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Associate Software Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Job Format</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as 'Full-time' | 'Internship')}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                  >
                    <option value="Full-time">Full-Time (Placement)</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Salary Package (Text)</label>
                  <input
                    type="text"
                    required
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    placeholder="e.g. 12 LPA or 80,000 / Month"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Salary (Numeric value for filters)</label>
                  <input
                    type="number"
                    required
                    value={jobSalaryNumeric}
                    onChange={(e) => setJobSalaryNumeric(e.target.value)}
                    placeholder="e.g. 12 or 9.6 (annual equivalent)"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Work Location</label>
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="Bangalore, India or Remote"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Eligibility: Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={jobMinCgpa}
                    onChange={(e) => setJobMinCgpa(e.target.value)}
                    placeholder="8.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Job Description & Responsibilities</label>
                <textarea
                  rows={3}
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Provide a detailed description of the role, team, and day-to-day responsibilities..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Requirements Chips */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Required Skills & Credentials</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    placeholder="e.g. Strong DS & Algo"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1 rounded shadow-sm transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {requirements.map((req) => (
                    <span 
                      key={req} 
                      className="inline-flex items-center space-x-1 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded"
                    >
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(req)}
                        className="hover:text-rose-600 font-extrabold transition-colors text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs py-2 px-4 rounded uppercase tracking-wider transition-colors shadow-sm"
                id="btn-submit-job"
              >
                {loading ? 'Posting Opportunity...' : 'Post Opportunity Immediately'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECRUITER COMPANY PROFILE TAB */}
      {subTab === 'profile' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span>Company Recruiter Credentials</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Complete your company profile so students can verify job legitimacy.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google India"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Your Official Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Senior Talent Acquisition"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Company Careers Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://careers.google.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Contact Desk Number</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Company Summary / Overview</label>
                <textarea
                  rows={3}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Provide an engaging summary of your company culture, technology focus, and growth prospects..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs py-2 px-4 rounded uppercase tracking-wider transition-colors shadow-sm"
                id="btn-update-recruiter"
              >
                {loading ? 'Saving Changes...' : 'Save Recruiter Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
