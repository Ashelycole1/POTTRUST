import React, { useState } from 'react';
import { FileText, Download, Calendar, Lock } from 'lucide-react';

const StatementRow = ({ title, date, size, type = 'PDF' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0',
    borderBottom: '1px solid var(--line)'
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0
    }}>
      <FileText size={20} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={12} /> {date} <span style={{ opacity: 0.5 }}>·</span> {type} ({size})
      </div>
    </div>
    <button style={{
      background: 'none', border: '1px solid var(--line)', borderRadius: 10,
      padding: '8px', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <Download size={16} />
    </button>
  </div>
);

export const StatementsView = ({ role }) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  const canViewGroup = role === 'Treasurer' || role === 'Chairperson';

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
            <StatementRow title="July 2026 Contribution Statement" date="Generated Aug 1, 2026" size="1.2 MB" />
            <StatementRow title="June 2026 Contribution Statement" date="Generated Jul 1, 2026" size="1.1 MB" />
            <StatementRow title="Q2 2026 Loan Clearance Letter" date="Generated Jun 30, 2026" size="840 KB" />
            <StatementRow title="May 2026 Contribution Statement" date="Generated Jun 1, 2026" size="1.1 MB" />
            <div style={{ borderBottom: 'none', padding: '16px 0', textAlign: 'center' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Load older statements
              </button>
            </div>
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
            <StatementRow title="Katonga SACCO - July 2026 Reconciliation" date="Generated Aug 2, 2026" size="4.5 MB" />
            <StatementRow title="Katonga SACCO - June 2026 Reconciliation" date="Generated Jul 2, 2026" size="4.2 MB" />
            <StatementRow title="Q2 2026 Full Audit Report" date="Generated Jul 5, 2026" size="8.1 MB" />
            <div style={{ borderBottom: 'none', padding: '16px 0', textAlign: 'center' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Load older statements
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
