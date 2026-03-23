import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function ManagePage() {
  const { token, user } = useAuth();
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContestants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get({ path: '/contestants/admin', token });
      setContestants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error fetching contestants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchContestants();
  }, [token]);

  const handleAction = async (id, status) => {
    try {
      await api.put({ path: `/contestants/${id}`, token, body: { status } });
      setContestants(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.del({ path: `/contestants/${id}`, token });
      setContestants(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message || 'Error deleting contestant');
    }
  };

  const pending = contestants.filter(c => (c.status || '').toLowerCase() === 'pending' || !c.status);
  const others = contestants.filter(c => (c.status || '').toLowerCase() !== 'pending' && c.status);

  const renderRow = (c) => (
    <div key={c._id} className="leaderboard-row" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px', gap: '10px', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px' }}>
      <div className="lb-details">
        <h4 style={{ margin: '0 0 5px 0' }}>{c.name} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({c.universityId})</span></h4>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.talentType}</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: (c.status || '').toLowerCase() === 'approved' ? '#2ecc71' : (c.status || '').toLowerCase() === 'rejected' ? '#ff7675' : '#fdcb6e' }}>
          {(c.status || 'pending').toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {(c.status || '').toLowerCase() !== 'approved' && (
          <button onClick={() => handleAction(c._id, 'approved')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#2ecc71', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
            Approve
          </button>
        )}
        {(c.status || '').toLowerCase() !== 'rejected' && (
          <button onClick={() => handleAction(c._id, 'rejected')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ff7675', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
            Reject
          </button>
        )}
        <button onClick={() => handleDelete(c._id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #636e72', background: 'transparent', color: '#b2bec3', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
          Del
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>Management</h2>
          <p className="page-subtitle" style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Admin Panel</p>
        </div>
        <button className="btn-ghost" onClick={fetchContestants} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {error && <div style={{ color: '#ff7675', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading contestants...</div>
      ) : (
        <>
          <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>Pending Approvals ({pending.length})</h3>
          <div className="leaderboard-list" style={{ marginBottom: '40px' }}>
            {pending.length ? pending.map(renderRow) : <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, color: 'var(--text-muted)' }}>No pending requests</div>}
          </div>
          
          <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>All Contestants</h3>
          <div className="leaderboard-list">
            {others.length ? others.map(renderRow) : <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, color: 'var(--text-muted)' }}>No other contestants</div>}
          </div>
        </>
      )}
    </div>
  );
}
