import React, { useState } from 'react';
import { PotCard } from '../components/Cards';
import { MemberRow } from '../components/MemberRow';

export const ChairpersonView = () => {
  const [activeTab, setActiveTab] = useState('loans');

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">Rwothomio Evans</p>
        <span className="badge badge-admin" style={{ marginTop: 8, display: 'inline-block' }}>CHAIRPERSON</span>
      </div>

      <div className="carousel-wrap">
        <div className="carousel" id="carousel">
          <PotCard />
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
            <MemberRow 
              name="Ssenyonjo K." 
              initials="SK" 
              sub="UGX 450,000 requested · pending vote" 
              status="PENDING" 
              avatarColor="var(--gold)" 
              actionLabel="Approve"
              onAction={() => alert('Approved loan')}
            />
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Manage Fines</h3></div>
          <div className="member-list">
            <MemberRow 
              name="Ssenyonjo K." 
              initials="SK" 
              sub="3 days overdue" 
              status="OVERDUE" 
              avatarColor="var(--coral)" 
              actionLabel="Issue Fine"
              onAction={() => alert('Fine issued')}
            />
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
