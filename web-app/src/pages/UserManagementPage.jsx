import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function UserManagementPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get({ path: '/admin/users', token });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleRoleChange = async (id, role) => {
    if (!window.confirm(`Change role to ${role}?`)) return;
    try {
      await api.put({ path: `/admin/users/${id}/role`, token, body: { role } });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
    } catch (err) {
      alert(err.message || 'Error updating role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user? This cannot be undone.')) return;
    try {
      await api.del({ path: `/admin/users/${id}`, token });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message || 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(u => u.role !== 'judge');

  const renderRow = (u) => (
    <div key={u._id} className="leaderboard-row" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px', gap: '10px', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px' }}>
      <div className="lb-details">
        <h4 style={{ margin: '0 0 5px 0' }}>{u.email}</h4>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID: {u._id}</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: u.role === 'admin' ? '#fdcb6e' : '#74b9ff' }}>
          {(u.role || 'student').toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <select 
          value={u.role || 'student'} 
          onChange={(e) => handleRoleChange(u._id, e.target.value)}
          style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
          disabled={u._id === user?._id}
        >
          <option value="student">Student</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="judge">Judge</option>
        </select>
        
        <button onClick={() => handleDelete(u._id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #636e72', background: 'transparent', color: '#ff7675', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }} disabled={u._id === user?._id}>
          Del
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>User Management</h2>
          <p className="page-subtitle" style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Manage platform users</p>
        </div>
        <button className="btn-ghost" onClick={fetchUsers} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {error && <div style={{ color: '#ff7675', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading users...</div>
      ) : (
        <>
          <div className="leaderboard-list">
            {filteredUsers.length ? filteredUsers.map(renderRow) : <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, color: 'var(--text-muted)' }}>No users found</div>}
          </div>
        </>
      )}
    </div>
  );
}
