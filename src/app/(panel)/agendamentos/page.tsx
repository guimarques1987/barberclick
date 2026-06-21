'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import {
  Plus, Search, Filter, Calendar, Clock, User, Scissors,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle,
  MoreVertical, Phone, Edit2, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_MAP: Record<string, { label: string; css: string }> = {
  pending:     { label: 'Pendente',        css: 'badge-pending' },
  confirmed:   { label: 'Confirmado',      css: 'badge-confirmed' },
  in_progress: { label: 'Atendendo',       css: 'badge-in_progress' },
  completed:   { label: 'Concluído',       css: 'badge-completed' },
  cancelled:   { label: 'Cancelado',       css: 'badge-cancelled' },
  no_show:     { label: 'Não compareceu',  css: 'badge-no_show' },
};

export default function AgendamentosPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { fetchAppointments(); }, []);

  async function fetchAppointments() {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) { const d = await res.json(); setAppointments(d.data || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = appointments.filter(a => {
    const matchSearch = !search || (a.clientName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function prevDay() { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); }
  function nextDay() { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Agendamentos" subtitle="Gerencie todos os seus agendamentos" />

      <main style={{ flex: 1, padding: '28px 32px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="search-wrapper" style={{ flex: 1, minWidth: 220 }}>
            <Search size={16} className="search-icon" />
            <input
              className="form-control search-input"
              placeholder="Buscar por cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            className="form-control"
            style={{ width: 180 }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* View toggle */}
          <div style={{
            display: 'flex', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden',
          }}>
            {(['list', 'calendar'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 14px', border: 'none',
                background: view === v ? 'var(--primary)' : 'white',
                color: view === v ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s',
              }}>
                {v === 'list' ? <><Filter size={14} /> Lista</> : <><Calendar size={14} /> Calendário</>}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Novo agendamento
          </button>
        </div>

        {/* Calendar navigation */}
        {view === 'calendar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={prevDay}><ChevronLeft size={16} /></button>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={nextDay}><ChevronRight size={16} /></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date())}>Hoje</button>
          </div>
        )}

        {/* Content */}
        {view === 'list' ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Profissional</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>Nenhum agendamento encontrado</h3>
                        <p>Crie um novo agendamento clicando no botão acima.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt: any) => (
                    <tr key={appt.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(appt.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(appt.startAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm" style={{ fontSize: 10, flexShrink: 0 }}>
                            {(appt.clientName || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{appt.clientName || '—'}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{appt.clientPhone || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>{appt.serviceName || '—'}</td>
                      <td>{appt.userName || '—'}</td>
                      <td style={{ fontWeight: 600 }}>
                        {appt.finalPrice ? `R$ ${parseFloat(appt.finalPrice).toFixed(2)}` : '—'}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_MAP[appt.status]?.css || 'badge-pending'}`}>
                          {STATUS_MAP[appt.status]?.label || appt.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm btn-icon">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Calendar view */
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 0 }}>
                {/* Time slots */}
                {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                  <div key={hour} style={{ display: 'contents' }}>
                    <div style={{
                      padding: '0 12px 0 0', textAlign: 'right',
                      fontSize: 12, color: 'var(--text-muted)',
                      height: 72, display: 'flex', alignItems: 'flex-start',
                      paddingTop: 8, borderRight: '1px solid var(--border)',
                    }}>
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div style={{
                      height: 72, borderBottom: '1px solid var(--border)',
                      padding: '4px 8px', position: 'relative',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {filtered.filter(a => new Date(a.startAt).getHours() === hour &&
                        new Date(a.startAt).toDateString() === currentDate.toDateString()
                      ).map(a => (
                        <div key={a.id} className={`cal-event ${a.status}`} style={{ marginBottom: 4 }}>
                          {new Date(a.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {a.clientName || 'Cliente'} · {a.serviceName || 'Serviço'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Appointment Modal */}
      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchAppointments(); }} />}
    </div>
  );
}

function NewAppointmentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', serviceName: '',
    startAt: '', notes: '', status: 'confirmed',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startAt) {
      toast.error('A data e horário são obrigatórios.');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Falha ao salvar o agendamento');
      
      toast.success('Agendamento criado com sucesso!');
      onSaved();
    } catch (e: any) { 
      toast.error(e.message || 'Ocorreu um erro inesperado.');
      console.error(e); 
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Novo Agendamento</span>
          <button className="modal-close" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nome do cliente<span className="required">*</span></label>
                <input className="form-control" required value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Nome completo" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-control" value={form.clientPhone}
                  onChange={e => setForm({ ...form, clientPhone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Serviço</label>
              <input className="form-control" value={form.serviceName}
                onChange={e => setForm({ ...form, serviceName: e.target.value })} placeholder="Ex: Corte + Barba" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Data e horário<span className="required">*</span></label>
                <input type="datetime-local" className="form-control" required value={form.startAt}
                  onChange={e => setForm({ ...form, startAt: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  {Object.entries(STATUS_MAP).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea className="form-control" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observações do cliente..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Criar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
