'use client';
import { Bell, Menu, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <button
        onClick={onMenuClick}
        style={{
          display: 'none', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-secondary)', padding: 4,
        }}
        className="mobile-menu-btn"
      >
        <Menu size={22} />
      </button>

      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span className="notif-dot" />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px 6px 6px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'var(--transition)',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div className="avatar avatar-sm" style={{ fontSize: 11 }}>
            {initials}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0] || 'Usuário'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {(user as any)?.role === 'owner' ? 'Proprietário' : 'Barbeiro'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
