'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import {
  Clock, Calendar, Ban, RefreshCw, Globe, CreditCard,
  Users, Bell, ClipboardList, Settings2, Save, Loader2,
} from 'lucide-react';

interface SchedulingConfig {
  bookingWindowDays: number;
  minAdvanceMinutes: number;
  allowClientCancel: boolean;
  cancelLimitHours: number;
  requireConfirmation: boolean;
  autoConfirmMinutes: number;
  slotDurationMinutes: number;
  breakBetweenMinutes: number;
  maxBookingsPerDay: number | null;
  maxBookingsPerSlot: number;
  onlineBookingEnabled: boolean;
  onlineBookingUrlSlug: string;
  requirePaymentOnline: boolean;
  depositPercent: number;
  waitlistEnabled: boolean;
  allowReschedule: boolean;
  rescheduleLimitHours: number;
  askClientNotes: boolean;
  requireClientPhone: boolean;
}

const DEFAULT: SchedulingConfig = {
  bookingWindowDays: 30,
  minAdvanceMinutes: 60,
  allowClientCancel: true,
  cancelLimitHours: 2,
  requireConfirmation: false,
  autoConfirmMinutes: 0,
  slotDurationMinutes: 30,
  breakBetweenMinutes: 0,
  maxBookingsPerDay: null,
  maxBookingsPerSlot: 1,
  onlineBookingEnabled: true,
  onlineBookingUrlSlug: '',
  requirePaymentOnline: false,
  depositPercent: 0,
  waitlistEnabled: false,
  allowReschedule: true,
  rescheduleLimitHours: 2,
  askClientNotes: true,
  requireClientPhone: true,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function NumberInput({ value, onChange, min = 0, max, unit }: {
  value: number | null; onChange: (v: number) => void; min?: number; max?: number; unit?: string;
}) {
  return (
    <div className="input-group">
      <input
        type="number"
        className="form-control"
        style={{ width: 80 }}
        value={value ?? ''}
        min={min}
        max={max}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
      />
      {unit && <span className="input-addon">{unit}</span>}
    </div>
  );
}

export default function AgendamentoConfigPage() {
  const [config, setConfig] = useState<SchedulingConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/scheduling')
      .then(r => r.json())
      .then(d => { if (d.data) setConfig({ ...DEFAULT, ...d.data }); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof SchedulingConfig>(key: K, value: SchedulingConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/settings/scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  const sections = [
    {
      title: 'Agendamento Online',
      desc: 'Configure o link público de agendamento para seus clientes',
      icon: Globe,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Agendamento online</div>
              <div className="settings-row-desc">Permite que clientes agendem sem precisar ligar</div>
            </div>
            <div className="settings-row-control">
              <Toggle checked={config.onlineBookingEnabled} onChange={v => set('onlineBookingEnabled', v)} />
            </div>
          </div>
          {config.onlineBookingEnabled && (
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Link público (slug)</div>
                <div className="settings-row-desc">
                  URL: <strong>{process.env.NEXT_PUBLIC_APP_URL}/b/{config.onlineBookingUrlSlug || 'sua-barbearia'}</strong>
                </div>
              </div>
              <div className="settings-row-control">
                <div className="input-group">
                  <span className="input-addon" style={{ borderRight: 'none', borderRadius: 'var(--radius) 0 0 var(--radius)' }}>
                    /b/
                  </span>
                  <input
                    className="form-control"
                    style={{ width: 180, borderRadius: '0 var(--radius) var(--radius) 0' }}
                    value={config.onlineBookingUrlSlug}
                    onChange={e => set('onlineBookingUrlSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="minha-barbearia"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: 'Janela de Agendamento',
      desc: 'Defina quando os clientes podem agendar',
      icon: Calendar,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Agendar com até</div>
              <div className="settings-row-desc">Quantos dias à frente o cliente pode agendar</div>
            </div>
            <div className="settings-row-control">
              <NumberInput value={config.bookingWindowDays} onChange={v => set('bookingWindowDays', v)} min={1} max={365} unit="dias" />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Antecedência mínima</div>
              <div className="settings-row-desc">Tempo mínimo de antecedência para agendar</div>
            </div>
            <div className="settings-row-control">
              <NumberInput value={config.minAdvanceMinutes} onChange={v => set('minAdvanceMinutes', v)} min={0} unit="minutos" />
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Slots de Tempo',
      desc: 'Configure a duração dos horários disponíveis',
      icon: Clock,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Duração dos slots</div>
              <div className="settings-row-desc">Intervalo entre os horários disponíveis no calendário</div>
            </div>
            <div className="settings-row-control">
              <select className="form-control" style={{ width: 140 }} value={config.slotDurationMinutes}
                onChange={e => set('slotDurationMinutes', parseInt(e.target.value))}>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Intervalo entre atendimentos</div>
              <div className="settings-row-desc">Tempo de descanso entre um cliente e outro</div>
            </div>
            <div className="settings-row-control">
              <NumberInput value={config.breakBetweenMinutes} onChange={v => set('breakBetweenMinutes', v)} min={0} unit="minutos" />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Máximo de agendamentos por dia</div>
              <div className="settings-row-desc">Deixe em branco para sem limite</div>
            </div>
            <div className="settings-row-control">
              <input type="number" className="form-control" style={{ width: 100 }}
                value={config.maxBookingsPerDay ?? ''}
                placeholder="Sem limite"
                min={1}
                onChange={e => set('maxBookingsPerDay', e.target.value ? parseInt(e.target.value) : null)} />
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Confirmação de Agendamento',
      desc: 'Defina se agendamentos precisam de aprovação manual',
      icon: Settings2,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Exigir confirmação manual</div>
              <div className="settings-row-desc">Você precisa confirmar cada agendamento antes de aparecer como confirmado</div>
            </div>
            <div className="settings-row-control">
              <Toggle checked={config.requireConfirmation} onChange={v => set('requireConfirmation', v)} />
            </div>
          </div>
          {config.requireConfirmation && (
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Confirmar automaticamente após</div>
                <div className="settings-row-desc">0 = nunca confirma automaticamente</div>
              </div>
              <div className="settings-row-control">
                <NumberInput value={config.autoConfirmMinutes} onChange={v => set('autoConfirmMinutes', v)} min={0} unit="minutos" />
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: 'Cancelamento',
      desc: 'Configure as regras de cancelamento pelo cliente',
      icon: Ban,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Permitir cancelamento pelo cliente</div>
              <div className="settings-row-desc">O cliente pode cancelar o agendamento pelo link</div>
            </div>
            <div className="settings-row-control">
              <Toggle checked={config.allowClientCancel} onChange={v => set('allowClientCancel', v)} />
            </div>
          </div>
          {config.allowClientCancel && (
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Cancelar com até</div>
                <div className="settings-row-desc">Prazo mínimo para o cliente poder cancelar</div>
              </div>
              <div className="settings-row-control">
                <NumberInput value={config.cancelLimitHours} onChange={v => set('cancelLimitHours', v)} min={0} unit="horas antes" />
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: 'Reagendamento',
      desc: 'Configure as regras de reagendamento pelo cliente',
      icon: RefreshCw,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Permitir reagendamento</div>
              <div className="settings-row-desc">O cliente pode solicitar uma mudança de horário</div>
            </div>
            <div className="settings-row-control">
              <Toggle checked={config.allowReschedule} onChange={v => set('allowReschedule', v)} />
            </div>
          </div>
          {config.allowReschedule && (
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Reagendar com até</div>
                <div className="settings-row-desc">Prazo mínimo para solicitar reagendamento</div>
              </div>
              <div className="settings-row-control">
                <NumberInput value={config.rescheduleLimitHours} onChange={v => set('rescheduleLimitHours', v)} min={0} unit="horas antes" />
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: 'Lista de Espera',
      desc: 'Permita que clientes entrem na fila quando não há vagas',
      icon: Users,
      content: (
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Habilitar lista de espera</div>
            <div className="settings-row-desc">Clientes são notificados automaticamente quando um horário abre</div>
          </div>
          <div className="settings-row-control">
            <Toggle checked={config.waitlistEnabled} onChange={v => set('waitlistEnabled', v)} />
          </div>
        </div>
      ),
    },
    {
      title: 'Pagamento Online',
      desc: 'Configure a cobrança de depósito ou pagamento antecipado',
      icon: CreditCard,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Exigir pagamento online</div>
              <div className="settings-row-desc">Cliente paga na hora de agendar</div>
            </div>
            <div className="settings-row-control">
              <Toggle checked={config.requirePaymentOnline} onChange={v => set('requirePaymentOnline', v)} />
            </div>
          </div>
          {config.requirePaymentOnline && (
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">Percentual de depósito</div>
                <div className="settings-row-desc">0 = valor total; menos de 100 = apenas depósito</div>
              </div>
              <div className="settings-row-control">
                <NumberInput value={config.depositPercent} onChange={v => set('depositPercent', v)} min={0} max={100} unit="%" />
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      title: 'Formulário do Cliente',
      desc: 'Campos exibidos no formulário de agendamento público',
      icon: ClipboardList,
      content: (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Solicitar observações</div>
              <div className="settings-row-desc">Campo de texto livre para o cliente informar preferências</div>
            </div>
            <div className="settings-row-control">
              <Toggle checked={config.askClientNotes} onChange={v => set('askClientNotes', v)} />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-label">Telefone obrigatório</div>
              <div className="settings-row-desc">Exige telefone de contato no agendamento</div>
            </div>
            <div className="settings-row-control">
              <Toggle checked={config.requireClientPhone} onChange={v => set('requireClientPhone', v)} />
            </div>
          </div>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header title="Config. de Agendamento" />
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: 800 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16, borderRadius: 12 }} />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Config. de Agendamento" subtitle="Personalize como os agendamentos funcionam na sua barbearia" />

      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 860 }}>
        {/* Save success alert */}
        {saved && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            ✅ Configurações salvas com sucesso!
          </div>
        )}

        {sections.map((section) => (
          <div key={section.title} className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <section.icon size={18} />
              </div>
              <div>
                <div className="settings-section-title">{section.title}</div>
                <div className="settings-section-desc">{section.desc}</div>
              </div>
            </div>
            <div className="settings-body">
              {section.content}
            </div>
          </div>
        ))}

        {/* Save button */}
        <div style={{
          position: 'sticky', bottom: 24,
          display: 'flex', justifyContent: 'flex-end',
          marginTop: 8,
        }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={saving}
            style={{ boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /> Salvando...</>
            ) : (
              <><Save size={18} /> Salvar configurações</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
