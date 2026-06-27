export type UserRole = 'student' | 'recruiter' | 'admin';

export interface StudentProfile {
  rollNumber: string;
  department: string;
  batch: string;
  cgpa: number;
  skills: string[];
  contact: string;
  bio: string;
  resumeText: string;
}

export interface RecruiterProfile {
  companyName: string;
  designation: string;
  companyDescription: string;
  contact: string;
  website: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile?: StudentProfile | RecruiterProfile;
  createdAt: string;
}

export interface Job {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string[];
  minCgpa: number;
  salary: string; // e.g. "12 LPA", "80,000 / Year"
  salaryNumeric: number; // for filtering
  location: string;
  jobType: 'Full-time' | 'Internship' | 'Contract' | 'Part-time';
  createdAt: string;
  applicantsCount: number;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCgpa: number;
  studentDepartment: string;
  studentSkills: string[];
  resumeText: string;
  status: 'Pending' | 'Shortlisted' | 'Interview Scheduled' | 'Rejected' | 'Offered';
  appliedAt: string;
  feedback?: string;
  jobTitle: string;
  companyName: string;
}

export interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  totalCompanies: number;
  totalJobs: number;
  averagePackage: string;
  highestPackage: string;
}
