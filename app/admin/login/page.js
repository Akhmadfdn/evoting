'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login gagal');
                setLoading(false);
                return;
            }

            router.push('/admin');
        } catch (err) {
            setError('Gagal terhubung ke server');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute', top: '-30%', left: '-10%', width: '50%', height: '160%',
                background: 'radial-gradient(ellipse, rgba(220,38,38,0.12), transparent 70%)',
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'absolute', bottom: '-30%', right: '-10%', width: '40%', height: '140%',
                background: 'radial-gradient(ellipse, rgba(212,175,55,0.06), transparent 70%)',
                pointerEvents: 'none'
            }}></div>

            <div className="glass-card animate-slide-up" style={{ maxWidth: '420px', width: '100%', padding: '40px', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        background: 'linear-gradient(135deg, var(--primary), var(--gold))',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', fontWeight: 800, margin: '0 auto 16px'
                    }}>🗳️</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>
                        Admin Panel
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Masuk untuk mengelola E-Voting
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: 'var(--radius-md)',
                        background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)',
                        color: 'var(--primary-light)', fontSize: '14px', marginBottom: '20px', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}
