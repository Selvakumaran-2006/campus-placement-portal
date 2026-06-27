import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Search, Award, CheckCircle, XCircle, AlertTriangle, FileText, User as UserIcon, Send, Sparkles } from 'lucide-react';
import { User, Job, Application, StudentProfile } from '../types';

interface StudentDashboardProps {
  user: User;
  token: string;
  subTab: 'jobs' | 'applications' | 'profile';
  onProfileUpdate: (updatedUser: User) => void;
}

export default function StudentDashboard({ user, token, subTab, onProfileUpdate }: StudentDashboardProps) {
  // Common states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search/Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [cgpaEligibleOnly, setCgpaEligibleOnly] = useState(false);

  // Profile Edit states
  const sProfile = user.profile as StudentProfile || {
    rollNumber: '',
    department: '',
    batch: '2026',
    cgpa: 0,
    skills: [],
    contact: '',
    bio: '',
    resumeText: ''
  };

  const [rollNumber, setRollNumber] = useState(sProfile.rollNumber || '');
  const [department, setDepartment] = useState(sProfile.department || '');
  const [batch, setBatch] = useState(sProfile.batch || '2026');
  const [cgpa, setCgpa] = useState(sProfile.cgpa?.toString() || '0');
  const [contact, setContact] = useState(sProfile.contact || '');
  const [bio, setBio] = useState(sProfile.bio || '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(sProfile.skills || []);
  const [resumeText, setResumeText] = useState(sProfile.resumeText || '');

  // Fetch Jobs & Applications
  const fetchJobs = async () => {
    setLoading(true);
    try {
      let url = `/api/jobs?search=${encodeURIComponent(search)}&role=${encodeURIComponent(roleFilter)}&location=${encodeURIComponent(locationFilter)}`;
      if (jobTypeFilter) url += `&jobType=${jobTypeFilter}`;
      if (cgpaEligibleOnly && sProfile.cgpa) {
        url += `&minCgpa=${sProfile.cgpa}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setJobs(data);
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
    if (subTab === 'jobs') {
      fetchJobs();
    } else if (subTab === 'applications') {
      fetchApplications();
    }
  }, [subTab, search, roleFilter, locationFilter, jobTypeFilter, cgpaEligibleOnly]);

  // Handle Apply
  const handleApply = async (jobId: string) => {
    // Check profile completeness first
    if (!sProfile.rollNumber || !sProfile.department || !sProfile.cgpa) {
      setMessage({
        type: 'error',
        text: 'Please complete your roll number, department, and CGPA in your Profile tab before applying.'
      });
      return;
    }

    setActionLoading(jobId);
    setMessage(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply.');
      }

      setMessage({ type: 'success', text: 'Applied successfully in one click! Track your application in the tracking tab.' });
      fetchJobs(); // Update counts
      fetchApplications();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  // Remove Skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const updatedProfile: StudentProfile = {
      rollNumber,
      department,
      batch,
      cgpa: Number(cgpa) || 0,
      skills,
      contact,
      bio,
      resumeText
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
        throw new Error(data.error || 'Failed to update profile.');
      }

      onProfileUpdate(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully! You are now ready to apply to jobs.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Determine if student has already applied to a job
  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="student-dashboard">
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
            {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">{message.text}</p>
          </div>
        </div>
      )}

      {/* JOBS TAB */}
      {subTab === 'jobs' && (
        <div className="space-y-4">
          {/* Header & Filter Controls */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Explore Placements & Internships
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Search for opportunities posted by our registered placement recruiters.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search Bar */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search role, company or skills..."
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Location Selector */}
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="">All Locations</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Remote">Remote</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              {/* Job Type Selector */}
              <div className="relative">
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="">All Formats</option>
                  <option value="Full-time">Full-Time (Placement)</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Checkbox for eligibility */}
            {sProfile.cgpa ? (
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="eligible-only"
                  checked={cgpaEligibleOnly}
                  onChange={(e) => setCgpaEligibleOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 bg-white h-3.5 w-3.5 focus:ring-blue-500"
                />
                <label htmlFor="eligible-only" className="ml-2 text-[11px] font-semibold text-slate-500 select-none cursor-pointer">
                  Show only vacancies where I meet eligibility ({sProfile.cgpa} CGPA minimum)
                </label>
              </div>
            ) : null}
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="text-center py-8 text-slate-500 font-bold text-xs">Loading available jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-lg">
              <p className="text-slate-500 text-xs">No vacancies matching your search parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => {
                const applied = hasApplied(job.id);
                const cgpaDeficit = sProfile.cgpa && sProfile.cgpa < job.minCgpa;
                const matchesSkills = sProfile.skills?.some(skill => 
                  job.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
                );

                return (
                  <div 
                    key={job.id} 
                    className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row md:items-start md:justify-between gap-5"
                    id={`job-card-${job.id}`}
                  >
                    {/* Job Details */}
                    <div className="flex-1 space-y-2.5">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-sans font-extrabold text-sm text-slate-900 block leading-none">
                            {job.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                            {job.jobType}
                          </span>
                          {/* Eligibility Status Tag */}
                          {cgpaDeficit ? (
                            <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>CGPA Ineligible ({job.minCgpa}+)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold">
                              Eligible ({job.minCgpa}+ CGPA)
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors block mt-1.5">
                          {job.companyName}
                        </span>
                      </div>

                      {/* Icon stats */}
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
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-3.5 w-3.5 text-slate-400" />
                          <span>Min CGPA: <span className="text-slate-800 font-bold">{job.minCgpa}</span></span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                        {job.description}
                      </p>

                      {/* Requirements Tags */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Requirements:</span>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.map((req, i) => (
                            <span 
                              key={i} 
                              className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Pane */}
                    <div className="md:w-56 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 flex flex-col justify-between h-full space-y-3 shrink-0">
                      <div className="text-[11px] text-slate-500 space-y-1">
                        <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Quick Stats</span>
                        <div className="flex items-center justify-between">
                          <span>Applicants:</span>
                          <span className="font-bold text-slate-800">{job.applicantsCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Alignment:</span>
                          <span className={matchesSkills ? "text-blue-600 font-bold" : "text-slate-500"}>
                            {matchesSkills ? "Skills Match" : "General"}
                          </span>
                        </div>
                      </div>

                      {applied ? (
                        <div className="w-full bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs py-2 rounded text-center flex items-center justify-center space-x-1.5 shadow-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Applied</span>
                        </div>
                      ) : cgpaDeficit ? (
                        <div className="space-y-1">
                          <button
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs py-2 rounded text-center cursor-not-allowed"
                          >
                            Ineligible
                          </button>
                          <p className="text-[9px] text-rose-500 leading-normal text-center">
                            Min {job.minCgpa} CGPA required.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={actionLoading === job.id}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded shadow-sm transition-colors text-center flex items-center justify-center space-x-1"
                          id={`btn-apply-${job.id}`}
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>{actionLoading === job.id ? 'Applying...' : 'One-Click Apply'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TRACKING TAB */}
      {subTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Application Pipeline Tracker
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track real-time status updates of your submitted job applications.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-lg">
              <p className="text-slate-500 text-xs">You haven't applied for any jobs yet. Browse the job board to apply.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => {
                const statusColors = {
                  'Pending': 'border-amber-200 bg-amber-50 text-amber-700',
                  'Shortlisted': 'border-green-200 bg-green-50 text-green-700',
                  'Interview Scheduled': 'border-blue-200 bg-blue-50 text-blue-700',
                  'Rejected': 'border-rose-200 bg-rose-50 text-rose-700',
                  'Offered': 'border-purple-200 bg-purple-50 text-purple-700'
                };

                return (
                  <div 
                    key={app.id} 
                    className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow shadow-sm"
                    id={`app-card-${app.id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="text-sm font-extrabold text-slate-900">{app.jobTitle}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[app.status]}`}>
                            {app.status}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 block mt-1">{app.companyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 md:text-right font-mono">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Step Tracker Visual Line */}
                    <div className="mt-5 border-t border-slate-100 pt-3">
                      <div className="relative flex justify-between max-w-lg mx-auto py-2">
                        {/* Tracker Background Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 transform -translate-y-1/2 z-0"></div>
                        
                        {/* Steps */}
                        {['Pending', 'Shortlisted', 'Interview Scheduled', 'Offered'].map((step, idx) => {
                          const stepsOrder = ['Pending', 'Shortlisted', 'Interview Scheduled', 'Offered'];
                          const currentIdx = stepsOrder.indexOf(app.status);
                          const stepIdx = stepsOrder.indexOf(step);

                          let stepStyle = 'bg-white border-slate-200 text-slate-400';
                          if (app.status === 'Rejected' && stepIdx <= currentIdx) {
                            stepStyle = 'bg-rose-50 border-rose-200 text-rose-700';
                          } else if (stepIdx < currentIdx) {
                            stepStyle = 'bg-blue-600 border-blue-600 text-white';
                          } else if (stepIdx === currentIdx) {
                            stepStyle = 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100';
                          }

                          return (
                            <div key={step} className="flex flex-col items-center relative z-10">
                              <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${stepStyle}`}>
                                {idx + 1}
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1 font-bold max-w-[70px] text-center">
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback/Notes Block if present */}
                    {app.feedback && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Recruiter Feedback:</span>
                        <p className="text-xs text-blue-700 italic font-semibold">"{app.feedback}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STUDENT PROFILE BUILDER TAB */}
      {subTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-blue-600" />
                <span>Personal Profile & Credentials</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-4">
                Update your student academic data. Recruiters verify this information before shortlisting.
              </p>

              <form onSubmit={handleProfileSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      placeholder="CS22B1042"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Current Cumulative CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="8.80"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Department / Branch</label>
                    <select
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Contact Number</label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Short Bio / Overview</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief summary of your professional goals and tech stack focus..."
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 block">Resume Text (Raw Markdown/Text Builder)</label>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-semibold">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      <span>Used for One-Click Application</span>
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="EDUCATION&#10;- B.Tech in CSE (CGPA 8.8)&#10;&#10;EXPERIENCE&#10;- Summer Frontend Intern at TechOrg&#10;&#10;PROJECTS&#10;- MERN Portfolio Dashboard&#10;- Smart Campus Utility API"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs py-2 px-4 rounded uppercase tracking-wider transition-colors shadow-sm"
                  id="btn-update-profile"
                >
                  {loading ? 'Saving Updates...' : 'Update College Profile Data'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Skills Board */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-900 mb-0.5 uppercase tracking-wider">My Skill Badges</h3>
              <p className="text-[11px] text-slate-500 mb-3.5">
                Add standard tech keywords (e.g. React, Node, SQL) to align with recruiter search indexes.
              </p>

              <form onSubmit={handleAddSkill} className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. React"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1 rounded shadow-sm transition-colors"
                >
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-1">
                {skills.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">No skill tags added.</span>
                ) : (
                  skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-600 font-extrabold transition-colors text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Application Requirements Alert Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 space-y-2">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">One-Click Apply Guidelines</h4>
              <p className="text-[11px] text-blue-600 leading-normal font-medium">
                To trigger the One-Click apply pipeline, make sure your roll number, CGPA, and resume data are accurate. Recruiters can instantly read and score your resume. If you update your profile, previous applications will maintain the snapshot of your resume at the time of submission.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
