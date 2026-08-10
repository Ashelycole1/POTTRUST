import React, { useState } from 'react';
import { FileText, Download, Calendar, Lock, Check } from 'lucide-react';

const StatementRow = ({ title, date, size, type = 'PDF' }) => {
  const [status, setStatus] = useState('idle'); // idle, downloading, done

  const handleDownload = () => {
    if (status !== 'idle') return;
    setStatus('downloading');
    setTimeout(() => {
      setStatus('done');
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    }, 1500);
  };

  return (
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
      <button 
        onClick={handleDownload}
        style={{
          background: status === 'done' ? 'var(--green-deep)' : 'none', 
          border: '1px solid var(--line)', 
          borderRadius: 10,
          padding: '8px', 
          color: status === 'done' ? 'var(--green)' : 'var(--text-dim)', 
          cursor: status === 'downloading' ? 'not-allowed' : 'pointer', 
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          minWidth: 34,
          transition: 'all 0.2s ease'
        }}
        disabled={status === 'downloading'}
      >
        {status === 'idle' && <Download size={16} />}
        {status === 'downloading' && (
          <span style={{
            width: 14, height: 14, border: '2px solid var(--text-dim)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.6s linear infinite', display: 'inline-block'
          }} />
        )}
        {status === 'done' && <Check size={16} />}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const StatementsView = ({ role }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [personalList, setPersonalList] = useState([
    { id: 1, title: "July 2026 Contribution Statement", date: "Generated Aug 1, 2026", size: "1.2 MB" },
    { id: 2, title: "June 2026 Contribution Statement", date: "Generated Jul 1, 2026", size: "1.1 MB" },
    { id: 3, title: "Q2 2026 Loan Clearance Letter", date: "Generated Jun 30, 2026", size: "840 KB" },
    { id: 4, title: "May 2026 Contribution Statement", date: "Generated Jun 1, 2026", size: "1.1 MB" }
  ]);

  const [groupList, setGroupList] = useState([
    { id: 1, title: "Katonga SACCO - July 2026 Reconciliation", date: "Generated Aug 2, 2026", size: "4.5 MB" },
    { id: 2, title: "Katonga SACCO - June 2026 Reconciliation", date: "Generated Jul 2, 2026", size: "4.2 MB" },
    { id: 3, title: "Q2 2026 Full Audit Report", date: "Generated Jul 5, 2026", size: "8.1 MB" }
  ]);

  const canViewGroup = role === 'Treasurer' || role === 'Chairperson';

  const loadOlderPersonal = () => {
    const older = [
      { id: 5, title: "April 2026 Contribution Statement", date: "Generated May 1, 2026", size: "1.0 MB" },
      { id: 6, title: "March 2026 Contribution Statement", date: "Generated Apr 1, 2026", size: "1.2 MB" }
    ];
    setPersonalList(prev => [...prev, ...older.filter(o => !prev.some(p => p.id === o.id))]);
  };

  const loadOlderGroup = () => {
    const older = [
      { id: 4, title: "Katonga SACCO - May 2026 Reconciliation", date: "Generated Jun 2, 2026", size: "4.0 MB" },
      { id: 5, title: "Q1 2026 Full Audit Report", date: "Generated Apr 5, 2026", size: "7.8 MB" }
    ];
    setGroupList(prev => [...prev, ...older.filter(o => !prev.some(p => p.id === o.id))]);
  };

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
            {personalList.map(item => (
              <StatementRow key={item.id} title={item.title} date={item.date} size={item.size} />
            ))}
            <div style={{ borderBottom: 'none', padding: '16px 0', textAlign: 'center' }}>
              <button 
                onClick={loadOlderPersonal}
                style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
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
            {groupList.map(item => (
              <StatementRow key={item.id} title={item.title} date={item.date} size={item.size} />
            ))}
            <div style={{ borderBottom: 'none', padding: '16px 0', textAlign: 'center' }}>
              <button 
                onClick={loadOlderGroup}
                style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Load older statements
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

