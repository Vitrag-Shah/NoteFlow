import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Icons } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'user' };

const UsersPage = () => {
  const { user: currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [modal, setModal] = useState({ open: false, mode: 'create', user: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    setError('');
    try {
      const res = await usersAPI.getAll({ page, limit: 10, search: q });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers(1, '');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ open: true, mode: 'create', user: null });
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setFormError('');
    setModal({ open: true, mode: 'edit', user });
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'create', user: null });
    setFormError('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (modal.mode === 'create') {
        await usersAPI.create(form);
        toast.success('User created successfully');
      } else {
        const updateData = { name: form.name, email: form.email, role: form.role };
        if (form.password) updateData.password = form.password;
        await usersAPI.update(modal.user.id, updateData);
        toast.success('User updated successfully');
      }
      closeModal();
      fetchUsers(pagination.page, search);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await usersAPI.delete(userId);
      toast.success('User deleted');
      setDeleteConfirm(null);
      fetchUsers(pagination.page, search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

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
          <Link to="/dashboard" className="nav-item">
            <Icons.Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/notes" className="nav-item">
            <Icons.Note size={18} />
            <span>My Notes</span>
          </Link>
          {currentUser?.role === 'admin' && (
            <Link to="/users" className="nav-item active">
              <Icons.User size={18} />
              <span>Users</span>
            </Link>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{currentUser?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-email">{currentUser?.email}</div>
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
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">{pagination.total} registered accounts across the platform.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Icons.Plus size={18} />
            <span>Add User</span>
          </button>
        </header>

        <form onSubmit={handleSearch} className="notes-controls">
          <div className="search-wrapper">
            <Icons.Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
          {search && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); fetchUsers(1, ''); }}>
              Clear
            </button>
          )}
        </form>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <Icons.Alert className="alert-icon" size={18} />
          {error}
        </div>}

        <div className="table-container">
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Fetching user directory…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="table-empty">
              <Icons.User className="empty-icon" size={48} />
              <p>No matches found for your search.</p>
              <button className="btn btn-primary" onClick={() => { setSearch(''); fetchUsers(1, ''); }}>Show All Users</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode='popLayout'>
                  {users.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">{u.name[0].toUpperCase()}</div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email} {u.id === currentUser?.id && '(You)'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${u.role === 'admin' ? 'admin' : 'user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-muted">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-sm btn-ghost" onClick={() => openEdit(u)}>
                             <Icons.Edit size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost btn-note-danger"
                            onClick={() => setDeleteConfirm(u)}
                            disabled={u.id === currentUser?.id}
                            title={u.id === currentUser?.id ? "You cannot delete yourself" : "Delete User"}
                          >
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '20px' }}>
            <button
              className="btn btn-sm btn-outline"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1, search)}
            >
              ← Previous
            </button>
            <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              className="btn btn-sm btn-outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1, search)}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* ─── Create / Edit Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modal.open && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{modal.mode === 'create' ? 'Create New Member' : 'Edit Member Profile'}</h2>
                <button className="modal-close" onClick={closeModal}><Icons.Close size={18} /></button>
              </div>
              <form onSubmit={handleFormSubmit} className="modal-form">
                {formError && (
                  <div className="alert alert-error" style={{ marginBottom: '10px' }}>
                     <Icons.Alert size={16} />
                     {formError}
                  </div>
                )}
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" type="text" value={form.name} onChange={handleFormChange} required minLength={2} placeholder="e.g. Alex Johnson" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input name="email" type="email" value={form.email} onChange={handleFormChange} required placeholder="alex@noteflow.com" />
                </div>
                <div className="form-group">
                  <label>
                    Password {modal.mode === 'edit' && <span className="text-muted">(leave blank to keep)</span>}
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleFormChange}
                    required={modal.mode === 'create'}
                    minLength={modal.mode === 'create' ? 6 : 0}
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={form.role} onChange={handleFormChange}>
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="modal-actions" style={{ marginTop: '12px' }}>
                  <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Processing...' : modal.mode === 'create' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirm Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal modal-sm" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Security Check</h2>
                <button className="modal-close" onClick={() => setDeleteConfirm(null)}><Icons.Close size={18} /></button>
              </div>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>
                   <Icons.Trash size={48} />
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Delete user account?</p>
                <p className="text-muted">You are about to delete <strong>{deleteConfirm.name}</strong>. This will remove all their data from NoteFlow.</p>
              </div>
              <div className="modal-actions" style={{ padding: '0 24px 24px' }}>
                <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Keep User</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersPage;
