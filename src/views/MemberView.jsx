import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PotCard, ScoreCard, ContribCard, LoanCard } from '../components/Cards';
import { QuickActionTile } from '../components/QuickActionTile';
import { MemberRow } from '../components/MemberRow';
import { AuditLog } from '../components/AuditLog';
import { RepayLoanModal } from '../components/RepayLoanModal';
import { RequestLoanModal } from '../components/RequestLoanModal';
import { DollarSign, CheckCircle, Landmark, Users } from 'lucide-react';

export const MemberView = () => {
  const [activeTab, setActiveTab] = useState('foryou');
  const navigate = useNavigate();
  const { setProofModalOpen, setLoanRequestModalOpen, activityLog, loansList, displayName, groupContributions } = useApp();

  // Sort contributions: group contributions by status for 'foryou' tab or just show all
  const statusColors = { PAID: 'var(--green)', PENDING: 'var(--gold)', OVERDUE: 'var(--coral)' };

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">{displayName}</p>
      </div>

      <div className="carousel-wrap">
        <div className="carousel" id="carousel">
          <PotCard />
          <ScoreCard />
          <ContribCard />
          <LoanCard />
        </div>
        <div className="dots">
          <span className="active"></span><span></span><span></span><span></span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'foryou' ? 'active' : ''}`} onClick={() => setActiveTab('foryou')}>For You</button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => navigate('/members')}>Members</button>
        <button className={`tab ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>Loans</button>
        <button className={`tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
      </div>

      {activeTab === 'foryou' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Quick actions</h3></div>
          <div className="quick-grid">
            <QuickActionTile icon={DollarSign} label="Contribute" colorClass="qi-green" onClick={() => setProofModalOpen(true)} />
            <QuickActionTile icon={CheckCircle} label="Statement" colorClass="qi-gold" onClick={() => navigate('/statements')} />
            <QuickActionTile icon={Landmark} label="Request Loan" colorClass="qi-green" onClick={() => setLoanRequestModalOpen(true)} />
            <QuickActionTile icon={Users} label="Group Info" colorClass="qi-gold" onClick={() => navigate('/members')} />
          </div>

          <div className="section-head" style={{ marginTop: 26 }}>
            <h3>This cycle's status</h3>
            <span className="link" onClick={() => navigate('/members')} style={{ cursor: 'pointer' }}>See matrix</span>
          </div>
          <div className="member-list">
            {groupContributions?.length > 0 ? groupContributions.slice(0, 5).map(c => {
              const uName = `${c.users?.first_name || ''} ${c.users?.last_name || ''}`.trim() || 'Unknown';
              const inits = `${c.users?.first_name?.[0] || ''}${c.users?.last_name?.[0] || ''}`.toUpperCase() || '?';
              return (
                <MemberRow 
                  key={c.id} 
                  name={uName} 
                  initials={inits} 
                  sub={c.status === 'PAID' ? `Paid via ${c.payment_mode || 'Cash'}` : c.status === 'PENDING' ? 'Awaiting review' : 'Overdue'} 
                  status={c.status} 
                  avatarColor={statusColors[c.status] || 'var(--text-dim)'} 
                />
              );
            }) : (
              <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>No contributions recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="section tab-panel">
          <div className="section-head">
            <h3>Loan book</h3>
            <button
              className="link"
              onClick={() => setLoanRequestModalOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >New request</button>
          </div>
          <div className="member-list">
            {loansList.map(loan => (
              <MemberRow key={loan.id} name={loan.name} initials={loan.initials} sub={loan.sub} status={loan.status} avatarColor={loan.color} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="section tab-panel">
          <div className="section-head">
            <h3>Audit log</h3>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Read-only</span>
          </div>
          <AuditLog entries={activityLog} />
        </div>
      )}

      <RepayLoanModal />
      <RequestLoanModal />
    </>
  );
};
