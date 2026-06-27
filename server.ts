import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Job, Application, UserRole, StudentProfile, RecruiterProfile } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'campus_placement_secret_key_2026';
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Interface for Request with authenticated user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Ensure database file exists with initial mock data
function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data.users && data.jobs && data.applications) {
        return; // DB looks healthy
      }
    } catch (e) {
      console.error('Error reading db.json, reinitializing...', e);
    }
  }

  // Create initial data with bcrypt hashed passwords
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password', salt);

  const initialUsers: User[] = [
    {
      id: 'student_1',
      name: 'Aditya Kumar',
      email: 'student@college.edu',
      role: 'student',
      createdAt: new Date().toISOString(),
      profile: {
        rollNumber: 'CS22B1042',
        department: 'Computer Science & Engineering',
        batch: '2026',
        cgpa: 8.8,
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python'],
        contact: '+91 98765 43210',
        bio: 'Aspiring Full Stack Developer passionate about scalable web architectures and cloud technologies.',
        resumeText: 'EDUCATION\nB.Tech in CSE - CGPA: 8.8\n\nPROJECTS\n- E-Commerce Platform using MERN Stack\n- Real-time chat app using WebSockets\n\nEXPERIENCE\n- Software Developer Intern at TechCorp (3 Months)'
      } as StudentProfile
    },
    {
      id: 'student_2',
      name: 'Sneha Rao',
      email: 'student2@college.edu',
      role: 'student',
      createdAt: new Date().toISOString(),
      profile: {
        rollNumber: 'EC22B1102',
        department: 'Electronics & Communication',
        batch: '2026',
        cgpa: 7.9,
        skills: ['Embedded Systems', 'C++', 'IoT', 'Python', 'MATLAB'],
        contact: '+91 98765 12345',
        bio: 'Interested in IoT solutions and hardware-software co-design.',
        resumeText: 'EDUCATION\nB.Tech in ECE - CGPA: 7.9\n\nPROJECTS\n- Smart Agriculture IoT node\n- Digital Signal Processor prototype'
      } as StudentProfile
    },
    {
      id: 'recruiter_1',
      name: 'Sarah Jenkins',
      email: 'recruiter@google.com',
      role: 'recruiter',
      createdAt: new Date().toISOString(),
      profile: {
        companyName: 'Google',
        designation: 'Senior Talent Acquisition Specialist',
        companyDescription: 'Google LLC is a multinational technology company focusing on search, online advertising, cloud computing, computer software, quantum computing, and AI.',
        contact: '+1 (555) 019-2834',
        website: 'https://careers.google.com'
      } as RecruiterProfile
    },
    {
      id: 'recruiter_2',
      name: 'Michael Chen',
      email: 'recruiter@microsoft.com',
      role: 'recruiter',
      createdAt: new Date().toISOString(),
      profile: {
        companyName: 'Microsoft',
        designation: 'Lead University Recruiter',
        companyDescription: 'Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and services.',
        contact: '+1 (555) 012-3456',
        website: 'https://careers.microsoft.com'
      } as RecruiterProfile
    },
    {
      id: 'admin_1',
      name: 'Prof. Rajesh Sharma',
      email: 'placement@college.edu',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];

  // Map hashed passwords secretly
  const userPasswords: Record<string, string> = {
    'student_1': hashedPassword,
    'student_2': hashedPassword,
    'recruiter_1': hashedPassword,
    'recruiter_2': hashedPassword,
    'admin_1': hashedPassword
  };

  const initialJobs: Job[] = [
    {
      id: 'job_1',
      recruiterId: 'recruiter_1',
      companyName: 'Google',
      title: 'Associate Software Engineer',
      description: 'We are looking for entry-level Software Engineers to join our core infrastructure and services team. You will write high-performance code, build scalable APIs, and collaborate on product design.',
      requirements: ['Strong DS & Algo', 'Proficiency in C++, Java, or Python', 'Knowledge of cloud computing', 'Excellent communication skills'],
      minCgpa: 8.5,
      salary: '24 LPA',
      salaryNumeric: 24,
      location: 'Bangalore / Remote',
      jobType: 'Full-time',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      applicantsCount: 1
    },
    {
      id: 'job_2',
      recruiterId: 'recruiter_1',
      companyName: 'Google',
      title: 'Frontend Developer Intern',
      description: 'Join the Google UX team to craft beautiful, responsive user interfaces for Google Cloud products. You will work alongside UX designers and core engineers using React and TypeScript.',
      requirements: ['Expertise in HTML, CSS, React', 'Experience with Tailwind or similar systems', 'Good aesthetic sense'],
      minCgpa: 7.5,
      salary: '80,000 / Month',
      salaryNumeric: 9.6,
      location: 'Bangalore, India',
      jobType: 'Internship',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      applicantsCount: 1
    },
    {
      id: 'job_3',
      recruiterId: 'recruiter_2',
      companyName: 'Microsoft',
      title: 'Full Stack Engineer (Azure Team)',
      description: 'Help shape the future of cloud computing on Azure! As a Full Stack Engineer, you will build and maintain backend microservices and modern frontend portals.',
      requirements: ['Strong fundamentals in Web Development', 'Experience with TypeScript, C#, Node.js', 'Understanding of SQL/NoSQL databases'],
      minCgpa: 8.0,
      salary: '18 LPA',
      salaryNumeric: 18,
      location: 'Hyderabad, India',
      jobType: 'Full-time',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      applicantsCount: 0
    }
  ];

  const initialApplications: Application[] = [
    {
      id: 'app_1',
      jobId: 'job_1',
      studentId: 'student_1',
      studentName: 'Aditya Kumar',
      studentEmail: 'student@college.edu',
      studentCgpa: 8.8,
      studentDepartment: 'Computer Science & Engineering',
      studentSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python'],
      resumeText: 'EDUCATION\nB.Tech in CSE - CGPA: 8.8\n\nPROJECTS\n- E-Commerce Platform using MERN Stack\n- Real-time chat app using WebSockets\n\nEXPERIENCE\n- Software Developer Intern at TechCorp (3 Months)',
      status: 'Shortlisted',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      jobTitle: 'Associate Software Engineer',
      companyName: 'Google',
      feedback: 'Excellent DSA profile and solid previous internship experience. Shortlisted for technical round.'
    },
    {
      id: 'app_2',
      jobId: 'job_2',
      studentId: 'student_2',
      studentName: 'Sneha Rao',
      studentEmail: 'student2@college.edu',
      studentCgpa: 7.9,
      studentDepartment: 'Electronics & Communication',
      studentSkills: ['Embedded Systems', 'C++', 'IoT', 'Python', 'MATLAB'],
      resumeText: 'EDUCATION\nB.Tech in ECE - CGPA: 7.9\n\nPROJECTS\n- Smart Agriculture IoT node\n- Digital Signal Processor prototype',
      status: 'Pending',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      jobTitle: 'Frontend Developer Intern',
      companyName: 'Google'
    }
  ];

  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: initialUsers,
    passwords: userPasswords,
    jobs: initialJobs,
    applications: initialApplications
  }, null, 2));
}

// Helper DB CRUD actions
function readDb() {
  initDatabase();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// Auth Endpoints
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password, role, profile } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please enter all required fields' });
  }

  const db = readDb();
  if (db.users.some((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const userId = `user_${Date.now()}`;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: userId,
    name,
    email: email.toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
    profile: profile || (role === 'student' ? {
      rollNumber: '',
      department: '',
      batch: '2026',
      cgpa: 0,
      skills: [],
      contact: '',
      bio: '',
      resumeText: ''
    } as StudentProfile : {
      companyName: '',
      designation: '',
      companyDescription: '',
      contact: '',
      website: ''
    } as RecruiterProfile)
  };

  db.users.push(newUser);
  db.passwords[userId] = hashedPassword;
  writeDb(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(210).json({ user: newUser, token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password' });
  }

  const db = readDb();
  const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const passwordHash = db.passwords[user.id];
  if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDb();
  const user = db.users.find((u: User) => u.id === req.user?.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDb();
  const userIndex = db.users.findIndex((u: User) => u.id === req.user?.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update profile fields
  db.users[userIndex].profile = {
    ...db.users[userIndex].profile,
    ...req.body
  };

  writeDb(db);
  res.json({ user: db.users[userIndex] });
});

// Job Endpoints
app.get('/api/jobs', (req: Request, res: Response) => {
  const { search, role, location, minSalary, maxSalary, jobType, minCgpa } = req.query;
  const db = readDb();
  let filteredJobs = [...db.jobs];

  // Apply filters
  if (search) {
    const s = String(search).toLowerCase();
    filteredJobs = filteredJobs.filter(j => 
      j.title.toLowerCase().includes(s) || 
      j.companyName.toLowerCase().includes(s) || 
      j.description.toLowerCase().includes(s)
    );
  }

  if (role) {
    const r = String(role).toLowerCase();
    filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes(r));
  }

  if (location) {
    const l = String(location).toLowerCase();
    filteredJobs = filteredJobs.filter(j => j.location.toLowerCase().includes(l));
  }

  if (jobType) {
    filteredJobs = filteredJobs.filter(j => j.jobType === jobType);
  }

  if (minSalary) {
    filteredJobs = filteredJobs.filter(j => j.salaryNumeric >= Number(minSalary));
  }

  if (minCgpa) {
    filteredJobs = filteredJobs.filter(j => j.minCgpa <= Number(minCgpa));
  }

  // Sort by newest first
  filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(filteredJobs);
});

app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const db = readDb();
  const job = db.jobs.find((j: Job) => j.id === req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job vacancy not found' });
  }

  res.json(job);
});

app.post('/api/jobs', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'recruiter' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only recruiters or admins can post jobs' });
  }

  const { title, description, requirements, minCgpa, salary, salaryNumeric, location, jobType } = req.body;

  if (!title || !description || !salary || !location || !jobType) {
    return res.status(400).json({ error: 'Please provide all required job fields' });
  }

  const db = readDb();
  const user = db.users.find((u: User) => u.id === req.user?.id);
  const companyName = (user?.profile as RecruiterProfile)?.companyName || 'Recruiter Company';

  const newJob: Job = {
    id: `job_${Date.now()}`,
    recruiterId: req.user.id,
    companyName,
    title,
    description,
    requirements: Array.isArray(requirements) ? requirements : [requirements],
    minCgpa: Number(minCgpa) || 0,
    salary,
    salaryNumeric: Number(salaryNumeric) || 0,
    location,
    jobType,
    createdAt: new Date().toISOString(),
    applicantsCount: 0
  };

  db.jobs.push(newJob);
  writeDb(db);

  res.status(211).json(newJob);
});

// Applications Endpoints
app.post('/api/jobs/:id/apply', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ error: 'Only students can apply to jobs' });
  }

  const jobId = req.params.id;
  const db = readDb();

  const job = db.jobs.find((j: Job) => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Check if student already applied
  const alreadyApplied = db.applications.some((app: Application) => app.jobId === jobId && app.studentId === req.user?.id);
  if (alreadyApplied) {
    return res.status(400).json({ error: 'You have already applied for this job' });
  }

  const student = db.users.find((u: User) => u.id === req.user?.id);
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const sProfile = student.profile as StudentProfile;

  // Validation: Check CGPA
  if (sProfile && sProfile.cgpa < job.minCgpa) {
    return res.status(400).json({ 
      error: `Application rejected. Your CGPA (${sProfile.cgpa}) does not meet the minimum eligibility requirement of ${job.minCgpa} CGPA for this role.` 
    });
  }

  const newApplication: Application = {
    id: `app_${Date.now()}`,
    jobId,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentCgpa: sProfile?.cgpa || 0,
    studentDepartment: sProfile?.department || 'Not Specified',
    studentSkills: sProfile?.skills || [],
    resumeText: sProfile?.resumeText || 'No Resume Provided',
    status: 'Pending',
    appliedAt: new Date().toISOString(),
    jobTitle: job.title,
    companyName: job.companyName
  };

  db.applications.push(newApplication);

  // Increment applicants count
  const jobIndex = db.jobs.findIndex((j: Job) => j.id === jobId);
  if (jobIndex !== -1) {
    db.jobs[jobIndex].applicantsCount = (db.jobs[jobIndex].applicantsCount || 0) + 1;
  }

  writeDb(db);
  res.status(212).json(newApplication);
});

app.get('/api/applications', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDb();
  let results: Application[] = [];

  if (req.user?.role === 'student') {
    results = db.applications.filter((app: Application) => app.studentId === req.user?.id);
  } else if (req.user?.role === 'recruiter') {
    // Get jobs posted by this recruiter
    const recruiterJobs = db.jobs.filter((j: Job) => j.recruiterId === req.user?.id).map((j: Job) => j.id);
    results = db.applications.filter((app: Application) => recruiterJobs.includes(app.jobId));
  } else if (req.user?.role === 'admin') {
    results = db.applications;
  }

  // Sort by applied time (newest first)
  results.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  res.json(results);
});

app.put('/api/applications/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const { status, feedback } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Please provide application status' });
  }

  const db = readDb();
  const appIndex = db.applications.findIndex((app: Application) => app.id === req.params.id);

  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const application = db.applications[appIndex];

  // Verify authorization (only the recruiter who posted the job, or admin can edit)
  const job = db.jobs.find((j: Job) => j.id === application.jobId);
  if (req.user?.role !== 'admin' && (!job || job.recruiterId !== req.user?.id)) {
    return res.status(403).json({ error: 'Unauthorized to update this application' });
  }

  db.applications[appIndex].status = status;
  if (feedback !== undefined) {
    db.applications[appIndex].feedback = feedback;
  }

  writeDb(db);
  res.json(db.applications[appIndex]);
});

// Admin Stats Endpoint
app.get('/api/stats', (req: Request, res: Response) => {
  const db = readDb();
  const totalStudents = db.users.filter((u: User) => u.role === 'student').length;
  
  // Placed students: Students who have at least one application with status 'Offered' or placed in high standard.
  // Let's check status 'Offered'
  const offeredStudentsIds = new Set(
    db.applications
      .filter((app: Application) => app.status === 'Offered')
      .map((app: Application) => app.studentId)
  );
  const placedStudents = offeredStudentsIds.size;

  const totalCompanies = new Set(db.jobs.map((j: Job) => j.companyName.toLowerCase())).size;
  const totalJobs = db.jobs.length;

  // Compute average and highest packages
  let averagePackage = '8.5 LPA';
  let highestPackage = '12.0 LPA';

  if (db.jobs.length > 0) {
    const salaries = db.jobs.map((j: Job) => j.salaryNumeric).filter(Boolean);
    if (salaries.length > 0) {
      const maxSal = Math.max(...salaries);
      const avgSal = salaries.reduce((sum, val) => sum + val, 0) / salaries.length;
      highestPackage = `${maxSal.toFixed(1)} LPA`;
      averagePackage = `${avgSal.toFixed(1)} LPA`;
    }
  }

  res.json({
    totalStudents,
    placedStudents,
    totalCompanies: totalCompanies || 2, // backup fallback for display
    totalJobs,
    averagePackage,
    highestPackage
  });
});

// Admin Students Endpoint
app.get('/api/admin/students', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view students database' });
  }

  const db = readDb();
  const students = db.users.filter((u: User) => u.role === 'student');
  res.json(students);
});

// Start server function incorporating Vite middleware or production static folder
async function startServer() {
  initDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
