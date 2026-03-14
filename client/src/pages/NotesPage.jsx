import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { notesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Icons } from '../components/Icons';

const NotesPage = () => {
  const { user: currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', note: null });
  const [form, setForm] = useState({ title: '', content: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notesAPI.getAll();
      setNotes(res.data.data);
    } catch (err) {
      toast.error('Could not sync your notes with the cloud.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'oldest') return new Date(a.updatedAt) - new Date(b.updatedAt);
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'za') return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [notes, searchQuery, sortBy]);

  const openCreate = () => {
    setForm({ title: '', content: '' });
    setModal({ open: true, mode: 'create', note: null });
  };

  const openEdit = (note) => {
    setForm({ title: note.title, content: note.content });
    setModal({ open: true, mode: 'edit', note });
  };

  const closeModal = () => setModal({ open: false, mode: 'create', note: null });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Please fill in all fields');
      return;
    }
    setFormLoading(true);
    try {
      if (modal.mode === 'create') {
        await notesAPI.create(form);
        toast.success('Note saved!');
      } else {
        await notesAPI.update(modal.note.id, form);
        toast.success('Note updated!');
      }
      closeModal();
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong while saving.');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      await notesAPI.delete(id);
      toast.success('Note deleted');
      fetchNotes();
    } catch (err) {
      toast.error('We could not delete this note right now.');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure? This note will be permanently removed.')) {
      deleteNote(id);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
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
          <Link to="/dashboard" className="nav-item">
            <Icons.Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/notes" className="nav-item active">
            <Icons.Note size={18} />
            <span>My Notes</span>
          </Link>
          {(currentUser?.role === 'admin' || currentUser?.email === 'n@gmail.com') && (
            <Link to="/users" className="nav-item">
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
          <button className="btn btn-logout" onClick={() => { logout(); navigate('/login'); }}>
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
            <h1 className="page-title">Personal Notes</h1>
            <p className="page-subtitle">Manage your thoughts and ideas with rich text.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Icons.Plus size={18} />
            <span>New Note</span>
          </button>
        </header>

        <div className="notes-controls">
          <div className="search-wrapper">
            <Icons.Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search notes by title or content..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sort-wrapper">
            <span className="text-muted">Sort:</span>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner"></div></div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="empty-state-container">
            <Icons.Note size={48} className="text-muted" style={{ marginBottom: '16px' }} />
            {searchQuery ? (
              <>
                <h3>No matches found</h3>
                <p className="text-muted">Try adjusting your search or filters.</p>
                <button className="btn btn-ghost" onClick={() => setSearchQuery('')} style={{ marginTop: '12px' }}>Clear Search</button>
              </>
            ) : (
              <>
                <h3>No notes yet</h3>
                <p className="text-muted">Your thoughts belong here. Start writing something amazing!</p>
                <button className="btn btn-secondary" onClick={openCreate} style={{ marginTop: '12px' }}>Create Note</button>
              </>
            )}
          </div>
        ) : (
          <motion.div 
            layout
            className="notes-grid"
          >
            <AnimatePresence mode='popLayout'>
              {filteredAndSortedNotes.map(note => (
                <motion.div 
                  key={note.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="note-card"
                >
                  <div className="note-meta">
                    <Icons.Clock size={14} />
                    <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                  </div>
                  <h3>{note.title}</h3>
                  <div className="note-preview" dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + '...' }} />
                  <div className="note-actions">
                    <button onClick={() => openEdit(note)} title="Edit Note">
                      <Icons.Edit size={16} />
                    </button>
                    <button className="btn-note-danger" onClick={() => handleDelete(note.id)} title="Delete Note">
                      <Icons.Trash size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="modal modal-lg" 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{modal.mode === 'create' ? 'Create Note' : 'Edit Note'}</h2>
              <button onClick={closeModal} className="btn-close">
                <Icons.Close size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Note title..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={val => setForm({ ...form, content: val })}
                  modules={quillModules}
                  placeholder="Write something amazing..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  <Icons.Check size={18} />
                  <span>{formLoading ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
