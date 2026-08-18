import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Lock, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Statement row component ───────────────────────────────────────────────────
const StatementRow = ({ title, date, size, type = 'PDF', onDownload }) => {
  const [status, setStatus] = useState('idle'); // idle | downloading | done

  const handleDownload = () => {
    if (status !== 'idle') return;
    setStatus('downloading');
    // Simulate PDF generation (real implementation would call a backend/edge function)
    setTimeout(() => {
      setStatus('done');
      if (onDownload) onDownload();
      setTimeout(() => setStatus('idle'), 2000);
    }, 1200);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0,
      }}>
        <FileText size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={12} /> {date}
          {size && <><span style={{ opacity: 0.5 }}>·</span> {type} ({size})</>}
        </div>
      </div>
      <button
        onClick={handleDownload}
        style={{
          background: status === 'done' ? 'var(--green-deep)' : 'none',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '8px',
          color: status === 'done' ? 'var(--green)' : 'var(--text-dim)',
          cursor: status === 'downloading' ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 34, transition: 'all 0.2s ease',
        }}
        disabled={status === 'downloading'}
      >
        {status === 'idle' && <Download size={16} />}
        {status === 'downloading' && (
          <span style={{
            width: 14, height: 14, border: '2px solid var(--text-dim)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite', display: 'inline-block',
          }} />
        )}
        {status === 'done' && <Check size={16} />}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const fmtGenerated = (iso) =>
  iso ? `Generated ${new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '';

export const StatementsView = ({ role }) => {
  const { groupContributions, loansList, userData, groupData } = useApp();
  const [activeTab, setActiveTab] = useState('personal');
  const canViewGroup = role === 'Treasurer' || role === 'Chairperson' || role === 'Admin';

  // Build personal statement rows from the user's own contributions
  const myContributions = (groupContributions || []).filter(c => c.user_id === userData?.id);
  const myLoans = loansList.filter(l => l.name === userData?.id || true); // all loans visible

  // Personal statements: one per cycle (contribution statements)
  const personalRows = myContributions.map(c => ({
    id: c.id,
    title: `${c.cycle_label || 'Contribution'} Statement`,
    date: fmtGenerated(c.submitted_at || c.created_at),
    size: null,
  }));

  // Group statements: one per cycle (all contributions)
  const cycleMap = {};
  (groupContributions || []).forEach(c => {
    const label = c.cycle_label || 'Unknown Cycle';
    if (!cycleMap[label]) cycleMap[label] = { label, count: 0, latest: c.submitted_at };
    cycleMap[label].count += 1;
    if (new Date(c.submitted_at) > new Date(cycleMap[label].latest)) {
      cycleMap[label].latest = c.submitted_at;
    }
  });
  const groupRows = Object.values(cycleMap).map((cycle, i) => ({
    id: i,
    title: `${groupData?.name || 'Group'} — ${cycle.label} Reconciliation`,
    date: fmtGenerated(cycle.latest),
    size: null,
  }));

  return (
    <>
      <div className="greeting">
        <p className="hello">Financial records</p>
        <p className="name">Statements</p>
      </div>

      {canViewGroup && (
        <div className="tabs">
          <button className={`tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>Personal</button>
          <button className={`tab ${activeTab === 'group' ? 'active' : ''}`} onClick={() => setActiveTab('group')}>Group (Admin)</button>
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="section tab-panel">
          <div className="section-head">
            <h3>My Statements</h3>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: '0 0 16px' }}>
            Official records of your personal contributions, fines, and loan repayments.
          </p>

          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '0 16px', marginBottom: 24 }}>
            {personalRows.length > 0 ? (
              personalRows.map(item => (
                <StatementRow key={item.id} title={item.title} date={item.date} size={item.size} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-faint)' }}>
                <FileText size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No statements yet</p>
                <p style={{ fontSize: 12.5, margin: '6px 0 0' }}>Statements appear here once you make your first contribution.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'group' && canViewGroup && (
        <div className="section tab-panel">
          <div className="section-head">
            <h3>Group Financials</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-deep)', padding: '4px 8px', borderRadius: 6 }}>
              <Lock size={12} /> RESTRICTED
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: '0 0 16px' }}>
            Comprehensive reconciliations and overarching group pot audits. Visible only to the Chairperson and Treasurer.
          </p>

          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '0 16px' }}>
            {groupRows.length > 0 ? (
              groupRows.map(item => (
                <StatementRow key={item.id} title={item.title} date={item.date} size={item.size} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-faint)' }}>
                <FileText size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No group statements yet</p>
                <p style={{ fontSize: 12.5, margin: '6px 0 0' }}>Group reconciliations will appear here once contributions are recorded.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
