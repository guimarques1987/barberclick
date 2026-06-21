'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Plus, Search, Pencil, Trash2, Clock, DollarSign, XCircle, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function ServicosPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      if (res.ok) { const d = await res.json(); setServices(d.data || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = services.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Serviços" subtitle={`${services.length} serviços cadastrados`} />
      <main style={{ flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input className="form-control search-input" placeholder="Buscar serviço..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
            <Plus size={16} /> Novo serviço
          </button>
        </div>

        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✂️</div>
            <h3>Nenhum serviço cadastrado</h3>
            <p>Adicione seus serviços para que os clientes possam agendar.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((svc: any) => (
              <div key={svc.id} style={{
                background: 'white', border: '1px solid var(--border)',
                borderRadius: 12, padding: 20,
                transition: 'all 0.2s', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: svc.isActive ? 'var(--primary)' : 'var(--border)',
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'var(--primary-bg)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Tag size={20} color="var(--primary)" />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => { setEditItem(svc); setShowModal(true); }}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{svc.name}</h4>
                {svc.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.4 }}>{svc.description}</p>}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Clock size={14} color="var(--primary)" />
                    {svc.durationMinutes} min
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    <DollarSign size={14} color="var(--success)" />
                    R$ {parseFloat(svc.price).toFixed(2)}
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <span className={`badge ${svc.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                    {svc.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  {svc.isOnlineAvailable && (
                    <span className="badge badge-confirmed" style={{ marginLeft: 6 }}>Online</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {showModal && (
        <ServiceModal
          item={editItem}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchServices(); }}
        />
      )}
    </div>
  );
}

function ServiceModal({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    durationMinutes: item?.durationMinutes || 30,
    isActive: item?.isActive ?? true,
    isOnlineAvailable: item?.isOnlineAvailable ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = item ? 'PUT' : 'POST';
      const url = item ? `/api/services/${item.id}` : '/api/services';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Falha ao salvar serviço');
      toast.success('Serviço salvo com sucesso!');
      onSaved();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar serviço.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{item ? 'Editar serviço' : 'Novo serviço'}</span>
          <button className="modal-close" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Nome do serviço<span className="required">*</span></label>
              <input className="form-control" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Corte Degradê" />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea className="form-control" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição do serviço..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Preço (R$)<span className="required">*</span></label>
                <input type="number" step="0.01" min="0" className="form-control" required
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0,00" />
              </div>
              <div className="form-group">
                <label className="form-label">Duração (minutos)<span className="required">*</span></label>
                <select className="form-control" value={form.durationMinutes}
                  onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}>
                  {[15, 20, 30, 45, 60, 75, 90, 120].map(m => (
                    <option key={m} value={m}>{m} minutos</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <label className="checkbox-group">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Serviço ativo
              </label>
              <label className="checkbox-group">
                <input type="checkbox" checked={form.isOnlineAvailable} onChange={e => setForm({ ...form, isOnlineAvailable: e.target.checked })} />
                Disponível online
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : item ? 'Salvar alterações' : 'Criar serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
