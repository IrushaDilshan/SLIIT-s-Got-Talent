import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function JudgeManagementPage() {
  const { token, user } = useAuth();
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newJudgeEmail, setNewJudgeEmail] = useState('');

  const fetchJudges = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get({ path: '/admin/users', token });
      setJudges(Array.isArray(data) ? data.filter(u => u.role === 'judge') : []);
    } catch (err) {
      setError(err.message || 'Error fetching judges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJudges();
  }, [token]);

  const handleDemote = async (id) => {
    if (!window.confirm('Remove judge privileges? They will become a student.')) return;
    try {
      await api.put({ path: `/admin/users/${id}/role`, token, body: { role: 'student' } });
      setJudges(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message || 'Error updating role');
    }
  };

  const handleCreateJudge = async (e) => {
    e.preventDefault();
    if (!newJudgeEmail) return;
    try {
      const u = await api.post({ path: '/admin/users/judge', token, body: { email: newJudgeEmail }});
      if (!judges.find(j => j._id === u._id)) {
        setJudges([u, ...judges]);
      }
      setNewJudgeEmail('');
      alert('Judge added successfully!');
    } catch(err) {
      alert(err.message || 'Error creating judge');
    }
  };

  const handleGenerateOtp = async (id) => {
    try {
      const res = await api.post({ path: `/admin/users/${id}/otp`, token });
      prompt('OTP generated for judge (valid for 24h). Copy this to share:', res.otp);
    } catch(err) {
      alert(err.message || 'Error generating OTP');
    }
  };

  const renderRow = (u) => (
    <div key={u._id} className="leaderboard-row" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 180px', gap: '10px', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px' }}>
      <div className="lb-details">
        <h4 style={{ margin: '0 0 5px 0' }}>{u.email}</h4>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID: {u._id}</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#a29bfe' }}>
          JUDGE
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={() => handleGenerateOtp(u._id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #0984e3', background: 'transparent', color: '#0984e3', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
          Generate Login OTP
        </button>
        <button onClick={() => handleDemote(u._id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #636e72', background: 'transparent', color: '#ff7675', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }} disabled={u._id === user?._id}>
          Revoke
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>Judge Management</h2>
          <p className="page-subtitle" style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Manage the judge panel members and access</p>
        </div>
        <button className="btn-ghost" onClick={fetchJudges} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Add New Judge</h3>
        <form onSubmit={handleCreateJudge} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="email" 
            placeholder="judge.email@sliit.lk" 
            value={newJudgeEmail} 
            onChange={(e) => setNewJudgeEmail(e.target.value)}
            style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }}
            required
            pattern=".*@(my\.)?sliit\.lk$"
            title="Must be a valid @sliit.lk or @my.sliit.lk email address"
          />
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            Create Judge
          </button>
        </form>
      </div>

      {error && <div style={{ color: '#ff7675', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading judges...</div>
      ) : (
        <>
          <div className="leaderboard-list">
            {judges.length ? judges.map(renderRow) : <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, color: 'var(--text-muted)' }}>No judges configured yet. Add one above.</div>}
          </div>
        </>
      )}
    </div>
  );
}

