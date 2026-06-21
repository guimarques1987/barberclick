'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Bell, MessageSquare, Mail, Palette, Globe, Save, Loader2 } from 'lucide-react';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

const COLORS = [
  { name: 'Índigo',    value: '#6366F1' },
  { name: 'Violeta',   value: '#8B5CF6' },
  { name: 'Rosa',      value: '#EC4899' },
  { name: 'Âmbar',    value: '#F59E0B' },
  { name: 'Esmeralda', value: '#10B981' },
  { name: 'Céu',      value: '#0EA5E9' },
  { name: 'Coral',    value: '#EF4444' },
  { name: 'Ardósia',  value: '#64748B' },
];

export default function SistemaConfigPage() {
  const [config, setConfig] = useState({
    notifyNewBooking: true,
    notifyCancellation: true,
    notifyReminder: true,
    reminderHoursBefore: 24,
    whatsappEnabled: false,
    whatsappNumber: '',
    emailEnabled: true,
    emailFrom: '',
    primaryColor: '#6366F1',
    language: 'pt-BR',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/system')
      .then(r => r.json())
      .then(d => { if (d.data) setConfig(prev => ({ ...prev, ...d.data })); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/settings/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Config. do Sistema" subtitle="Notificações, aparência e preferências gerais" />
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 860 }}>
        {saved && <div className="alert alert-success" style={{ marginBottom: 24 }}>✅ Configurações salvas!</div>}

        {/* Notificações */}
        <div className="settings-section" style={{ marginBottom: 24 }}>
          <div className="settings-section-header">
            <div className="settings-section-icon"><Bell size={18} /></div>
            <div>
              <div className="settings-section-title">Notificações</div>
              <div className="settings-section-desc">Controle quando e como você é notificado</div>
            </div>
          </div>
          <div className="settings-body">
            {[
              { key: 'notifyNewBooking', label: 'Novo agendamento', desc: 'Notificar quando um novo agendamento for criado' },
              { key: 'notifyCancellation', label: 'Cancelamento', desc: 'Notificar quando um agendamento for cancelado' },
              { key: 'notifyReminder', label: 'Lembrete de agendamento', desc: 'Enviar lembrete para o cliente antes do horário' },
            ].map(item => (
              <div key={item.key} className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">{item.label}</div>
                  <div className="settings-row-desc">{item.desc}</div>
                </div>
                <div className="settings-row-control">
                  <Toggle checked={config[item.key as keyof typeof config] as boolean}
                    onChange={v => set(item.key as any, v)} />
                </div>
              </div>
            ))}
            {config.notifyReminder && (
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Enviar lembrete com</div>
                  <div className="settings-row-desc">Antecedência para enviar o lembrete ao cliente</div>
                </div>
                <div className="settings-row-control">
                  <div className="input-group">
                    <input type="number" className="form-control" style={{ width: 80 }}
                      value={config.reminderHoursBefore} min={1} max={72}
                      onChange={e => set('reminderHoursBefore', parseInt(e.target.value))} />
                    <span className="input-addon">horas antes</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="settings-section" style={{ marginBottom: 24 }}>
          <div className="settings-section-header">
            <div className="settings-section-icon"><MessageSquare size={18} /></div>
            <div>
              <div className="settings-section-title">WhatsApp</div>
              <div className="settings-section-desc">Envie notificações via WhatsApp</div>
            </div>
          </div>
          <div className="settings-body">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Notificações via WhatsApp</div>
                <div className="settings-row-desc">Requer integração com API do WhatsApp Business</div>
              </div>
              <div className="settings-row-control">
                <Toggle checked={config.whatsappEnabled} onChange={v => set('whatsappEnabled', v)} />
              </div>
            </div>
            {config.whatsappEnabled && (
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Número do WhatsApp</div>
                  <div className="settings-row-desc">Número com código do país (ex: +5511999999999)</div>
                </div>
                <div className="settings-row-control">
                  <input className="form-control" style={{ width: 200 }} value={config.whatsappNumber}
                    onChange={e => set('whatsappNumber', e.target.value)} placeholder="+5511999999999" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="settings-section" style={{ marginBottom: 24 }}>
          <div className="settings-section-header">
            <div className="settings-section-icon"><Mail size={18} /></div>
            <div>
              <div className="settings-section-title">Email</div>
              <div className="settings-section-desc">Configurações de envio de email</div>
            </div>
          </div>
          <div className="settings-body">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Notificações por email</div>
                <div className="settings-row-desc">Enviar emails de confirmação e lembrete</div>
              </div>
              <div className="settings-row-control">
                <Toggle checked={config.emailEnabled} onChange={v => set('emailEnabled', v)} />
              </div>
            </div>
            {config.emailEnabled && (
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-label">Email remetente</div>
                  <div className="settings-row-desc">Endereço de email que aparece para o cliente</div>
                </div>
                <div className="settings-row-control">
                  <input type="email" className="form-control" style={{ width: 220 }} value={config.emailFrom}
                    onChange={e => set('emailFrom', e.target.value)} placeholder="noreply@suabarbearia.com" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aparência */}
        <div className="settings-section" style={{ marginBottom: 24 }}>
          <div className="settings-section-header">
            <div className="settings-section-icon"><Palette size={18} /></div>
            <div>
              <div className="settings-section-title">Aparência</div>
              <div className="settings-section-desc">Personalize as cores e o idioma do sistema</div>
            </div>
          </div>
          <div className="settings-body">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Cor principal</div>
                <div className="settings-row-desc">Usada em botões, destaques e elementos ativos</div>
              </div>
              <div className="settings-row-control">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c.value}
                      className={`color-swatch ${config.primaryColor === c.value ? 'selected' : ''}`}
                      style={{ background: c.value }}
                      title={c.name}
                      onClick={() => set('primaryColor', c.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Idioma</div>
                <div className="settings-row-desc">Idioma do painel de controle</div>
              </div>
              <div className="settings-row-control">
                <select className="form-control" style={{ width: 160 }} value={config.language}
                  onChange={e => set('language', e.target.value)}>
                  <option value="pt-BR">🇧🇷 Português (BR)</option>
                  <option value="en-US">🇺🇸 English (US)</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}
            style={{ boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
            {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar configurações</>}
          </button>
        </div>
      </main>
    </div>
  );
}
