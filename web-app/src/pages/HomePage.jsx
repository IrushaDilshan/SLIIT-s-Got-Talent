import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: "'Sora', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        .glass-nav {
          background: ${isScrolled ? 'rgba(15, 15, 19, 0.85)' : 'transparent'};
          backdrop-filter: ${isScrolled ? 'blur(16px)' : 'none'};
          -webkit-backdrop-filter: ${isScrolled ? 'blur(16px)' : 'none'};
          border-bottom: ${isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent'};
          transition: all 0.4s ease;
        }
        .hero-gradient {
          background: radial-gradient(circle at 50% 20%, rgba(233, 69, 96, 0.15) 0%, transparent 60%),
                      radial-gradient(circle at 80% 80%, rgba(15, 52, 96, 0.3) 0%, transparent 50%),
                      url('https://images.unsplash.com/photo-1540039155732-684735035727?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          position: relative;
        }
        .hero-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(15,15,19,0.7) 0%, rgba(15,15,19,0.95) 80%, var(--bg-dark) 100%);
          z-index: 1;
        }
        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px;
          transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
          backdrop-filter: blur(10px);
        }
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(233, 69, 96, 0.15);
          border-color: rgba(233, 69, 96, 0.4);
        }
        .stat-number {
          background: var(--gradient-1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        .hero-btn {
          transition: all 0.3s ease;
        }
        .hero-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 25px rgba(233, 69, 96, 0.4);
        }
        .nav-link {
          transition: color 0.3s ease;
          text-decoration: none;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
        }
        .nav-link:hover {
          color: #fff;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
        }
      `}</style>

      {/* Modern Fixed Navbar */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: '800', letterSpacing: '-0.5px' }}>
              SLIIT <span style={{ color: 'var(--primary)' }}>TALENT</span>
            </h2>
          </Link>
          <div style={{ display: 'none', gap: '30px', '@media(minWidth: 768px)': { display: 'flex' } }} className="nav-links-container">
            <a href="#about" className="nav-link">The Event</a>
            <a href="#categories" className="nav-link">Categories</a>
            <a href="#rules" className="nav-link">Guidelines</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{ padding: '10px 24px', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }} className="glass-panel">
            Student Login
          </Link>
          <Link to="/dashboard/vote" className="hero-btn" style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--gradient-1)', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Live Voting
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 5% 60px 5%', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ marginBottom: '24px', padding: '8px 20px', borderRadius: '30px', background: 'rgba(233, 69, 96, 0.1)', border: '1px solid rgba(233, 69, 96, 0.2)', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            10th Anniversary Edition • Live Show
          </div>

          <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' }}>
            THE STAGE IS <span className="stat-number">SET.</span><br/>
            THE TALENT IS <span className="stat-number">REAL.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '700px', lineHeight: '1.6', fontFamily: "'Manrope', sans-serif" }}>
            Experience the most anticipated event of the year. Join us as the brightest undergraduates from across all faculties showcase mind-blowing performances.
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
            <Link to="/dashboard/vote" className="hero-btn" style={{ padding: '16px 40px', background: 'var(--gradient-1)', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none' }}>
              Vote For Your Favorite
            </Link>
            <a href="#about" className="glass-panel" style={{ padding: '16px 40px', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', transition: 'all 0.3s' }}>
              Discover The Event
            </a>
          </div>

          {/* Event Details Floating Bar */}
          <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '30px', gap: '40px', width: '100%', maxWidth: '800px', margin: '0 auto', borderBottom: '2px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(233, 69, 96, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Date</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Sept 27, 2024</p>
              </div>
            </div>

            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(233, 69, 96, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Venue</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Nelum Pokuna</p>
              </div>
            </div>

            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(233, 69, 96, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Attendees</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>2,500+ Live</p>
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
