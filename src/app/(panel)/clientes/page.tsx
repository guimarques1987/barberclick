'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Plus, Search, Phone, Mail, MoreVertical, User, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) { const d = await res.json(); setClients(d.data || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Clientes" subtitle={`${clients.length} clientes cadastrados`} />
      <main style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input className="form-control search-input" placeholder="Buscar por nome, telefone ou email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Novo cliente
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Total visitas</th>
                <th>Última visita</th>
                <th>Status</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>Nenhum cliente encontrado</h3>
                    <p>Adicione seu primeiro cliente para começar.</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map((client: any) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm">
                          {client.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{client.name}</div>
                          {client.birthDate && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                          </div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {client.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={13} color="var(--text-muted)" />
                          {client.phone}
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {client.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={13} color="var(--text-muted)" />
                          {client.email}
                        </div>
                      ) : '—'}
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{client.totalVisits || 0}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {client.lastVisitAt
                        ? new Date(client.lastVisitAt).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge ${client.isBlocked ? 'badge-cancelled' : 'badge-completed'}`}>
                        {client.isBlocked ? 'Bloqueado' : 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm btn-icon"><MoreVertical size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      {showModal && <NewClientModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchClients(); }} />}
    </div>
  );
}

function NewClientModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Falha ao salvar cliente');
      toast.success('Cliente salvo com sucesso!');
      onSaved();
    } catch (e: any) { 
      toast.error(e.message || 'Erro inesperado.');
      console.error(e); 
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Novo Cliente</span>
          <button className="modal-close" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Nome completo<span className="required">*</span></label>
              <input className="form-control" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do cliente" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-control" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Data de nascimento</label>
              <input type="date" className="form-control" value={form.birthDate}
                onChange={e => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea className="form-control" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Preferências, alergias, etc." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Criar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
