'use client';

import { useState, useEffect } from 'react';

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [organization, setOrganization] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [qrModal, setQrModal] = useState(null);
    const [error, setError] = useState('');

    const fetchParticipants = async () => {
        try {
            const res = await fetch(`/api/participants?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
            const data = await res.json();
            setParticipants(data.participants || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch participants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchParticipants(); }, [page, search]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, organization }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
                setSubmitting(false);
                return;
            }
            setName('');
            setOrganization('');
            setShowForm(false);
            fetchParticipants();
        } catch (err) {
            setError('Gagal menambahkan peserta');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus peserta ini?')) return;
        try {
            const res = await fetch(`/api/participants/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error);
                return;
            }
            fetchParticipants();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    const showQR = async (id) => {
        try {
            const res = await fetch(`/api/participants/${id}/qr`);
            const data = await res.json();
            if (!res.ok) {
                alert(data.error);
                return;
            }
            setQrModal(data);
        } catch (err) {
            alert('Gagal generate QR');
        }
    };

    const totalPages = Math.ceil(total / 20);

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Kelola Peserta</h1>
                    <p className="admin-subtitle">Total: {total} peserta</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    + Tambah Peserta
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Cari peserta berdasarkan nama atau organisasi..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {/* Add Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => !submitting && setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Tambah Peserta Baru</h3>
                        {error && (
                            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--primary-light)', fontSize: '13px', marginBottom: '16px' }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label className="form-label">Nama Peserta *</label>
                                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Organisasi / Divisi</label>
                                <input type="text" className="form-input" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Contoh: Divisi Humas" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Menyimpan...' : 'Tambah Peserta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {qrModal && (
                <div className="modal-overlay" onClick={() => setQrModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <h3 className="modal-title">QR Code — {qrModal.name}</h3>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '20px', display: 'inline-block', margin: '16px 0' }}>
                            <img src={qrModal.qrCode} alt={`QR Code ${qrModal.name}`} style={{ width: '250px', height: '250px' }} />
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: '8px' }}>
                            {qrModal.url}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Token: {qrModal.token}
                        </p>
                        <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
                            <a href={qrModal.qrCode} download={`QR_${qrModal.name}.png`} className="btn btn-primary">
                                📥 Download QR
                            </a>
                            <button className="btn btn-secondary" onClick={() => setQrModal(null)}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="loading-spinner"></div>
            ) : participants.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>Belum Ada Peserta</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Tambahkan peserta untuk memulai</p>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Peserta</button>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nama</th>
                                    <th>Organisasi</th>
                                    <th>Status</th>
                                    <th>Pilihan</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, index) => (
                                    <tr key={p.id}>
                                        <td>{(page - 1) * 20 + index + 1}</td>
                                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                                        <td>{p.organization || '-'}</td>
                                        <td>
                                            {p.hasVoted ? (
                                                <span className="badge badge-success">Sudah Voting</span>
                                            ) : p.registered ? (
                                                <span className="badge badge-warning">Terdaftar</span>
                                            ) : (
                                                <span className="badge badge-danger">Belum Daftar</span>
                                            )}
                                        </td>
                                        <td>{p.vote?.candidate?.name || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-gold btn-sm" onClick={() => showQR(p.id)}>QR</button>
                                                {!p.hasVoted && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Hapus</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                ← Sebelumnya
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Halaman {page} dari {totalPages}
                            </span>
                            <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                Selanjutnya →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
