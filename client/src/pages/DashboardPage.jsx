import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { notesAPI } from '../api/services';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [noteCount, setNoteCount] = useState(0);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await notesAPI.getAll();
        setNoteCount(res.data.data.length);
        setRecentNotes(res.data.data.slice(0, 3));
      } catch (err) {
        toast.error('Could not load dashboard data');
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
    { label: 'Total Notes', value: noteCount, icon: '📝', color: 'indigo' },
    { label: 'Account Type', value: 'Free Plan', icon: '⭐', color: 'amber' },
    { label: 'Cloud Storage', value: 'Syncing', icon: '☁️', color: 'blue' },
    { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: '📅', color: 'purple' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📝</span>
          <span className="brand-name">NoteFlow</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">🏠 Dashboard</Link>
          <Link to="/notes" className="nav-item">📝 My Notes</Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong>. You have {noteCount} notes.</p>
          </div>
          <Link to="/notes" className="btn btn-primary">Create New Note →</Link>
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

        <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          <section className="profile-card">
            <h2 className="section-title">Recent Notes</h2>
            {loading ? <p>Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentNotes.length > 0 ? recentNotes.map(note => (
                  <div key={note.id} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: 0 }}>{note.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                )) : <p className="text-muted">No notes yet. Create your first one!</p>}
                <Link to="/notes" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>See all notes →</Link>
              </div>
            )}
          </section>

          <section className="profile-card">
            <h2 className="section-title">Your Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
