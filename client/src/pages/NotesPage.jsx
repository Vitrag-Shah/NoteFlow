import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { notesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';

const NotesPage = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', note: null });
  const [form, setForm] = useState({ title: '', content: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notesAPI.getAll();
      setNotes(res.data.data);
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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
        toast.success('Note created!');
      } else {
        await notesAPI.update(modal.note.id, form);
        toast.success('Note updated!');
      }
      closeModal();
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesAPI.delete(id);
      toast.success('Note deleted');
      fetchNotes();
    } catch (err) {
      toast.error('Delete failed');
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
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📝</span>
          <span className="brand-name">NoteFlow</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">🏠 Dashboard</Link>
          <Link to="/notes" className="nav-item active">📝 My Notes</Link>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-logout" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Personal Notes</h1>
            <p className="page-subtitle">Manage your thoughts and ideas with rich text.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Note</button>
        </header>

        <div className="notes-grid">
          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Start writing!</p>
              <button className="btn btn-secondary" onClick={openCreate}>Create Note</button>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="note-card">
                <h3>{note.title}</h3>
                <div className="note-preview" dangerouslySetInnerHTML={{ __html: note.content.substring(0, 100) + '...' }} />
                <div className="note-actions">
                  <button onClick={() => openEdit(note)}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDelete(note.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.mode === 'create' ? 'Create Note' : 'Edit Note'}</h2>
              <button onClick={closeModal}>✕</button>
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
                  {formLoading ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
