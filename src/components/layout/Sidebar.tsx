'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, Scissors, UserCircle,
  DollarSign, Settings, ChevronDown, ChevronRight,
  LogOut, X, Zap,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agendamentos', icon: Calendar, label: 'Agendamentos' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/servicos', icon: Scissors, label: 'Serviços' },
  { href: '/profissionais', icon: UserCircle, label: 'Profissionais' },
  { href: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  {
    label: 'Configurações',
    icon: Settings,
    children: [
      { href: '/configuracoes/barbearia', label: 'Barbearia' },
      { href: '/configuracoes/agendamento', label: 'Agendamento' },
      { href: '/configuracoes/sistema', label: 'Sistema' },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(
    pathname.startsWith('/configuracoes') ? 'Configurações' : null
  );

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 20px',
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>
            <Scissors size={18} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'white', letterSpacing: '-0.02em' }}>
            BarberBook
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#64748B',
            cursor: 'pointer', display: 'flex',
          }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {NAV.map((item) => {
          if (item.children) {
            const isOpen = openGroup === item.label;
            const isActive = item.children.some(c => pathname === c.href);
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: '10px 12px', borderRadius: 8,
                    border: 'none', background: isActive ? 'rgba(99,102,241,0.15)' : 'none',
                    color: isActive ? '#818CF8' : '#64748B',
                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    marginBottom: 2, transition: 'all 0.15s',
                    justifyContent: 'flex-start',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                >
                  <item.icon size={18} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isOpen && (
                  <div style={{ paddingLeft: 16, marginBottom: 4 }}>
                    {item.children.map(child => {
                      const active = pathname === child.href;
                      return (
                        <Link key={child.href} href={child.href}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 12px', borderRadius: 6, marginBottom: 2,
                            fontSize: 13, fontWeight: 500,
                            background: active ? 'rgba(99,102,241,0.2)' : 'none',
                            color: active ? '#A5B4FC' : '#64748B',
                            transition: 'all 0.15s',
                            borderLeft: active ? '2px solid #6366F1' : '2px solid transparent',
                          }}
                        >
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: active ? '#6366F1' : '#374151',
                          }} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href!}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 14, fontWeight: 500,
                background: active ? 'rgba(99,102,241,0.15)' : 'none',
                color: active ? '#A5B4FC' : '#64748B',
                transition: 'all 0.15s',
                borderLeft: active ? '3px solid #6366F1' : '3px solid transparent',
                paddingLeft: active ? '9px' : '12px',
              }}
            >
              <item.icon size={18} />
              {item.label}
              {active && <div style={{ flex: 1 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Upgrade prompt */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Zap size={14} color="#818CF8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#A5B4FC' }}>Plano Gratuito</span>
          </div>
          <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>
            Faça upgrade para desbloquear todos os recursos.
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, border: 'none',
            background: 'none', color: '#64748B', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
            (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
          }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
