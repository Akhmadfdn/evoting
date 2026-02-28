'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/statistics');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Dashboard</h1>
                    <p className="admin-subtitle">Ringkasan data pemilihan umum</p>
                </div>
                <div className="badge badge-success" style={{ gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                    LIVE
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats?.summary?.totalParticipants || 0}</div>
                    <div className="stat-label">Total Peserta</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{stats?.summary?.registeredCount || 0}</div>
                    <div className="stat-label">Terdaftar</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🗳️</div>
                    <div className="stat-value">{stats?.summary?.votedCount || 0}</div>
                    <div className="stat-label">Sudah Voting</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value">{stats?.summary?.notVotedYet || 0}</div>
                    <div className="stat-label">Belum Voting</div>
                </div>
            </div>

            {/* Candidate Results */}
            <div className="glass-card">
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                    Perolehan Suara Kandidat
                </h2>
                {stats?.candidates?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Belum ada kandidat</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                        {stats?.candidates?.map((candidate) => (
                            <div key={candidate.id} className="stat-card" style={{ border: '2px solid var(--border)' }}>
                                {candidate.photo ? (
                                    <img src={candidate.photo} alt={candidate.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '2px solid var(--gold)' }} />
                                ) : (
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 12px' }}>
                                        {candidate.number}
                                    </div>
                                )}
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{candidate.name}</div>
                                <div className="stat-value" style={{ fontSize: '28px', color: 'var(--gold)' }}>{candidate.votes}</div>
                                <div className="stat-label">Suara ({candidate.percentage}%)</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
