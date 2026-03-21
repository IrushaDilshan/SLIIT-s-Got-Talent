import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await api.get({ path: '/settings', token });
      if (data) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(newCats) {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put({
        path: '/settings',
        token,
        body: { categories: newCats }
      });
      setMsg({ type: 'success', text: 'Categories updated successfully!' });
      setCategories(newCats);
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      setMsg({ type: 'error', text: 'Category already exists' });
      return;
    }
    const updated = [...categories, newCategory.trim()];
    saveSettings(updated);
    setNewCategory('');
  };

  const handleRemoveCategory = (cat) => {
    if (!window.confirm(`Remove category "${cat}"?`)) return;
    const updated = categories.filter((c) => c !== cat);
    saveSettings(updated);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Categories</h2>
          <p style={styles.pageSubtitle}>Manage talent categories for contestants</p>
        </div>
      </header>

      {msg.text && (
        <div style={msg.type === 'error' ? styles.alertError : styles.alertSuccess}>
          {msg.text}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.categoryList}>
          {loading ? <p>Loading...</p> : categories.map((cat, i) => (
            <div key={i} style={styles.categoryItem}>
              <span>{cat}</span>
              <button type="button" style={styles.removeBtn} onClick={() => handleRemoveCategory(cat)}>✕</button>
            </div>
          ))}
          {categories.length === 0 && !loading && (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No categories configured.</p>
          )}
        </div>

        <form onSubmit={handleAddCategory} style={styles.addCategoryForm}>
          <input 
            type="text" 
            placeholder="New Category..." 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)} 
            style={styles.inputField} 
          />
          <button type="submit" disabled={saving || !newCategory.trim()} style={styles.actionBtn}>
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '1rem', color: '#fff', fontFamily: 'Inter, sans-serif' },
  header: { marginBottom: '2.5rem' },
  pageTitle: { fontSize: '2rem', fontWeight: '800', margin: '0 0 0.25rem 0', background: 'linear-gradient(to right, #e879f9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' },
  pageSubtitle: { fontSize: '0.95rem', color: '#94a3b8', margin: 0 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  categoryList: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', minHeight: '40px' },
  categoryItem: { backgroundColor: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#d8b4fe', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  removeBtn: { background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem', padding: 0, marginLeft: '0.25rem' },
  addCategoryForm: { display: 'flex', gap: '0.75rem' },
  inputField: { flex: 1, padding: '0.75rem 1rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  actionBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  alertSuccess: { margin: '0 0 1rem 0', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#6ee7b7', borderRadius: '8px', fontSize: '0.85rem' },
  alertError: { margin: '0 0 1rem 0', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '0.85rem' }
};
