import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { notesAPI } from '../api/services';
import { Icons } from '../components/Icons';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [noteCount, setNoteCount] = useState(0);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await notesAPI.getAll();
        setNoteCount(res.data.data.length);
        setRecentNotes(res.data.data.slice(0, 3));
      } catch (err) {
        toast.error('We had trouble gathering your dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Total Notes', value: noteCount, icon: <Icons.Note />, color: 'indigo' },
    { label: 'Account Type', value: 'Free Plan', icon: <Icons.Star />, color: 'amber' },
    { label: 'Cloud Storage', value: 'Syncing', icon: <Icons.Cloud />, color: 'blue' },
    { label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently', icon: <Icons.Calendar />, color: 'purple' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Icons.Note className="brand-icon" size={24} />
          <span className="brand-name">NoteFlow</span>
          <button 
            className="btn btn-theme" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ marginLeft: 'auto', marginRight: '8px' }}
          >
            {theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
          </button>
          <button className="mobile-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <Icons.Close size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <Icons.Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/notes" className="nav-item">
            <Icons.Note size={18} />
            <span>My Notes</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/users" className="nav-item">
              <Icons.User size={18} />
              <span>Users</span>
            </Link>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>
            <Icons.Logout size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
            <Icons.Menu />
          </button>
          <div className="header-text">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, <strong>{user?.name}</strong>. It's {format(new Date(), 'EEEE, MMMM do')}.
            </p>
          </div>
          <Link to="/notes" className="btn btn-primary">
            <Icons.Plus size={16} />
            <span>New Note</span>
          </Link>
        </header>

        <motion.div 
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat) => (
            <motion.div 
              key={stat.label} 
              className={`stat-card stat-${stat.color}`}
              variants={itemVariants}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="dashboard-content-grid">
          <motion.section 
            className="profile-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="section-title">Recent Notes</h2>
            {loading ? (
              <div className="spinner-container"><div className="spinner"></div></div>
            ) : (
              <div className="recent-note-list">
                {recentNotes.length > 0 ? recentNotes.map(note => (
                  <Link to="/notes" key={note.id} className="recent-note-card">
                    <h4>{note.title}</h4>
                    <span>Updated {format(new Date(note.updatedAt), 'MMM d, h:mm a')}</span>
                  </Link>
                )) : <p className="text-muted">No notes yet. Create your first one!</p>}
                <Link to="/notes" className="link-more">See all notes →</Link>
              </div>
            )}
          </motion.section>

          <motion.section 
            className="profile-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="section-title">Your Profile</h2>
            <div className="profile-info-list" style={{ gap: '24px' }}>
              <div className="profile-item-visual">
                 <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem', marginBottom: '16px' }}>{user?.name?.[0]?.toUpperCase()}</div>
              </div>
              <div>
                <div className="field-label" style={{ marginBottom: '4px' }}>Full Name</div>
                <div className="field-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.name}</div>
              </div>
              <div>
                <div className="field-label" style={{ marginBottom: '4px' }}>Email Address</div>
                <div className="field-value" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
              <div>
                 <div className="field-label" style={{ marginBottom: '4px' }}>Status</div>
                 <div className="badge badge-user">Active</div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
