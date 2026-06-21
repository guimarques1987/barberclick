'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Plus, UserCircle, Scissors, Clock, XCircle, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ProfissionaisPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchStaff(); }, []);

  async function fetchStaff() {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) { const d = await res.json(); setStaff(d.data || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Profissionais" subtitle={`${staff.length} profissional(is) cadastrado(s)`} />
      <main style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Novo profissional
          </button>
        </div>

        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍💼</div>
            <h3>Nenhum profissional cadastrado</h3>
            <p>Adicione os barbeiros da sua equipe.</p>
          </div>
        ) : (
          <div className="grid-3">
            {staff.map((member: any) => (
              <div key={member.id} className="card" style={{ transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-lg">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{member.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {member.role === 'owner' ? 'Proprietário' : member.role === 'admin' ? 'Admin' : 'Barbeiro'}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-icon"><MoreVertical size={16} /></button>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {DAYS.map((d, i) => (
                      <div key={i} className="day-pill active" style={{ fontSize: 10, width: 28, height: 28 }}>
                        {d.substring(0, 1)}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color="var(--primary)" />
                      08:00–18:00
                    </span>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <span className={`badge ${member.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                      {member.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewStaffModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchStaff(); }} />
      )}
    </div>
  );
}

function NewStaffModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'barber', password: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Falha ao salvar profissional');
      toast.success('Profissional salvo com sucesso!');
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
          <span className="modal-title">Novo Profissional</span>
          <button className="modal-close" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Nome completo<span className="required">*</span></label>
              <input className="form-control" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do profissional" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email<span className="required">*</span></label>
                <input type="email" className="form-control" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-control" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Função</label>
                <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="barber">Barbeiro</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Proprietário</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Senha de acesso<span className="required">*</span></label>
                <input type="password" className="form-control" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Criar profissional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
