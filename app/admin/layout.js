'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/candidates', label: 'Kandidat', icon: '👔' },
    { href: '/admin/participants', label: 'Peserta', icon: '👥' },
    { href: '/admin/scan', label: 'QR Scanner', icon: '📷' },
];

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check');
                if (!res.ok) {
                    router.push('/admin/login');
                    return;
                }
            } catch {
                router.push('/admin/login');
                return;
            }
            setChecking(false);
        };

        if (pathname !== '/admin/login') {
            checkAuth();
        } else {
            setChecking(false);
        }
    }, [pathname, router]);

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (checking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    return (
        <div className="admin-layout">
            {/* Mobile Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: 'fixed', top: '16px', left: '16px', zIndex: 60,
                    display: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text-primary)',
                    cursor: 'pointer', fontSize: '20px',
                }}
                className="mobile-menu-btn"
            >
                ☰
            </button>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <Link href="/" className="admin-sidebar-brand">
                    <div className="admin-sidebar-brand-icon">🗳️</div>
                    <span className="admin-sidebar-brand-text">E-Voting</span>
                </Link>

                <nav>
                    <ul className="admin-sidebar-nav">
                        {sidebarLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`admin-sidebar-link ${pathname === link.href ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className="admin-sidebar-link-icon">{link.icon}</span>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0', padding: '0 20px' }}>
                    <Link href="/" className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: '8px', justifyContent: 'center' }}>
                        🌐 Lihat Publik
                    </Link>
                    <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'none' }}
                    className="sidebar-overlay"
                ></div>
            )}

            {/* Main Content */}
            <main className="admin-main">
                {children}
            </main>

            <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
        </div>
    );
}
