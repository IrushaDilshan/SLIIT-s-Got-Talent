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
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
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

      {/* Alert Messages */}
      {msg.text && (
        <div style={msg.type === 'error' ? styles.alertError : styles.alertSuccess}>
           {msg.type === 'success' ? '✅ ' : '⚠️ '} {msg.text}
        </div>
      )}

      {/* Main Countdown Card */}
      <div style={styles.card}>
        <form onSubmit={handleSaveCountdown} style={styles.countdownForm}>      
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={styles.inputLabel}>End Date & Time</label>
            <div style={styles.inputWrapper}>
              <input
                type="datetime-local"
                value={countdownEnd}
                onChange={(e) => setCountdownEnd(e.target.value)}
                style={styles.inputField}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" disabled={saving || loading} style={styles.actionBtn}>   
              {saving ? 'Saving...' : 'Save Timer'}
            </button>
            <button
              type="button"
              onClick={() => {
                if(window.confirm('Clear the active countdown timer?')) {
                    setCountdownEnd('');
                    saveSettings('');
                }
              }}
              style={styles.clearBtn}
              disabled={saving || !countdownEnd || loading}
            >
              Clear Timer
            </button>
          </div>
        </form>
      </div>
      
      {/* Required tiny CSS reset for browser calendar picker icon */}
      <style>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.6;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { marginBottom: '2.5rem' },
  pageTitle: { fontSize: '2.2rem', fontWeight: '800', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #d946ef, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' },
  pageSubtitle: { fontSize: '1rem', color: '#94a3b8', margin: 0 },
  
  card: { 
      backgroundColor: 'rgba(15, 15, 23, 0.6)', 
      border: '1px solid rgba(255, 255, 255, 0.05)', 
      borderRadius: '16px', 
      padding: '36px 40px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)'
  },
  
  countdownForm: { display: 'flex', flexDirection: 'column' },
  
  inputLabel: { display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '1rem', letterSpacing: '0.5px' },
  
  inputWrapper: { position: 'relative', width: '100%' },
  
  inputField: { 
      width: '100%',
      padding: '16px 20px', 
      backgroundColor: 'rgba(30, 41, 59, 0.4)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '8px', 
      color: '#fff', 
      fontSize: '1.05rem', 
      outline: 'none', 
      boxSizing: 'border-box',
      fontFamily: 'monospace',
      transition: 'border-color 0.2s, background-color 0.2s'
  },
  
  actionBtn: { 
      padding: '12px 30px', 
      backgroundColor: '#38bdf8', 
      color: '#0f172a', 
      border: 'none', 
      borderRadius: '8px', 
      fontSize: '1rem', 
      fontWeight: '600', 
      cursor: 'pointer',
      transition: 'opacity 0.2s'
  },
  
  clearBtn: { 
      padding: '12px 24px', 
      backgroundColor: 'transparent', 
      color: '#94a3b8', 
      border: '1px solid rgba(148, 163, 184, 0.3)', 
      borderRadius: '8px', 
      fontSize: '1rem', 
      fontWeight: '500', 
      cursor: 'pointer',
      transition: 'background-color 0.2s, color 0.2s'
  },
  
  alertSuccess: { margin: '0 0 1.5rem 0', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#34d399', borderRadius: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center' },
  alertError: { margin: '0 0 1.5rem 0', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center' }
};
