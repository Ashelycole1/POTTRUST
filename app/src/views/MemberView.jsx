import React, { useState } from 'react';
import { PotCard, ScoreCard, ContribCard, LoanCard } from '../components/Cards';
import { QuickActionTile } from '../components/QuickActionTile';
import { MemberRow } from '../components/MemberRow';
import { DollarSign, CheckCircle, Landmark, Users } from 'lucide-react';

export const MemberView = () => {
  const [activeTab, setActiveTab] = useState('foryou');

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">Ashelycole</p>
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
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
        <button className={`tab ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>Loans</button>
        <button className={`tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
      </div>

      {activeTab === 'foryou' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Quick actions</h3></div>
          <div className="quick-grid">
            <QuickActionTile icon={DollarSign} label="Contribute" colorClass="qi-green" />
            <QuickActionTile icon={CheckCircle} label="Verify Proof" colorClass="qi-gold" />
            <QuickActionTile icon={Landmark} label="Request Loan" colorClass="qi-green" />
            <QuickActionTile icon={Users} label="Group Info" colorClass="qi-gold" />
          </div>

          <div className="section-head" style={{ marginTop: 26 }}>
            <h3>This cycle's status</h3>
            <a className="link" href="#">See matrix</a>
          </div>
          <div className="member-list">
            <MemberRow name="Niwasiima A. (you)" initials="NA" sub="Paid 12 Jul via MTN MoMo" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Egabo Aaron" initials="EA" sub="Slip uploaded, awaiting review" status="PENDING" avatarColor="var(--gold)" />
            <MemberRow name="Natozo Martha" initials="NM" sub="Cycle closed 2 days ago" status="OVERDUE" avatarColor="var(--coral)" />
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>All 28 members · Aug cycle</h3><a className="link" href="#">Export</a></div>
          <div className="member-list">
            <MemberRow name="Rwothomio Evans" initials="RE" sub="Chairperson" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Alimpa A. Hillary" initials="AH" sub="Treasurer" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Onyango J. Steven" initials="OJ" sub="Slip under review" status="PENDING" avatarColor="var(--gold)" />
            <MemberRow name="Ssenyonjo K." initials="SK" sub="3 days overdue" status="OVERDUE" avatarColor="var(--coral)" />
            <MemberRow name="Tumwine N." initials="TN" sub="Paid 11 Jul via Airtel Money" status="PAID" avatarColor="var(--green)" />
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Loan book</h3><a className="link" href="#">New request</a></div>
          <div className="member-list">
            <MemberRow name="You" initials="NA" sub="UGX 620,000 outstanding · 4 of 8 paid" status="ACTIVE" avatarColor="var(--gold)" />
            <MemberRow name="Egabo Aaron" initials="EA" sub="UGX 300,000 · cleared 2 Jul" status="CLEARED" avatarColor="var(--green)" />
            <MemberRow name="Ssenyonjo K." initials="SK" sub="UGX 450,000 · repayment overdue" status="AT RISK" avatarColor="var(--coral)" />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Audit log</h3></div>
          <p style={{color: 'var(--text-faint)', fontSize: '13px'}}>See immutable audit log on the right panel (Desktop).</p>
        </div>
      )}
    </>
  );
};
