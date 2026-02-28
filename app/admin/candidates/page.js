'use client';

import { useState, useEffect } from 'react';

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', vision: '', mission: '', orderNum: '' });
    const [photoFile, setPhotoFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchCandidates = async () => {
        try {
            const res = await fetch('/api/candidates');
            const data = await res.json();
            setCandidates(data);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCandidates(); }, []);

    const resetForm = () => {
        setFormData({ name: '', vision: '', mission: '', orderNum: '' });
        setPhotoFile(null);
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (candidate) => {
        setFormData({
            name: candidate.name,
            vision: candidate.vision || '',
            mission: candidate.mission || '',
            orderNum: candidate.orderNum?.toString() || '',
        });
        setEditingId(candidate.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('vision', formData.vision);
            data.append('mission', formData.mission);
            data.append('orderNum', formData.orderNum || '0');
            if (photoFile) data.append('photo', photoFile);

            const url = editingId ? `/api/candidates/${editingId}` : '/api/candidates';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: data });
            const result = await res.json();

            if (!res.ok) {
                setError(result.error || 'Gagal menyimpan');
                setSubmitting(false);
                return;
            }

            resetForm();
            fetchCandidates();
        } catch (err) {
            setError('Gagal menyimpan kandidat');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus kandidat ini?')) return;

        try {
            const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Gagal menghapus');
                return;
            }
            fetchCandidates();
        } catch (err) {
            alert('Gagal menghapus kandidat');
        }
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Kelola Kandidat</h1>
                    <p className="admin-subtitle">Tambah, edit, atau hapus kandidat pemilihan</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    + Tambah Kandidat
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => !submitting && resetForm()}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                        <h3 className="modal-title">{editingId ? 'Edit Kandidat' : 'Tambah Kandidat Baru'}</h3>

                        {error && (
                            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--primary-light)', fontSize: '13px', marginBottom: '16px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nama Kandidat *</label>
                                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama lengkap kandidat" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Foto Kandidat</label>
                                <input type="file" className="form-input" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} style={{ padding: '10px' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nomor Urut</label>
                                <input type="number" className="form-input" value={formData.orderNum} onChange={(e) => setFormData({ ...formData, orderNum: e.target.value })} placeholder="1" min="1" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Visi</label>
                                <textarea className="form-input" value={formData.vision} onChange={(e) => setFormData({ ...formData, vision: e.target.value })} placeholder="Visi kandidat" rows={3} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Misi</label>
                                <textarea className="form-input" value={formData.mission} onChange={(e) => setFormData({ ...formData, mission: e.target.value })} placeholder="Misi kandidat" rows={3} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={submitting}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kandidat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Candidates List */}
            {loading ? (
                <div className="loading-spinner"></div>
            ) : candidates.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👔</div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>Belum Ada Kandidat</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Tambahkan kandidat untuk memulai pemilihan</p>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Tambah Kandidat</button>
                </div>
            ) : (
                <div className="candidate-grid">
                    {candidates.map((candidate, index) => (
                        <div key={candidate.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                            {candidate.photo ? (
                                <img src={candidate.photo} alt={candidate.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-card))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
                                    👤
                                </div>
                            )}
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <div className="candidate-card-number" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                                        {candidate.orderNum || index + 1}
                                    </div>
                                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700 }}>{candidate.name}</h3>
                                </div>
                                {candidate.vision && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}><strong>Visi:</strong> {candidate.vision}</p>}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                    <span className="badge badge-info">{candidate._count?.votes || 0} suara</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(candidate)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(candidate.id)}>Hapus</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
