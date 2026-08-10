import React, { useState } from 'react';
import { PotCard, ScoreCard, ContribCard, LoanCard } from '../components/Cards';
import { MemberRow } from '../components/MemberRow';

export const ChairpersonView = () => {
  const [activeTab, setActiveTab] = useState('loans');
  const [message, setMessage] = useState('');
  
  const [loans, setLoans] = useState([
    { id: 1, name: "Ssenyonjo K.", initials: "SK", sub: "UGX 450,000 requested · pending vote", status: "PENDING", avatarColor: "var(--gold)" },
    { id: 2, name: "Niwasiima A.", initials: "NA", sub: "UGX 200,000 requested · pending vote", status: "PENDING", avatarColor: "var(--gold)" }
  ]);

  const [fines, setFines] = useState([
    { id: 1, name: "Ssenyonjo K.", initials: "SK", sub: "3 days overdue", status: "OVERDUE", avatarColor: "var(--coral)" },
    { id: 2, name: "Onyango J. Steven", initials: "OJ", sub: "5 days overdue", status: "OVERDUE", avatarColor: "var(--coral)" }
  ]);

  const handleApproveLoan = (id, name) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    setMessage(`Successfully approved loan for ${name}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleIssueFine = (id, name) => {
    setFines(prev => prev.filter(f => f.id !== id));
    setMessage(`Issued a fine to ${name}`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">Rwothomio Evans</p>
        <span className="badge badge-admin" style={{ marginTop: 8, display: 'inline-block' }}>CHAIRPERSON</span>
      </div>

      {message && (
        <div style={{
          background: 'var(--green-deep)', border: '1px solid var(--green)', color: 'var(--green)',
          padding: '12px 16px', borderRadius: 12, fontSize: 13.5, fontWeight: 600, marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {message}
        </div>
      )}

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
        <button className={`tab ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>Loan Approvals</button>
        <button className={`tab ${activeTab === 'fines' ? 'active' : ''}`} onClick={() => setActiveTab('fines')}>Fines</button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
      </div>

      {activeTab === 'loans' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Pending Loan Requests</h3></div>
          <div className="member-list">
            {loans.length > 0 ? (
              loans.map(loan => (
                <MemberRow 
                  key={loan.id}
                  name={loan.name} 
                  initials={loan.initials} 
                  sub={loan.sub} 
                  status={loan.status} 
                  avatarColor={loan.avatarColor} 
                  actionLabel="Approve"
                  onAction={() => handleApproveLoan(loan.id, loan.name)}
                />
              ))
            ) : (
              <p style={{ color: 'var(--text-faint)', fontSize: 13.5, padding: '16px 0', textAlign: 'center' }}>No pending loan requests</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Manage Fines</h3></div>
          <div className="member-list">
            {fines.length > 0 ? (
              fines.map(fine => (
                <MemberRow 
                  key={fine.id}
                  name={fine.name} 
                  initials={fine.initials} 
                  sub={fine.sub} 
                  status={fine.status} 
                  avatarColor={fine.avatarColor} 
                  actionLabel="Issue Fine"
                  onAction={() => handleIssueFine(fine.id, fine.name)}
                />
              ))
            ) : (
              <p style={{ color: 'var(--text-faint)', fontSize: 13.5, padding: '16px 0', textAlign: 'center' }}>No overdue contributions to fine</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>All 28 members</h3></div>
          <div className="member-list">
            <MemberRow name="Rwothomio Evans (you)" initials="RE" sub="Chairperson" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Alimpa A. Hillary" initials="AH" sub="Treasurer" status="PAID" avatarColor="var(--green)" />
          </div>
        </div>
      )}
    </>
  );
};

