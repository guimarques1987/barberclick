import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { appointments, clients, transactions } from '@/lib/schema';
import { eq, and, gte, lte, sql, count, sum } from 'drizzle-orm';
import Header from '@/components/layout/Header';
import {
  Calendar, Users, DollarSign, TrendingUp,
  Clock, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';

async function getDashboardData(barbershopId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayAppts, monthAppts, totalClients, monthRevenue] = await Promise.all([
    db.select({ count: count() }).from(appointments)
      .where(and(eq(appointments.barbershopId, barbershopId), gte(appointments.startAt, today), lte(appointments.startAt, todayEnd))),
    db.select({ count: count() }).from(appointments)
      .where(and(eq(appointments.barbershopId, barbershopId), gte(appointments.startAt, monthStart))),
    db.select({ count: count() }).from(clients)
      .where(eq(clients.barbershopId, barbershopId)),
    db.select({ total: sum(transactions.amount) }).from(transactions)
      .where(and(eq(transactions.barbershopId, barbershopId), gte(transactions.transactionAt, monthStart), eq(transactions.type, 'income'))),
  ]);

  // Últimos 7 agendamentos do dia
  const todayList = await db.select().from(appointments)
    .where(and(eq(appointments.barbershopId, barbershopId), gte(appointments.startAt, today), lte(appointments.startAt, todayEnd)))
    .limit(8)
    .orderBy(appointments.startAt);

  return {
    todayCount: todayAppts[0]?.count ?? 0,
    monthCount: monthAppts[0]?.count ?? 0,
    totalClients: totalClients[0]?.count ?? 0,
    monthRevenue: parseFloat(monthRevenue[0]?.total ?? '0'),
    todayList,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const barbershopId = (session?.user as any)?.barbershopId;

  let data = { todayCount: 0, monthCount: 0, totalClients: 0, monthRevenue: 0, todayList: [] as any[] };
  if (barbershopId) {
    data = await getDashboardData(barbershopId);
  }

  const stats = [
    {
      label: 'Agendamentos hoje',
      value: data.todayCount,
      icon: Calendar,
      color: '#6366F1',
      bg: '#EEF2FF',
      change: '+12%',
      up: true,
    },
    {
      label: 'Total este mês',
      value: data.monthCount,
      icon: TrendingUp,
      color: '#10B981',
      bg: '#ECFDF5',
      change: '+8%',
      up: true,
    },
    {
      label: 'Clientes cadastrados',
      value: data.totalClients,
      icon: Users,
      color: '#3B82F6',
      bg: '#EFF6FF',
      change: '+5 novos',
      up: true,
    },
    {
      label: 'Faturamento mensal',
      value: `R$ ${data.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: '#F59E0B',
      bg: '#FFFBEB',
      change: '+15%',
      up: true,
    },
  ];

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending:     { label: 'Pendente',     color: '#F59E0B', icon: AlertCircle },
    confirmed:   { label: 'Confirmado',   color: '#3B82F6', icon: CheckCircle2 },
    completed:   { label: 'Concluído',    color: '#10B981', icon: CheckCircle2 },
    cancelled:   { label: 'Cancelado',    color: '#EF4444', icon: XCircle },
    in_progress: { label: 'Em atendimento', color: '#8B5CF6', icon: Clock },
    no_show:     { label: 'Não compareceu', color: '#F59E0B', icon: XCircle },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Dashboard" subtitle={`Bem-vindo! Hoje é ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`} />

      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1400, width: '100%' }}>
        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
                  {stat.up ? '↑' : '↓'} {stat.change} este mês
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Today's appointments */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Agendamentos de Hoje</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {data.todayCount} agendamento{data.todayCount !== 1 ? 's' : ''} programado{data.todayCount !== 1 ? 's' : ''}
                </div>
              </div>
              <a href="/agendamentos" className="btn btn-secondary btn-sm">Ver todos</a>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {data.todayList.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px 24px' }}>
                  <div className="empty-state-icon">📅</div>
                  <h3>Nenhum agendamento hoje</h3>
                  <p>Clique em &quot;Novo agendamento&quot; para adicionar.</p>
                </div>
              ) : (
                <div>
                  {data.todayList.map((appt: any, i: number) => {
                    const sc = statusConfig[appt.status] || statusConfig.pending;
                    return (
                      <div key={appt.id} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 24px',
                        borderBottom: i < data.todayList.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: '#EEF2FF', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Clock size={18} color="#6366F1" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {new Date(appt.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {appt.status}
                          </div>
                        </div>
                        <span className={`badge badge-${appt.status}`}>{sc.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions + info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Ações Rápidas</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/agendamentos/novo', label: '+ Novo agendamento', primary: true },
                  { href: '/clientes/novo', label: '+ Novo cliente', primary: false },
                  { href: '/servicos', label: '✂️ Gerenciar serviços', primary: false },
                  { href: '/configuracoes/agendamento', label: '⚙️ Configurações', primary: false },
                ].map(a => (
                  <a key={a.href} href={a.href} className={`btn ${a.primary ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', width: '100%' }}>
                    {a.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Status do Sistema</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Agendamento online', ok: true },
                  { label: 'Notificações', ok: true },
                  { label: 'Banco de dados', ok: true },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 500,
                      color: s.ok ? 'var(--success)' : 'var(--danger)',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: s.ok ? 'var(--success)' : 'var(--danger)',
                        display: 'inline-block',
                      }} />
                      {s.ok ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
