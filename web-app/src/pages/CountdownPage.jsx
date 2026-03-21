import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function CountdownPage() {
  const { token } = useAuth();
  const [countdownEnd, setCountdownEnd] = useState('');
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
      if (data && data.countdownEnd) {
        const d = new Date(data.countdownEnd);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setCountdownEnd(d.toISOString().slice(0, 16));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(newCountdown) {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put({
        path: '/settings',
        token,
        body: { countdownEnd: newCountdown ? new Date(newCountdown).toISOString() : null }
      });
      setMsg({ type: 'success', text: 'Countdown updated successfully!' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  }

  const handleSaveCountdown = (e) => {
    e.preventDefault();
    saveSettings(countdownEnd);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Voting Countdown</h2>
          <p style={styles.pageSubtitle}>Set the end date and time for the live voting session</p>
        </div>
      </header>

      {msg.text && (
        <div style={msg.type === 'error' ? styles.alertError : styles.alertSuccess}>
          {msg.text}
        </div>
      )}

      <div style={styles.card}>
        <form onSubmit={handleSaveCountdown} style={styles.countdownForm}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={styles.inputLabel}>End Date & Time</label>
            <input 
              type="datetime-local" 
              value={countdownEnd} 
              onChange={(e) => setCountdownEnd(e.target.value)} 
              style={styles.inputField} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={saving} style={styles.actionBtn}>
              Save Timer
            </button>
            <button 
              type="button" 
              onClick={() => {
                setCountdownEnd('');
                saveSettings('');
              }} 
              style={styles.clearBtn}
              disabled={saving || !countdownEnd}
            >
              Clear Timer
            </button>
          </div>
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
  card: { backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  countdownForm: { display: 'flex', flexDirection: 'column' },
  inputLabel: { display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '0.75rem' },
  inputField: { padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  actionBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  clearBtn: { padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer' },
  alertSuccess: { margin: '0 0 1rem 0', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#6ee7b7', borderRadius: '8px', fontSize: '0.85rem' },
  alertError: { margin: '0 0 1rem 0', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '0.85rem' }
};
