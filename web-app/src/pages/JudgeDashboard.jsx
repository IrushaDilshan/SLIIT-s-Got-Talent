import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function JudgeDashboard() {
  const { isAuthed, user, logout } = useAuth();
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  // Quick redirection if not judge
  if (!isAuthed || user?.role !== 'judge') {
    return <Navigate to="/vote" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contestants');
      setContestants(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load contestants data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.ambientGlow} />
      
      {/* Application Layout Layout Grid */}
      <div style={styles.appLayout}>
        
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTop}>
            <div style={styles.sidebarBrand}>
              <span style={styles.brandIcon}>⚖️</span>
              <h2 style={styles.brandTitle}>Judge Panel</h2>
            </div>
            
            <nav style={styles.sidebarNav}>
              {['Dashboard', 'Live Event', 'Evaluate', 'Settings'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  style={{...styles.navItem, ...(activeTab === tab ? styles.navItemActive : {})}}
                >
                  <span style={styles.navItemText}>{tab}</span>
                  {activeTab === tab && <div style={styles.activeIndicator} />}
                </button>
              ))}
            </nav>
          </div>
          
          <div style={styles.sidebarBottom}>
            <div style={styles.judgeInfoWrapper}>
              <div style={styles.judgeAvatar}>JD</div>
              <div style={styles.judgeIdentity}>
                <span style={styles.judgeRoleBadge}>Head Judge</span>
                <span style={styles.judgeEmail}>{user?.email?.split('@')[0]}</span>
              </div>
            </div>
            <button style={styles.logoutBtn} onClick={logout}>Sign Out</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={styles.mainContent}>
          <header style={styles.topHeader}>
            <div>
              <h1 style={styles.pageTitle}>{activeTab}</h1>
              <p style={styles.pageSubtitle}>
                {activeTab === 'Dashboard' 
                  ? 'Monitor live contestants and overall event statistics.' 
                  : `Currently viewing ${activeTab} panel.`}
              </p>
            </div>
          </header>

          <div style={styles.contentScrollable}>
            {activeTab !== 'Dashboard' ? (
              <div style={styles.placeholderArea}>
                <p>{activeTab} module is coming soon.</p>
              </div>
            ) : loading ? (
              <div style={styles.loaderArea}>
                <div style={styles.loaderIcon}>⏳</div>
                <p>Loading the stage...</p>
              </div>
            ) : error ? (
              <div style={styles.errorBanner}>{error}</div>
            ) : (
              <div style={styles.grid}>
                {contestants.map((cont) => (
                  <div key={cont._id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={styles.avatarSection}>
                        {cont.imageUrl ? (
                          <img src={cont.imageUrl} alt={cont.name} style={styles.avatarImage} />
                        ) : (
                          <div style={styles.avatarPlaceholder}>{cont.name.charAt(0)}</div>
                        )}
                        <div>
                          <h3 style={styles.contName}>{cont.name}</h3>
                          <span style={styles.contCat}>{cont.talentType || 'General Talent'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.cardBody}>
                      <p style={styles.contDesc}>{cont.description || 'No description provided.'}</p>
                    </div>
                    
                    <div style={styles.cardFooter}>
                      <button style={styles.scoreBtn} onClick={() => alert('Grading feature coming soon!')}>
                        Evaluate Performance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#050510',
    backgroundImage: 'radial-gradient(circle at top right, #1a0f2e 0%, #050510 60%)',
    color: '#f8fafc',
    fontFamily: 'Inter, system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '60vw',
    height: '60vw',
    background: 'radial-gradient(circle, rgba(233,69,96,0.15) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  appLayout: {
    display: 'flex',
    height: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'rgba(15, 15, 26, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2rem 1.5rem',
  },
  sidebarTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    paddingLeft: '0.5rem',
  },
  brandIcon: {
    fontSize: '1.75rem',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#e94560',
    margin: 0,
    letterSpacing: '0.05em',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  navItemActive: {
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    color: '#fff',
  },
  navItemText: {
    textAlign: 'left',
  },
  activeIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: '#e94560',
  },
  sidebarBottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  judgeInfoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
  },
  judgeAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    color: '#38bdf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.9rem',
  },
  judgeIdentity: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  judgeRoleBadge: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#a0aec0',
    letterSpacing: '0.05em',
  },
  judgeEmail: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: '#f8fafc',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '0.8rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // to allow interior scrolling
  },
  topHeader: {
    padding: '2.5rem 3rem 1.5rem 3rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
    color: '#fff',
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
  },
  contentScrollable: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 3rem 3rem 3rem',
  },
  loaderArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40vh',
    color: '#94a3b8',
  },
  loaderIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    animation: 'spin 2s linear infinite',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '1rem',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  placeholderArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40vh',
    color: '#64748b',
    border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: '16px',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardHeader: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatarImage: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    backgroundColor: '#38bdf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  contName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: '0 0 0.2rem 0',
  },
  contCat: {
    fontSize: '0.75rem',
    color: '#e94560',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  cardBody: {
    flexGrow: 1,
  },
  contDesc: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: 1.5,
    margin: 0,
  },
  cardFooter: {
    paddingTop: '0.5rem',
  },
  scoreBtn: {
    width: '100%',
    padding: '0.65rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    color: '#e94560',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
