import React, { useState } from 'react';
import { PotCard, ScoreCard, ContribCard, LoanCard } from '../components/Cards';
import { QuickActionTile } from '../components/QuickActionTile';
import { MemberRow } from '../components/MemberRow';
import { DollarSign, CheckCircle, Landmark, Users } from 'lucide-react';

export const TreasurerView = () => {
  const [activeTab, setActiveTab] = useState('review');

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">Alimpa A. Hillary</p>
        <span className="badge badge-admin" style={{ marginTop: 8, display: 'inline-block' }}>TREASURER</span>
      </div>

      <div className="carousel-wrap">
        <div className="carousel" id="carousel">
          <PotCard />
          <ContribCard />
        </div>
        <div className="dots">
          <span className="active"></span><span></span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>Review Queue</button>
        <button className={`tab ${activeTab === 'foryou' ? 'active' : ''}`} onClick={() => setActiveTab('foryou')}>For You</button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
      </div>

      {activeTab === 'review' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Pending Proofs</h3></div>
          <div className="member-list">
            <MemberRow 
              name="Onyango J. Steven" 
              initials="OJ" 
              sub="MTN MoMo Receipt uploaded" 
              status="PENDING" 
              avatarColor="var(--gold)" 
              actionLabel="Verify"
              onAction={() => alert('Verified payment')}
            />
          </div>
        </div>
      )}

      {activeTab === 'foryou' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Quick actions</h3></div>
          <div className="quick-grid">
            <QuickActionTile icon={DollarSign} label="Contribute" colorClass="qi-green" />
            <QuickActionTile icon={CheckCircle} label="Verify Proof" colorClass="qi-gold" />
            <QuickActionTile icon={Landmark} label="Request Loan" colorClass="qi-green" />
            <QuickActionTile icon={Users} label="Group Info" colorClass="qi-gold" />
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>All 28 members · Aug cycle</h3><a className="link" href="#">Export</a></div>
          <div className="member-list">
            <MemberRow name="Rwothomio Evans" initials="RE" sub="Chairperson" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Alimpa A. Hillary (you)" initials="AH" sub="Treasurer" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Ssenyonjo K." initials="SK" sub="3 days overdue" status="OVERDUE" avatarColor="var(--coral)" />
          </div>
        </div>
      )}
    </>
  );
};
