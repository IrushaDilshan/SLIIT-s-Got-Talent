import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function ManagePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
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
  const rejected = contestants.filter(c => (c.status || '').toLowerCase() === 'rejected');
  const allNonRejected = contestants.filter(c => (c.status || '').toLowerCase() == 'approved');
  const renderRow = (c, options = {}) => {
    const status = (c.status).toLowerCase();
    const showRemarks = Boolean(options.showRemarks);

    return (
      <div
        key={c._id}
        className="leaderboard-row"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '12px',
          alignItems: 'start',
          backgroundColor: 'var(--bg-card)',
          padding: '15px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          marginBottom: '10px'
        }}
      >
        <div className="lb-details" style={{ minWidth: 0 }}>
          <h4 style={{ margin: '0 0 6px 0', overflowWrap: 'anywhere' }}>
            {c.name} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({c.universityId})</span>
          </h4>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '6px' }}>{c.talentType}</div>
          {showRemarks && (
            <div style={{ color: '#fca5a5', fontSize: '0.85rem', lineHeight: 1.4 }}>
              <strong>Remarks:</strong> {c.remarks || 'No remarks provided.'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '0.82rem',
              padding: '4px 8px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: status === 'approved' ? '#2ecc71' : status === 'rejected' ? '#ff7675' : '#fdcb6e'
            }}
          >
            {status.toUpperCase()}
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              onClick={() => navigate(`/dashboard/review/${c._id}`)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #74b9ff', background: 'rgba(116,185,255,0.12)', color: '#74b9ff', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
            >
              View
            </button>

            {status !== 'approved' && (
              <button onClick={() => handleAction(c._id, 'approved')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#2ecc71', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                Approve
              </button>
            )}

            {status !== 'rejected' && (
              <button onClick={() => handleAction(c._id, 'rejected')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ff7675', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                Reject
              </button>
            )}

            <button onClick={() => handleDelete(c._id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #636e72', background: 'transparent', color: '#b2bec3', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
              Del
            </button>
          </div>
        </div>
      </div>
    );
  };

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

          <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>Rejected Contestants ({rejected.length})</h3>
          <div className="leaderboard-list" style={{ marginBottom: '40px' }}>
            {rejected.length ? rejected.map((c) => renderRow(c, { showRemarks: true })) : <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, color: 'var(--text-muted)' }}>No rejected contestants</div>}
          </div>
          
          <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>All Contestants ({allNonRejected.length})</h3>
          <div className="leaderboard-list">
            {allNonRejected.length ? allNonRejected.map(renderRow) : <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, color: 'var(--text-muted)' }}>No contestants</div>}
          </div>
        </>
      )}
    </div>
  );
}
