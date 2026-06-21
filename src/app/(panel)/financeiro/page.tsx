'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { DollarSign, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTransactions(); }, []);

  async function fetchTransactions() {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) { const d = await res.json(); setTransactions(d.data || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const balance = income - expense;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header title="Financeiro" subtitle="Controle de caixa e faturamento" />
      <main style={{ flex: 1, padding: '28px 32px' }}>
        {/* Summary cards */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          {[
            { label: 'Receitas', value: income, icon: TrendingUp, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Despesas', value: expense, icon: TrendingDown, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Saldo', value: balance, icon: DollarSign, color: balance >= 0 ? '#6366F1' : '#EF4444', bg: balance >= 0 ? '#EEF2FF' : '#FEF2F2' },
          ].map(card => (
            <div key={card.label} className="stat-card">
              <div className="stat-icon" style={{ background: card.bg }}>
                <card.icon size={22} color={card.color} />
              </div>
              <div className="stat-content">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value" style={{ color: card.color }}>
                  R$ {Math.abs(card.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Lançamentos</div>
            <button className="btn btn-primary btn-sm"><Plus size={14} /> Novo lançamento</button>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Método</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                    ))}</tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">💰</div>
                      <h3>Nenhum lançamento</h3>
                      <p>Os lançamentos de agendamentos concluídos aparecerão aqui.</p>
                    </div>
                  </td></tr>
                ) : (
                  transactions.map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(t.transactionAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ fontWeight: 500 }}>{t.description || '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.category || '—'}</td>
                      <td style={{ fontSize: 13 }}>{t.paymentMethod || '—'}</td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'badge-completed' : 'badge-cancelled'}`}>
                          {t.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'income' ? '+' : '-'} R$ {parseFloat(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
