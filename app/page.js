'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/statistics');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxVotes = stats?.candidates?.length
    ? Math.max(...stats.candidates.map(c => c.votes), 1)
    : 1;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <div className="navbar-brand-icon">🗳️</div>
            <span className="navbar-brand-text">E-Voting</span>
          </Link>
          <div className="navbar-links">
            <Link href="/admin/login" className="btn btn-outline btn-sm">
              Admin Panel
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🔴</span> LIVE — Pemilihan Umum Berlangsung
            </div>
            <h1 className="hero-title">
              Pemilihan Umum<br />
              <span className="text-gradient">Organisasi Pemuda</span>
            </h1>
            <p className="hero-subtitle">
              Sistem e-voting digital yang transparan, aman, dan real-time.
              Pantau hasil pemilihan secara langsung di sini.
            </p>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="container" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-value">{loading ? '...' : stats?.summary?.totalParticipants || 0}</div>
            <div className="stat-label">Total Peserta</div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon">✅</div>
            <div className="stat-value">{loading ? '...' : stats?.summary?.registeredCount || 0}</div>
            <div className="stat-label">Terdaftar</div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon">🗳️</div>
            <div className="stat-value">{loading ? '...' : stats?.summary?.votedCount || 0}</div>
            <div className="stat-label">Sudah Voting</div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{loading ? '...' : stats?.summary?.notVotedYet || 0}</div>
            <div className="stat-label">Belum Voting</div>
          </div>
        </div>
      </section>

      {/* Voting Results */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700 }}>
                Hasil Perolehan Suara
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Update otomatis setiap 5 detik
              </p>
            </div>
            <div className="badge badge-success" style={{ gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              LIVE
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner"></div>
          ) : stats?.candidates?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>🗳️</p>
              <p>Belum ada kandidat terdaftar</p>
            </div>
          ) : (
            <div>
              {stats?.candidates?.map((candidate, index) => (
                <div key={candidate.id} className="progress-bar-container" style={{ animation: `slideUp 0.5s ease forwards`, animationDelay: `${index * 0.1}s`, opacity: 0 }}>
                  <div className="progress-bar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                          {candidate.number}
                        </div>
                      )}
                      <span className="progress-bar-name">{candidate.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="progress-bar-value" style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                        {candidate.votes} suara
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        ({candidate.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(candidate.votes / maxVotes) * 100}%`,
                        background: index === 0
                          ? 'linear-gradient(90deg, #DC2626, #EF4444)'
                          : index === 1
                            ? 'linear-gradient(90deg, #D4AF37, #F0D060)'
                            : 'linear-gradient(90deg, #6366f1, #818cf8)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Total votes */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Suara Masuk: </span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold)', fontFamily: "'Playfair Display', serif" }}>
                  {stats?.summary?.totalVotes || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
        <p>© 2026 E-Voting Organisasi Pemuda — Sistem Pemilihan Digital</p>
      </footer>
    </>
  );
}
