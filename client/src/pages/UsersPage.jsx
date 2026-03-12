import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'user' };

const UsersPage = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // ─── Modal Helpers ────────────────────────────────────────────────────────
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
      } else {
        const updateData = { name: form.name, email: form.email, role: form.role };
        if (form.password) updateData.password = form.password;
        await usersAPI.update(modal.user.id, updateData);
      }
      closeModal();
      fetchUsers(pagination.page, search);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (userId) => {
    try {
      await usersAPI.delete(userId);
      setDeleteConfirm(null);
      fetchUsers(pagination.page, search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">UserHub</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/users" className="nav-item active">
            <span className="nav-icon">👥</span>
            <span>Users</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{currentUser?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-email">{currentUser?.email}</div>
            </div>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">{pagination.total} total accounts</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add User
          </button>
        </header>

        {/* Search */}
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-secondary">Search</button>
          {search && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); fetchUsers(1, ''); }}>
              Clear
            </button>
          )}
        </form>

        {/* Error */}
        {error && <div className="alert alert-error"><span className="alert-icon">⚠</span>{error}</div>}

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">👤</div>
              <p>No users found.</p>
              <button className="btn btn-primary" onClick={openCreate}>Create First User</button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="text-muted">{u.id}</td>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{u.name[0].toUpperCase()}</div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role === 'admin' ? 'admin' : 'user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}>Edit</button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteConfirm(u)}
                          disabled={u.id === currentUser?.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-sm btn-outline"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1, search)}
            >
              ← Prev
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
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.mode === 'create' ? 'Create User' : 'Edit User'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              {formError && (
                <div className="alert alert-error"><span className="alert-icon">⚠</span>{formError}</div>
              )}
              <div className="form-group">
                <label htmlFor="modal-name">Full Name</label>
                <input id="modal-name" name="name" type="text" value={form.name} onChange={handleFormChange} required minLength={2} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label htmlFor="modal-email">Email</label>
                <input id="modal-email" name="email" type="email" value={form.email} onChange={handleFormChange} required placeholder="user@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="modal-password">
                  Password {modal.mode === 'edit' && <span className="text-muted">(leave blank to keep)</span>}
                </label>
                <input
                  id="modal-password"
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
                <label htmlFor="modal-role">Role</label>
                <select id="modal-role" name="role" value={form.role} onChange={handleFormChange}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="btn-spinner" /> : modal.mode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="delete-body">
              <div className="delete-icon">🗑️</div>
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
