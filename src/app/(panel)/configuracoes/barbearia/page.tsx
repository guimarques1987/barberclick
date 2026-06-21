'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Building2, MapPin, Phone, Mail, Clock, Save, Loader2 } from 'lucide-react';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function BarbeariaConfigPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '',
    city: '', state: '', zipCode: '', description: '',
  });
  const [hours, setHours] = useState(
    DAYS.map((_, i) => ({
      dayOfWeek: i,
      isOpen: i !== 0, // Fechado no domingo por padrão
      openTime: '08:00',
      closeTime: '18:00',
      hasBreak: false,
      breakStart: '12:00',
      breakEnd: '13:00',
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/barbershop')
      .then(r => r.json())
      .then(d => { if (d.data) { setForm(d.data.barbershop || {}); if (d.data.hours?.length) setHours(d.data.hours); } })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function updateHour(index: number, key: string, value: any) {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [key]: value } : h));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings/barbershop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barbershop: form, hours }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Config. da Barbearia" subtitle="Informações e horários de funcionamento" />
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 860 }}>
        {saved && <div className="alert alert-success">✅ Configurações salvas com sucesso!</div>}

        <form onSubmit={handleSave}>
          {/* Informações básicas */}
          <div className="settings-section" style={{ marginBottom: 24 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon"><Building2 size={18} /></div>
              <div>
                <div className="settings-section-title">Informações da Barbearia</div>
                <div className="settings-section-desc">Dados que aparecem no perfil público</div>
              </div>
            </div>
            <div className="card-body" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Nome da barbearia<span className="required">*</span></label>
                <input className="form-control" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Barbearia do João" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-control" style={{ paddingLeft: 36 }} value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="email" className="form-control" style={{ paddingLeft: 36 }} value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contato@barbearia.com" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Endereço</label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro" />
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-control" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })} placeholder="São Paulo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <input className="form-control" value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })} placeholder="SP" maxLength={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input className="form-control" value={form.zipCode}
                    onChange={e => setForm({ ...form, zipCode: e.target.value })} placeholder="00000-000" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-control" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Uma breve descrição sobre sua barbearia..." />
              </div>
            </div>
          </div>

          {/* Horários de funcionamento */}
          <div className="settings-section" style={{ marginBottom: 24 }}>
            <div className="settings-section-header">
              <div className="settings-section-icon"><Clock size={18} /></div>
              <div>
                <div className="settings-section-title">Horários de Funcionamento</div>
                <div className="settings-section-desc">Configure os dias e horários de atendimento</div>
              </div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {hours.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 24px',
                  borderBottom: i < hours.length - 1 ? '1px solid var(--border)' : 'none',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ width: 90, fontWeight: 500, fontSize: 14 }}>{DAYS[i]}</div>
                  <label className="toggle" style={{ marginLeft: 0 }}>
                    <input type="checkbox" checked={h.isOpen} onChange={e => updateHour(i, 'isOpen', e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: 13, color: h.isOpen ? 'var(--success)' : 'var(--text-muted)', width: 60 }}>
                    {h.isOpen ? 'Aberto' : 'Fechado'}
                  </span>
                  {h.isOpen && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="time" className="form-control" style={{ width: 110 }}
                          value={h.openTime} onChange={e => updateHour(i, 'openTime', e.target.value)} />
                        <span style={{ color: 'var(--text-muted)' }}>até</span>
                        <input type="time" className="form-control" style={{ width: 110 }}
                          value={h.closeTime} onChange={e => updateHour(i, 'closeTime', e.target.value)} />
                      </div>
                      <label className="checkbox-group" style={{ marginLeft: 8 }}>
                        <input type="checkbox" checked={h.hasBreak}
                          onChange={e => updateHour(i, 'hasBreak', e.target.checked)} />
                        <span style={{ fontSize: 13 }}>Pausa</span>
                      </label>
                      {h.hasBreak && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="time" className="form-control" style={{ width: 100 }}
                            value={h.breakStart} onChange={e => updateHour(i, 'breakStart', e.target.value)} />
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>–</span>
                          <input type="time" className="form-control" style={{ width: 100 }}
                            value={h.breakEnd} onChange={e => updateHour(i, 'breakEnd', e.target.value)} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}
              style={{ boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
              {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar configurações</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
