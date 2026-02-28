'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VotePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token;

    const [participant, setParticipant] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check participant status
                const participantRes = await fetch(`/api/vote?token=${token}`);
                const participantData = await participantRes.json();

                if (!participantRes.ok) {
                    setError(participantData.error || 'QR Code tidak valid');
                    setLoading(false);
                    return;
                }

                if (!participantData.registered) {
                    setError('Anda belum terdaftar. Silakan hubungi panitia untuk melakukan registrasi.');
                    setLoading(false);
                    return;
                }

                if (participantData.hasVoted) {
                    setError('Anda sudah melakukan voting sebelumnya. Satu peserta hanya dapat memilih satu kali.');
                    setLoading(false);
                    return;
                }

                setParticipant(participantData);

                // Fetch candidates
                const candidatesRes = await fetch('/api/candidates');
                const candidatesData = await candidatesRes.json();
                setCandidates(candidatesData);
            } catch (err) {
                setError('Gagal memuat data. Silakan coba lagi.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleSelectCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setShowConfirm(true);
    };

    const handleConfirmVote = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, candidateId: selectedCandidate.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                setShowConfirm(false);
                setSubmitting(false);
                return;
            }

            setSuccess(true);
            setSuccessMessage(data.message);
            setShowConfirm(false);
        } catch (err) {
            setError('Gagal mengirim suara. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div className="glass-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '12px' }}>
                        Tidak Dapat Memproses
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>{error}</p>
                    <Link href="/" className="btn btn-primary">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div className="vote-success">
                    <div className="vote-success-icon">✓</div>
                    <h2>Suara Anda Tercatat!</h2>
                    <p style={{ marginBottom: '8px' }}>{successMessage}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
                        Terima kasih telah berpartisipasi dalam pemilihan.
                    </p>
                    <Link href="/" className="btn btn-primary btn-lg">
                        Lihat Hasil Voting
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '24px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', paddingTop: '40px', marginBottom: '40px' }}>
                <div className="hero-badge">Pemilihan Umum 2026</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, marginBottom: '8px' }}>
                    Pilih Kandidat Anda
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                    Halo <strong style={{ color: 'var(--primary-light)' }}>{participant?.name}</strong>, silakan pilih satu kandidat di bawah ini.
                </p>
            </div>

            {/* Candidate Grid */}
            <div className="container">
                <div className="candidate-grid">
                    {candidates.map((candidate, index) => (
                        <div
                            key={candidate.id}
                            className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                            onClick={() => handleSelectCandidate(candidate)}
                            style={{ animation: `slideUp 0.5s ease forwards`, animationDelay: `${index * 0.1}s`, opacity: 0 }}
                        >
                            <div className="candidate-card-check">✓</div>
                            {candidate.photo ? (
                                <img src={candidate.photo} alt={candidate.name} className="candidate-card-photo" />
                            ) : (
                                <div className="candidate-card-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-card))' }}>
                                    👤
                                </div>
                            )}
                            <div className="candidate-card-body">
                                <div className="candidate-card-number">{candidate.orderNum || index + 1}</div>
                                <h3 className="candidate-card-name">{candidate.name}</h3>
                                {candidate.vision && (
                                    <div className="candidate-card-vision">
                                        <strong>Visi:</strong> {candidate.vision}
                                    </div>
                                )}
                                {candidate.mission && (
                                    <div className="candidate-card-vision" style={{ marginTop: '8px' }}>
                                        <strong>Misi:</strong> {candidate.mission}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && selectedCandidate && (
                <div className="modal-overlay" onClick={() => !submitting && setShowConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Konfirmasi Pilihan</h3>
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            {selectedCandidate.photo ? (
                                <img
                                    src={selectedCandidate.photo}
                                    alt={selectedCandidate.name}
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', border: '3px solid var(--gold)' }}
                                />
                            ) : (
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 16px' }}>
                                    👤
                                </div>
                            )}
                            <p style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                {selectedCandidate.name}
                            </p>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6' }}>
                            Apakah Anda yakin ingin memilih <strong style={{ color: 'var(--gold)' }}>{selectedCandidate.name}</strong>?
                            <br />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Pilihan tidak dapat diubah setelah dikonfirmasi.
                            </span>
                        </p>
                        <div className="modal-actions" style={{ justifyContent: 'center' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowConfirm(false)}
                                disabled={submitting}
                            >
                                Batal
                            </button>
                            <button
                                className="btn btn-gold btn-lg"
                                onClick={handleConfirmVote}
                                disabled={submitting}
                            >
                                {submitting ? 'Mengirim...' : '✓ Ya, Saya Yakin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
