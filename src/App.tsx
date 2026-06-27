import { useState, useEffect } from 'react';
import { User, PlacementStats } from './types';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import AdminDashboard from './components/AdminDashboard';
import { ShieldAlert, BookOpen } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState<PlacementStats | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    const storedToken = localStorage.getItem('edu_hire_token');
    
    const restoreSession = async (t: string) => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${t}`
          }
        });
        const data = await response.json();
        
        if (response.ok && data.user) {
          setUser(data.user);
          setToken(t);
          
          // Redirect to appropriate dashboard
          if (data.user.role === 'student') {
            setCurrentTab('jobs');
          } else if (data.user.role === 'recruiter') {
            setCurrentTab('recruiter-jobs');
          } else if (data.user.role === 'admin') {
            setCurrentTab('admin-dashboard');
          }
        } else {
          // Bad session token, purge it
          localStorage.removeItem('edu_hire_token');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setAppLoading(false);
      }
    };

    if (storedToken) {
      restoreSession(storedToken);
    } else {
      setAppLoading(false);
    }

    // Fetch platform stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch platform stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleAuthSuccess = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('edu_hire_token', newToken);

    // Dynamic redirect after login
    if (newUser.role === 'student') {
      setCurrentTab('jobs');
    } else if (newUser.role === 'recruiter') {
      setCurrentTab('recruiter-jobs');
    } else if (newUser.role === 'admin') {
      setCurrentTab('admin-dashboard');
    }
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edu_hire_token');
    setCurrentTab('home');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans text-xs text-slate-500">
        <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4"></div>
        <span className="font-bold tracking-tight">INITIALIZING CAMPUS PORTAL SERVICE...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      {/* Navigation */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentTab === 'home' && (
          <LandingPage stats={stats} onOpenAuth={() => setShowAuthModal(true)} />
        )}

        {/* STUDENT VIEWS */}
        {user && user.role === 'student' && (
          <>
            {currentTab === 'jobs' && (
              <StudentDashboard user={user} token={token!} subTab="jobs" onProfileUpdate={handleProfileUpdate} />
            )}
            {currentTab === 'applications' && (
              <StudentDashboard user={user} token={token!} subTab="applications" onProfileUpdate={handleProfileUpdate} />
            )}
            {currentTab === 'profile' && (
              <StudentDashboard user={user} token={token!} subTab="profile" onProfileUpdate={handleProfileUpdate} />
            )}
          </>
        )}

        {/* RECRUITER VIEWS */}
        {user && user.role === 'recruiter' && (
          <>
            {currentTab === 'recruiter-jobs' && (
              <RecruiterDashboard user={user} token={token!} subTab="recruiter-jobs" onProfileUpdate={handleProfileUpdate} onTabChange={setCurrentTab} />
            )}
            {currentTab === 'recruiter-applications' && (
              <RecruiterDashboard user={user} token={token!} subTab="recruiter-applications" onProfileUpdate={handleProfileUpdate} onTabChange={setCurrentTab} />
            )}
            {currentTab === 'recruiter-post' && (
              <RecruiterDashboard user={user} token={token!} subTab="recruiter-post" onProfileUpdate={handleProfileUpdate} onTabChange={setCurrentTab} />
            )}
            {currentTab === 'profile' && (
              <RecruiterDashboard user={user} token={token!} subTab="profile" onProfileUpdate={handleProfileUpdate} onTabChange={setCurrentTab} />
            )}
          </>
        )}

        {/* ADMIN VIEWS */}
        {user && user.role === 'admin' && (
          <>
            {currentTab === 'admin-dashboard' && (
              <AdminDashboard token={token!} subTab="admin-dashboard" />
            )}
            {currentTab === 'admin-students' && (
              <AdminDashboard token={token!} subTab="admin-students" />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© 2026 EduHire Placement Cell System. All rights reserved.</p>
          <div className="flex items-center justify-center space-x-4">
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Privacy Guidelines</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              TNP Manual
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
