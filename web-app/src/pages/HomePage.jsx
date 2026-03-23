import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const accentColor = '#FC5A6D';

  return (
    <div style={{ backgroundColor: '#0e0d12', color: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', 'Sora', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .glass-nav {
          background: ${isScrolled ? 'rgba(14, 13, 18, 0.95)' : 'transparent'};
          backdrop-filter: ${isScrolled ? 'blur(16px)' : 'none'};
          border-bottom: ${isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent'};
          transition: all 0.4s ease;
        }

        .nav-btn-outline {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .nav-btn-outline:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .primary-btn {
          background: #FD5D73;
          color: #fff;
          border: none;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        .primary-btn:hover {
          background: #FA4B64;
          transform: translateY(-1px);
        }

        .hero-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(3rem, 7vw, 6rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          margin: 0;
          text-transform: uppercase;
        }
        
        .hero-title .accent {
          color: #FD5D73;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: clamp(1rem, 1.3vw, 1.1rem);
          line-height: 1.6;
          max-width: 650px;
          margin: 0 auto;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        .action-btn-main {
          background: #FD5D73;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        .action-btn-main:hover {
          background: #FA4B64;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(253, 93, 115, 0.2);
        }

        .action-btn-secondary {
          background: rgba(30, 30, 35, 0.4);
          border: 1px solid rgba(255,255,255,0.06);
          color: #E2E8F0;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .action-btn-secondary:hover {
          background: rgba(40, 40, 45, 0.8);
          border-color: rgba(255,255,255,0.15);
          color: #fff;
        }

        .stats-bar-container {
          position: relative;
          background: #111015;
          border-radius: 12px;
          padding: 1px;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .stats-bar-container::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, rgba(253, 93, 115, 0.4) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .stats-bar {
          background: #15141A;
          border-radius: 11px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          padding: 24px 40px;
          gap: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0 10px;
        }
        
        .icon-box {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(253, 93, 115, 0.04);
          border: 1px solid rgba(253, 93, 115, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FD5D73;
        }
        
        .feature-card {
          background: #15141A;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 40px;
          transition: transform 0.4s ease, border-color 0.4s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(253, 93, 115, 0.3);
        }
      `}</style>

      {/* Modern Fixed Navbar */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: "'Inter', sans-serif" }}>
              SLIIT <span style={{ color: '#FD5D73' }}>TALENT</span>
            </h2>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" className="nav-btn-outline">
            Student Login
          </Link>
          <Link to="/dashboard/vote" className="primary-btn">
            Live Voting 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '160px 5% 80px 5%', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ marginBottom: '32px', padding: '6px 20px', borderRadius: '30px', background: 'rgba(253, 93, 115, 0.08)', border: '1px solid rgba(253, 93, 115, 0.2)', color: '#FD5D73', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
            10th Anniversary Edition • Live Show
          </div>

          <h1 className="hero-title" style={{ marginBottom: '24px' }}>
            THE STAGE IS <span className="accent">SET.</span><br/>
            THE TALENT IS <span className="accent">REAL.</span>
          </h1>

          <p className="hero-subtitle" style={{ marginBottom: '48px' }}>
            Experience the most anticipated event of the year. Join us as the
            brightest undergraduates from across all faculties showcase mind-
            blowing performances.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '80px' }}>
            <Link to="/dashboard/vote" className="action-btn-main">
              Vote For Your Favorite
            </Link>
            <Link to="/register" className="action-btn-secondary">
              Register Talent
            </Link>
            <a href="#about" className="action-btn-secondary">
              Discover The Event
            </a>
          </div>

          {/* Event Details Floating Bar */}
          <div className="stats-bar-container">
            <div className="stats-bar">
              <div className="stat-item">
                <div className="icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</p>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>Sept 27, 2024</p>
                </div>
              </div>

              <div className="stat-divider" />

              <div className="stat-item">
                <div className="icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Venue</p>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>Nelum Pokuna</p>
                </div>
              </div>

              <div className="stat-divider" />

              <div className="stat-item">
                <div className="icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Attendees</p>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>2,500+ Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section id="about" style={{ padding: '100px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>Celebrating a <span className="stat-number">Decade</span> of Talent</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            Organized by the Faculty of Engineering Students’ Community, SLIIT’s Got Talent brings together faculties, staff, and directors for an unforgettable night of music, dance, and sheer entertainment.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {/* Card 1 */}
          <div className="feature-card">
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.2), rgba(255, 123, 143, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.8rem' }}>💃</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: '700' }}>Exquisite Choreography</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              Watch as crews battle it out for the title of "Most Talented" and "Most Popular" dancing group. Expect high-energy routines, stunning costumes, and perfect synchronization.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.2), rgba(255, 123, 143, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.8rem' }}>🎤</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: '700' }}>Vocal Powerhouses</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              From emotional acoustics to powerful ballads. Follow the journey of soloists and bands competing to become SLIIT's most acclaimed vocalists.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.2), rgba(255, 123, 143, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.8rem' }}>🏆</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: '700' }}>The Ultimate Honor</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              Not just the judges—YOU have the power. The highly coveted People's Choice awards are placed directly in the hands of the audience through our live voting platform.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(to top, rgba(233, 69, 96, 0.1), transparent)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>Experience the Magic Live</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          The stage is ready. The performers are prepared. All that's missing is you. Grab your access to vote and support your peers!
        </p>
        <Link to="/dashboard/vote" className="hero-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 48px', background: '#fff', color: '#000', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none' }}>
          Enter Voting Portal
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 5% 40px 5%', background: '#0a0a0f' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', marginBottom: '60px' }}>
          <div>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#fff', fontWeight: '800' }}>
              SLIIT <span style={{ color: 'var(--primary)' }}>TALENT</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.6' }}>
              The Official Voting & Event Platform for SLIIT's Got Talent. Brought to you by the Students' Community.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '20px', fontWeight: '600' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>About Event</a>
                <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Contestant Registration</Link>
                <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Student Login</Link>
                <Link to="/dashboard/vote" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Voting Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '20px', fontWeight: '600' }}>Connect</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="https://www.sliit.lk" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>SLIIT Website</a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Facebook</a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Instagram</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <p>© {new Date().getFullYear()} SLIIT's Got Talent. Final Year / Student Community Initiative. Not officially affiliated with SLIIT Administration.</p>
        </div>
      </footer>

    </div>
  );
}
