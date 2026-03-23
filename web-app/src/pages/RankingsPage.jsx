import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient.js';
import { useAuth } from '../components/AuthContext.jsx';
import { FiRefreshCw, FiAward, FiStar, FiTrendingUp } from 'react-icons/fi';

export default function RankingsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get({ path: '/votes/stats', token });
      if (res?.success) setRows(Array.isArray(res.data) ? res.data : []);
      else setRows([]);
    } catch (e) {
      setError(e.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Group data by category (talentType)
  const groupedData = rows.reduce((acc, current) => {
    const category = current.talentType || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(current);
    return acc;
  }, {});

  const categories = ['All', ...Object.keys(groupedData).sort()];

  // Filter based on active tab
  const filteredData = activeCategory === 'All' 
    ? rows 
    : groupedData[activeCategory] || [];

  // Sort by highest votes first just in case
  const sortedData = [...filteredData].sort((a, b) => b.votes - a.votes);

  return (
    <div style={styles.container}>
      <div style={styles.headerGlass}>
        <div style={styles.headerInfo}>
          <h2 style={styles.titleGradient}>Live Leaderboard</h2>
          <p style={styles.subtitle}>Real-time rankings categorized by talent</p>
        </div>
        <button 
          style={styles.refreshBtn} 
          onClick={load}
          disabled={loading}
        >
          <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.filterContainer}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              ...styles.filterTab,
              ...(activeCategory === cat ? styles.filterTabActive : {})
            }}
          >
            {cat === 'All' ? <FiTrendingUp /> : <FiStar />}
            {cat}
          </button>
        ))}
      </div>

      <div style={styles.cardGlass}>
        {loading && sortedData.length === 0 ? (
          <div style={styles.loadingBox}>Loading rankings...</div>
        ) : sortedData.length > 0 ? (
          <div style={styles.listContainer}>
             {sortedData.map((c, i) => (
               <div key={c._id || c.name || i} style={styles.row}>
                 <div style={styles.rankOuter}>
                   <div style={{
                     ...styles.rankCircle,
                     ...(i === 0 ? styles.rank1 : i === 1 ? styles.rank2 : i === 2 ? styles.rank3 : styles.rankOther)
                   }}>
                     {i + 1}
                   </div>
                 </div>
                 
                 <div style={styles.contestantInfo}>
                   <h4 style={styles.contestantName}>{c.name}</h4>
                   <span style={styles.talentBadge}>{c.talentType || 'Uncategorized'}</span>
                 </div>
                 
                 <div style={styles.voteDisplay}>
                   <span style={styles.voteCount}>{c.votes || 0}</span>
                   <span style={styles.voteLabel}>Votes</span>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div style={styles.emptyBox}>No ranking data available for this category.</div>
        )}
      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#f8fafc',
  },
  headerGlass: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  headerInfo: {
    flex: 1,
  },
  titleGradient: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
    fontWeight: '400',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '12px',
    color: '#fcd34d',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorBox: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
    color: '#fca5a5',
    marginBottom: '1rem',
    borderRadius: '12px',
    textAlign: 'center'
  },
  filterContainer: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1.25rem',
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '9999px',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterTabActive: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#ffffff',
    border: '1px solid transparent',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
  },
  cardGlass: {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.25rem',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    transition: 'transform 0.2s, background 0.2s',
  },
  rankOuter: {
    marginRight: '1.5rem',
  },
  rankCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: '800',
  },
  rank1: {
    background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
    color: '#78350f',
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
  },
  rank2: {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
    color: '#0f172a',
  },
  rank3: {
    background: 'linear-gradient(135deg, #fed7aa 0%, #b45309 100%)',
    color: '#451a03',
  },
  rankOther: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  contestantInfo: {
    flex: 1,
  },
  contestantName: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0 0 0.35rem 0',
  },
  talentBadge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    color: '#cbd5e1',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
  },
  voteDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  voteCount: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fcd34d',
  },
  voteLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  loadingBox: {
    padding: '3rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  emptyBox: {
    padding: '3rem',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '1.1rem',
  }
};
