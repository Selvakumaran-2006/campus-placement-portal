import { useState, useEffect } from 'react';
import { Users, Briefcase, Award, GraduationCap, Percent, TrendingUp, Search, Download, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { User, PlacementStats, StudentProfile } from '../types';

interface AdminDashboardProps {
  token: string;
  subTab: 'admin-dashboard' | 'admin-students';
}

export default function AdminDashboard({ token, subTab }: AdminDashboardProps) {
  const [stats, setStats] = useState<PlacementStats | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (subTab === 'admin-students') {
      fetchStudents();
    }
  }, [subTab]);

  // Filter students
  const filteredStudents = students.filter(s => {
    const sProfile = s.profile as StudentProfile;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          (sProfile?.rollNumber && sProfile.rollNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = !deptFilter || (sProfile?.department && sProfile.department === deptFilter);
    return matchesSearch && matchesDept;
  });

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Information Technology',
    'Civil Engineering'
  ];

  const placementPercentage = stats && stats.totalStudents > 0
    ? Math.round((stats.placedStudents / stats.totalStudents) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="admin-dashboard">
      
      {/* STATS OVERVIEW TAB */}
      {subTab === 'admin-dashboard' && (
        <div className="space-y-6">
          {/* Welcome Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-blue-600 font-extrabold mb-0.5">
                <ShieldCheck className="h-4.5 w-4.5" />
                <span className="text-[10px] uppercase tracking-wider">TNP Officer Dashboard</span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Placement Cell Analytics</h1>
              <p className="text-xs text-slate-500 mt-0.5">Track institutional performance, recruitment rates, and academic placements.</p>
            </div>
          </div>

          {/* Stats Grid */}
          {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between text-blue-600">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total UG Students</span>
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">{stats.totalStudents}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Registered for 2026 Batch</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between text-blue-600">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Placed Count</span>
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">{stats.placedStudents}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Students with offers</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between text-blue-600">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Placement Rate</span>
                  <Percent className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">{placementPercentage}%</h3>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${placementPercentage}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between text-blue-600">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Highest Offer</span>
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-emerald-600 tracking-tight font-sans">{stats.highestPackage}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Average: <span className="font-semibold text-slate-800">{stats.averagePackage}</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-bold text-xs">Loading metrics...</div>
          )}

          {/* Detailed distribution cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recruiters Directory */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span>Active Recruitment Partners</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Top companies currently conducting active campus drives on campus.
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Google India', openings: '2 Job Vacancies', level: 'Premium partner' },
                  { name: 'Microsoft Azure', openings: '1 Job Vacancy', level: 'Premium partner' },
                  { name: 'Infosys Tech', openings: '0 Job Vacancies', level: 'Mass recruiter' }
                ].map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded">
                    <div>
                      <span className="text-xs font-bold text-slate-850 block">{rec.name}</span>
                      <span className="text-[11px] text-slate-500 block">{rec.openings}</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {rec.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Placements summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Departmental Statistics</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Live placement percentage tracking across different UG branches.
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Computer Science & Engineering', rate: 92 },
                  { name: 'Electronics & Communication', rate: 84 },
                  { name: 'Information Technology', rate: 88 },
                  { name: 'Mechanical Engineering', rate: 65 }
                ].map((dept, idx) => (
                  <div key={idx} className="space-y-1 bg-slate-50 border border-slate-100 p-2.5 rounded">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">{dept.name}</span>
                      <span className="font-extrabold text-blue-600">{dept.rate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${dept.rate}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS DB SEARCH TAB */}
      {subTab === 'admin-students' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Student Academic Database</h1>
            <p className="text-xs text-slate-500 mt-0.5">Monitor all registered students, review CGPA records, and download reports.</p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, roll number, email..."
                className="w-full bg-slate-50 border border-slate-200 rounded pl-8.5 pr-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 items-center">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students list */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-bold text-xs">Loading student directory...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-500 font-bold">No students found matching your search criteria.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none">
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5">Roll Number</th>
                    <th className="px-4 py-2.5">Department / Branch</th>
                    <th className="px-4 py-2.5 text-center">CGPA</th>
                    <th className="px-4 py-2.5">Skills Added</th>
                    <th className="px-4 py-2.5">Contact Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const profile = student.profile as StudentProfile;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div>
                            <span className="block">{student.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center mt-0.5">
                              <Mail className="h-3 w-3 mr-1 text-slate-400" />
                              {student.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-blue-600 font-bold">{profile?.rollNumber || 'Not set'}</td>
                        <td className="px-4 py-3 text-slate-650">{profile?.department || 'Not set'}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900 font-mono bg-blue-50/60">{profile?.cgpa || '0'}</td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {profile?.skills && profile.skills.length > 0 ? (
                              profile.skills.map(s => (
                                <span key={s} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] border border-slate-200/50 font-medium">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {profile?.contact || 'No contact provided'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
