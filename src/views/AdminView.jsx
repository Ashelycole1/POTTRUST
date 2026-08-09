import React, { useState } from 'react';
import { MemberRow } from '../components/MemberRow';

export const AdminView = () => {
  const [activeTab, setActiveTab] = useState('groups');

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">System Admin</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>Groups</button>
        <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`tab ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>Platform Config</button>
      </div>

      {activeTab === 'groups' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>All Groups</h3><a className="link" href="#">Add Group</a></div>
          <div className="member-list">
            <MemberRow 
              name="Katonga Traders SACCO" 
              initials="KT" 
              sub="UGX 4,820,000 Pot · 28 Members" 
              status="ACTIVE" 
              avatarColor="var(--green)" 
              actionLabel="View"
              onAction={() => alert('Viewing Group...')}
            />
            <MemberRow 
              name="Bwaise Women's Group" 
              initials="BW" 
              sub="UGX 1,200,000 Pot · 15 Members" 
              status="ACTIVE" 
              avatarColor="var(--green)" 
              actionLabel="View"
              onAction={() => alert('Viewing Group...')}
            />
            <MemberRow 
              name="Kisekka Mechanics" 
              initials="KM" 
              sub="Multiple defaults detected" 
              status="AT RISK" 
              avatarColor="var(--coral)" 
              actionLabel="View"
              onAction={() => alert('Viewing Group...')}
            />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Manage Users</h3></div>
          <p style={{color: 'var(--text-dim)', fontSize: 13}}>User management interface...</p>
        </div>
      )}
    </>
  );
};
