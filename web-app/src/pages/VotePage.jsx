import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/apiClient.js';
import { useAuth } from '../components/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

function youtubeThumb(url) {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/i);
  const id = match?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export default function VotePage() {
  const { token, user, updateUser, clearSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contestants, setContestants] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const hasVotedAny = Boolean(user?.votedCategories?.length > 0 || user?.isVoted);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.get({ path: '/contestants', token });
        if (!cancelled) setContestants(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load contestants');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleLogout() {
    clearSession();
    navigate('/', { replace: true });
  }

  const groupedData = useMemo(() => contestants.reduce((acc, current) => {
    const category = current.talentType || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(current);
    return acc;
  }, {}), [contestants]);

  const categories = useMemo(() => ['All', ...Object.keys(groupedData).sort()], [groupedData]);
  
  const filteredContestants = useMemo(() => activeCategory === 'All' 
    ? contestants 
    : groupedData[activeCategory] || [], [activeCategory, contestants, groupedData]);

  const cards = useMemo(() => {
    const votedCategories = user?.votedCategories || [];
    const votedContestants = user?.votedContestants || [];

    return filteredContestants.map((c) => {
      const thumb = youtubeThumb(c.videoUrl);
      const isVotedForThisContestant = votedContestants.includes(c._id);
      const hasVotedInCategory = votedCategories.includes(c.talentType);
      
      return (
        <div key={c._id} className="premium-card">
          <div className="card-image-wrapper">
            {thumb ? (
              <img src={thumb} alt={c.name} />
            ) : (
              <div className="card-image-placeholder">{c.name?.charAt(0) || '?'}</div>
            )}
            <div className="card-badge">{c.talentType}</div>
          </div>
          <div className="card-content">
            <h3 className="card-title">{c.name}</h3>
            <p className="card-desc">{c.description || 'No description provided.'}</p>
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button
                className={`vote-btn ${isVotedForThisContestant ? 'voted' : ''}`}
                disabled={hasVotedInCategory}
                onClick={async () => {
                  if (hasVotedInCategory) return;
                  if (!window.confirm(`Confirm your vote for ${c.name} in ${c.talentType}? This cannot be undone.`)) return;
                  try {
                    const res = await api.post({ path: '/votes', token, body: { contestantId: c._id } });
                    if (res?.success) {
                      updateUser({ 
                        isVoted: true,
                        votedCategories: [...votedCategories, c.talentType],
                        votedContestants: [...votedContestants, c._id]
                      });
                      window.alert(`Vote cast successfully for ${c.name}!`);
                    } else {
                      window.alert(res?.message || 'Vote failed');
                    }
                  } catch (e) {
                    window.alert(e.message || 'Vote failed');
                  }
                }}
              >
                {isVotedForThisContestant 
                  ? '✓ Voted' 
                  : hasVotedInCategory 
                    ? 'Category Locked' 
                    : `Vote for ${c.name?.split(' ')?.[0] || 'Contestant'}`}
              </button>
            </div>
          </div>
        </div>
      );
    });
  }, [filteredContestants, user, token, updateUser]);

  return (
    <div style={{ backgroundColor: '#09090b', color: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        body { margin: 0; background-color: #09090b; }
        
        /* Modern Fixed Navbar */
        .glass-nav {
          background: ${isScrolled ? 'rgba(9, 9, 11, 0.85)' : 'transparent'};
          backdrop-filter: ${isScrolled ? 'blur(24px) saturate(1.5)' : 'none'};
          border-bottom: ${isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent'};
          transition: all 0.4s ease;
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 5%;
          display: flex; align-items: center; justify-content: space-between;
        }

        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-link { color: #94A3B8; text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #FD5D73; font-weight: 600; }

        .btn-outline {
          background: transparent; border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0; font-weight: 500; font-size: 0.85rem; padding: 8px 20px;
          border-radius: 8px; cursor: pointer; transition: all 0.2s;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255, 255, 255, 0.3); }

        /* Hero Banner */
        .hero-banner {
          position: relative;
          padding: 160px 5% 80px;
          background: linear-gradient(180deg, rgba(20,20,25,0) 0%, rgba(9,9,11,1) 100%),
                      url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .hero-banner::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at center, rgba(253, 93, 115, 0.2) 0%, transparent 60%);
        }
        
        .huge-title {
          font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 900; line-height: 1.1;
          letter-spacing: -0.04em; text-transform: uppercase; margin: 0 0 20px 0;
          position: relative; z-index: 2;
        }
        .huge-title span {
          background: linear-gradient(to right, #FD5D73, #FFA07A);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          color: #94A3B8; font-size: 1.2rem; max-width: 600px;
          line-height: 1.6; position: relative; z-index: 2; margin: 0;
        }

        /* Status Badge */
        .status-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3);
          color: #4ade80; padding: 12px 24px; border-radius: 30px; font-weight: 600;
          margin-top: 30px; position: relative; z-index: 2; font-size: 0.95rem;
          box-shadow: 0 0 20px rgba(46, 204, 113, 0.1);
        }

        /* Voting Controls Container */
        .content-container {
          max-width: 1300px; margin: 0 auto; padding: 40px 5%; position: relative; z-index: 10;
        }

        /* Premium Contestant Card */
        .contestant-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;
        }
        .premium-card {
          background: rgba(20, 20, 25, 0.6); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px; overflow: hidden; display: flex; flex-direction: column;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-card:hover {
          transform: translateY(-8px); border-color: rgba(253, 93, 115, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(253, 93, 115, 0.05);
        }

        .card-image-wrapper {
          position: relative; width: 100%; aspect-ratio: 16/9; background: #1a1a20;
          overflow: hidden;
        }
        .card-image-wrapper img {
          width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;
        }
        .premium-card:hover .card-image-wrapper img { transform: scale(1.05); }
        .card-image-placeholder {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          font-size: 3rem; font-weight: 800; color: rgba(255,255,255,0.1);
        }
        
        .card-badge {
          position: absolute; top: 16px; right: 16px;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px;
          border-radius: 30px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-content { padding: 24px; display: flex; flex-direction: column; flex-grow: 1; }
        .card-title { font-size: 1.4rem; font-weight: 800; margin: 0 0 10px 0; color: #fff; }
        .card-desc { color: #94A3B8; font-size: 0.95rem; line-height: 1.6; margin: 0; }

        /* Modern Vote Button */
        .vote-btn {
          width: 100%; background: linear-gradient(135deg, #FD5D73 0%, #E11D48 100%);
          color: #fff; font-weight: 700; font-size: 1rem; padding: 14px 20px;
          border-radius: 12px; border: none; cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(225, 29, 72, 0.2);
        }
        .vote-btn:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 12px 25px rgba(225, 29, 72, 0.4);
        }
        .vote-btn:disabled.voted {
          background: rgba(46, 204, 113, 0.15); border: 1px solid rgba(46, 204, 113, 0.3);
          color: #4ade80; box-shadow: none; transform: none; cursor: not-allowed;
        }
        .vote-btn:disabled:not(.voted) {
          background: rgba(255,255,255,0.05); color: #64748B; cursor: not-allowed; box-shadow: none;
        }

        /* Filter Tabs */
        .filter-container {
          display: flex; gap: 12px; padding-bottom: 30px; flex-wrap: wrap; justify-content: center;
        }
        .filter-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 24px; background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 30px;
          color: #94a3b8; font-size: 0.95rem; font-weight: 500; cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
        .filter-tab.active {
          background: linear-gradient(135deg, #FD5D73 0%, #E11D48 100%);
          color: #ffffff; border: 1px solid transparent;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
        }
      `}</style>

      {/* Modern Fixed Navbar */}
      <nav className="glass-nav">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: '900', letterSpacing: '-0.5px' }}>
              Votify <span style={{ color: '#FD5D73' }}>SLIIT</span>
            </h2>
          </Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/vote" className="nav-link active">Meet Contestants</Link>
          <Link to="/rankings" className="nav-link">Live Results</Link>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={handleLogout} className="btn-outline">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Immersive Hero Banner */}
      <div className="hero-banner">
        <h1 className="huge-title">THE ULTIMATE<br/><span>TALENT SHOWCASE</span></h1>
        <p className="hero-subtitle">You hold the power. Watch the performances, pick your absolute favorite, and crown the next superstar of SLIIT.</p>
        
        {hasVotedAny && (
          <div className="status-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Your votes have been securely recorded!
          </div>
        )}
      </div>

      <div className="content-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '1.2rem', fontWeight: '600' }}>Loading Contestants...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#FD5D73', fontSize: '1.2rem', fontWeight: '600' }}>{error}</div>
        ) : (
          <>
            <div className="filter-container">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="contestant-grid">
              {cards.length ? cards : <p style={{ color: '#94A3B8', textAlign: 'center', gridColumn: '1 / -1' }}>No contestants found for this category.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
