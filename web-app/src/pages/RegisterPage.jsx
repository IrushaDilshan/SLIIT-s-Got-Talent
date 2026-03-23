import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    universityId: '',
    talentType: '',
    videoUrl: '',
    bio: ''
  });
  const [categories, setCategories] = useState(['Singing', 'Dancing', 'Band', 'Magic/Other']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get({ path: '/settings' });
        if (data && data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setFormData(prev => ({ ...prev, talentType: data.categories[0] }));
        } else {
          setFormData(prev => ({ ...prev, talentType: 'Singing' }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setFormData(prev => ({ ...prev, talentType: 'Singing' }));
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post({ path: '/contestants', body: formData });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--primary)' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Thank you for registering. Your application is under review. We will get back to you soon.
          </p>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: '20px', cursor: 'pointer', color: 'var(--text-muted)', alignSelf: 'flex-start' }} onClick={() => navigate(-1)}>
        &larr; Back
      </div>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>Talent Registration</h2>
        {error && <div style={styles.errorBanner}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>FULL NAME</label>
            <input name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>STUDENT ID</label>
            <input name="universityId" value={formData.universityId} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>CATEGORY</label>
            <select name="talentType" value={formData.talentType} onChange={handleChange} style={{ ...styles.input, color: '#fff', backgroundColor: '#1a1a24' }}>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>VIDEO LINK (YouTube/Drive)</label>
            <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>SHORT BIO</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" style={styles.input}></textarea>
          </div>
          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'var(--bg-dark)',
    fontFamily: "'Sora', sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '30px',
    backdropFilter: 'blur(20px)'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.2)',
    color: '#fff',
    outline: 'none',
    fontSize: '1rem'
  },
  primaryBtn: {
    padding: '14px',
    borderRadius: '8px',
    background: 'var(--gradient-1)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px'
  },
  backBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  }
};
