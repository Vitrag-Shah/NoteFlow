import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { notesAPI } from '../api/services';
import { Icons } from '../components/Icons';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, logout } = useAuth();
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
    { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: <Icons.Calendar />, color: 'purple' },
  ];

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Icons.Note className="brand-icon" size={24} />
          <span className="brand-name">NoteFlow</span>
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
            <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong>. You have {noteCount} notes.</p>
          </div>
          <Link to="/notes" className="btn btn-primary">
            <Icons.Plus size={16} />
            <span>New Note</span>
          </Link>
        </header>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-content-grid">
          <section className="profile-card">
            <h2 className="section-title">Recent Notes</h2>
            {loading ? <p>Loading...</p> : (
              <div className="recent-note-list">
                {recentNotes.length > 0 ? recentNotes.map(note => (
                  <div key={note.id} className="recent-note-card">
                    <h4>{note.title}</h4>
                    <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                )) : <p className="text-muted">No notes yet. Create your first one!</p>}
                <Link to="/notes" className="link-more">See all notes →</Link>
              </div>
            )}
          </section>

          <section className="profile-card">
            <h2 className="section-title">Your Profile</h2>
            <div className="profile-info-list">
              <div>
                <div className="field-label">Name</div>
                <div className="field-value">{user?.name}</div>
              </div>
              <div>
                <div className="field-label">Email</div>
                <div className="field-value">{user?.email}</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
