'use client';

import { useState, useEffect, useRef } from 'react';

export default function ScanPage() {
    const [mode, setMode] = useState('register');
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [manualToken, setManualToken] = useState('');
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const startScanner = async () => {
        setResult(null);
        setError('');
        setScanning(true);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');

            if (html5QrCodeRef.current) {
                try {
                    await html5QrCodeRef.current.stop();
                } catch { }
            }

            const html5QrCode = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                async (decodedText) => {
                    // Extract token from URL or use raw text
                    let token = decodedText;
                    try {
                        const url = new URL(decodedText);
                        const pathParts = url.pathname.split('/');
                        const voteIndex = pathParts.indexOf('vote');
                        if (voteIndex !== -1 && pathParts[voteIndex + 1]) {
                            token = pathParts[voteIndex + 1];
                        }
                    } catch { }

                    try {
                        await html5QrCode.stop();
                    } catch { }
                    setScanning(false);

                    await processToken(token);
                },
                (errorMessage) => {
                    // Scan error, ignore silently
                }
            );
        } catch (err) {
            console.error('Scanner error:', err);
            setError('Gagal mengaktifkan kamera. Pastikan izin kamera telah diberikan.');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch { }
        }
        setScanning(false);
    };

    const processToken = async (token) => {
        setResult(null);
        setError('');

        if (mode === 'register') {
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error);
                    if (data.participant) {
                        setResult({ type: 'warning', ...data.participant });
                    }
                    return;
                }
                setResult({ type: 'success', message: data.message, ...data.participant });
            } catch (err) {
                setError('Gagal memproses registrasi');
            }
        } else {
            // Voting mode — redirect to vote page
            window.open(`/vote/${token}`, '_blank');
            setResult({ type: 'success', message: 'Halaman voting dibuka di tab baru' });
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualToken.trim()) {
            let token = manualToken.trim();
            // Try to extract from URL
            try {
                const url = new URL(token);
                const pathParts = url.pathname.split('/');
                const voteIndex = pathParts.indexOf('vote');
                if (voteIndex !== -1 && pathParts[voteIndex + 1]) {
                    token = pathParts[voteIndex + 1];
                }
            } catch { }
            processToken(token);
            setManualToken('');
        }
    };

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                try {
                    html5QrCodeRef.current.stop();
                } catch { }
            }
        };
    }, []);

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">QR Scanner</h1>
                    <p className="admin-subtitle">Scan QR Code peserta untuk registrasi atau voting</p>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="scanner-mode-toggle" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
                <button
                    className={`scanner-mode-btn ${mode === 'register' ? 'active' : ''}`}
                    onClick={() => { setMode('register'); setResult(null); setError(''); }}
                >
                    ✅ Mode Registrasi
                </button>
                <button
                    className={`scanner-mode-btn ${mode === 'vote' ? 'active' : ''}`}
                    onClick={() => { setMode('vote'); setResult(null); setError(''); }}
                >
                    🗳️ Mode Voting
                </button>
            </div>

            {/* Mode Description */}
            <div style={{ maxWidth: '500px', margin: '0 auto 24px', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                    {mode === 'register' ? (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            📋 Scan QR Code peserta untuk menandai sebagai <strong style={{ color: '#22c55e' }}>terdaftar</strong>
                        </p>
                    ) : (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            🗳️ Scan QR Code peserta untuk membuka halaman <strong style={{ color: 'var(--gold)' }}>voting</strong>
                        </p>
                    )}
                </div>
            </div>

            {/* Scanner */}
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="scanner-container" ref={scannerRef}>
                    <div id="qr-reader" style={{ width: '100%' }}></div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    {!scanning ? (
                        <button className="btn btn-primary btn-lg" onClick={startScanner}>
                            📷 Mulai Scan
                        </button>
                    ) : (
                        <button className="btn btn-danger btn-lg" onClick={stopScanner}>
                            ⏹ Stop Scan
                        </button>
                    )}
                </div>

                {/* Manual Input */}
                <div style={{ marginTop: '24px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
                        Atau masukkan token/URL secara manual:
                    </p>
                    <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Token atau URL QR code..."
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                            Proses
                        </button>
                    </form>
                </div>

                {/* Result */}
                {error && (
                    <div className="scanner-result" style={{ borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>❌</span>
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{error}</p>
                                {result?.type === 'warning' && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {result.name} — {result.organization || '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {result?.type === 'success' && (
                    <div className="scanner-result" style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>✅</span>
                            <div>
                                <p style={{ fontWeight: 600, color: '#22c55e' }}>{result.message}</p>
                                {result.name && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {result.name} — {result.organization || '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Scan Again Button */}
                {(result || error) && (
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <button className="btn btn-secondary" onClick={() => { setResult(null); setError(''); startScanner(); }}>
                            📷 Scan Lagi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
