import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 25,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-widget">
      <div className="countdown-title">Time Remaining</div>
      <div className="countdown-values">
        <div className="time-box">
          <span className="time-num">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="time-label">Hours</span>
        </div>
        <div className="time-box">
          <span className="time-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="time-label">Minutes</span>
        </div>
        <div className="time-box">
          <span className="time-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="time-label">Seconds</span>
        </div>
      </div>
      {/* Huge fading check abstract shape mimicking the reference */}
      <div className="abstract-check">✓</div>
    </div>
  );
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const userName = user?.email ? user.email.split('@')[0] : 'Student';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        body { margin: 0; background-color: #f8f9fa; overscroll-behavior: none; }
        
        /* Navbar */
        .glass-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 5%;
          display: flex; align-items: center; justify-content: space-between;
          background: ${isScrolled ? 'rgba(10, 10, 15, 0.95)' : 'transparent'};
          backdrop-filter: ${isScrolled ? 'blur(10px)' : 'none'};
          border-bottom: ${isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'transparent'};
          transition: all 0.3s ease;
        }
        .nav-logo { color: #fff; font-weight: 600; font-size: 1.1rem; text-decoration: none; letter-spacing: 0.5px; }
        .nav-logo span { color: #888; margin: 0 10px; }
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-link { color: #d1d5db; text-decoration: none; font-weight: 500; font-size: 0.95rem; position: relative; }
        .nav-link.active { color: #fff; font-weight: 600; }
        .nav-link.active::after { content: ''; position: absolute; bottom: -8px; left: 0; width: 100%; height: 2px; background: #fff; }
        .nav-link:hover { color: #fff; }
        .help-btn {
          border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 30px;
          padding: 8px 24px; text-decoration: none; font-size: 0.9rem; transition: background 0.2s;
        }
        .help-btn:hover { background: rgba(255,255,255,0.1); }

        /* Dark Hero Background */
        .hero-section {
          position: relative;
          background: #0f1015 url('https://images.unsplash.com/photo-1540039155732-684735035727?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          padding: 180px 5% 150px;
          color: #fff;
        }
        .hero-section::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%);
        }
        
        .hero-content {
          position: relative; z-index: 10; max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 40px;
        }

        .hero-title-area { display: flex; align-items: flex-start; gap: 16px; }
        .huge-number { color: #FACC15; font-size: 8rem; font-weight: 900; line-height: 0.8; letter-spacing: -2px; }
        .hero-subtitle-area { display: flex; flex-direction: column; padding-top: 10px; }
        .rd-badge { color: #FACC15; font-size: 2.5rem; font-weight: 900; line-height: 1; margin-bottom: 5px; }
        .meeting-text { font-size: 1.5rem; font-weight: 400; line-height: 1.2; letter-spacing: 1px; color: #e2e8f0; text-transform: uppercase; }

        .countdown-widget {
          text-align: right; position: relative;
        }
        .countdown-title { color: #9ca3af; font-size: 1rem; margin-bottom: 12px; font-weight: 500; }
        .countdown-values { display: flex; gap: 20px; text-align: center; justify-content: flex-end; position: relative; z-index: 2; }
        .time-box { display: flex; flex-direction: column; align-items: center; }
        .time-num { font-size: 4.5rem; font-weight: 300; line-height: 1; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .time-label { font-size: 0.85rem; color: #9ca3af; text-transform: capitalize; margin-top: 5px; }
        
        .abstract-check {
          position: absolute; right: -20px; top: -40px; font-size: 14rem;
          color: rgba(59, 130, 246, 0.4); font-weight: bold; transform: rotate(-15deg);
          z-index: 1; pointer-events: none; line-height: 1;
        }

        /* Overlapping White Action Card */
        .card-container {
          position: relative; max-width: 1000px; margin: -80px auto 0; z-index: 20; padding: 0 5%;
        }
        .action-card {
          background: #ffffff; border-radius: 20px; padding: 40px 50px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08); flex-wrap: wrap; gap: 30px;
        }
        .greeting-title { font-size: 1.8rem; font-weight: 700; color: #111827; margin: 0 0 8px 0; }
        .greeting-sub { font-size: 1.1rem; color: #6b7280; margin: 0; font-weight: 400; }

        .vote-action-area { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .live-badge {
          display: flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.1);
          color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 14px;
          border-radius: 20px; font-size: 0.8rem; font-weight: 600;
        }
        .live-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .blue-vote-btn {
          background: #2563EB; color: #fff; font-size: 1.2rem; font-weight: 600;
          padding: 16px 36px; border-radius: 40px; text-decoration: none;
          display: inline-flex; align-items: center; gap: 12px; transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
        }
        .blue-vote-btn:hover { background: #1D4ED8; transform: translateY(-2px); box-shadow: 0 15px 25px rgba(37, 99, 235, 0.3); }

        /* Lower section */
        .nominees-section {
          padding: 100px 5%; text-align: center; color: #111827;
        }
        .section-title { font-size: 2.2rem; font-weight: 700; margin: 0 0 12px 0; }
        .section-sub { font-size: 1.1rem; color: #6b7280; margin: 0; }
      `}</style>

      {/* Navbar directly matching reference */}
      <nav className="glass-nav">
        <Link to="/" className="nav-logo">SLIIT <span>|</span> Got Talent 2025</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/vote" className="nav-link">Meet Contestants</Link>
          <Link to="/dashboard/rankings" className="nav-link">Live Results</Link>
          <a href="#" className="help-btn">Need help?</a>
        </div>
      </nav>

      {/* Hero match */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-title-area">
            <div className="huge-number">10</div>
            <div className="hero-subtitle-area">
              <div className="rd-badge">TH</div>
              <div className="meeting-text">ANNUAL<br/>SLIIT'S GOT<br/>TALENT</div>
            </div>
          </div>
          <CountdownTimer />
        </div>
      </div>

      {/* Overlapping Card */}
      <div className="card-container">
        <div className="action-card">
          <div>
            <h2 className="greeting-title">Hello {userName} 👋</h2>
            <p className="greeting-sub">It's time to make your voice heard.</p>
          </div>
          <div className="vote-action-area">
            <Link to="/vote" className="blue-vote-btn">
              Cast Your Vote Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE Voting is open now
            </div>
          </div>
        </div>
      </div>

      <div className="nominees-section">
        <h2 className="section-title">Meet the Performers</h2>
        <p className="section-sub">Get to know the contestant profiles & make an informed decision.</p>
      </div>

    </div>
  );
}
