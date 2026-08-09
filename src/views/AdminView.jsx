import React from 'react';
import { MemberRow } from '../components/MemberRow';
import { Activity, ShieldCheck, TrendingUp, Users, DollarSign, Database } from 'lucide-react';

const MetricCard = ({ icon: Icon, label, value, trend, trendColor }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--line)',
    borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-faint)', fontSize: 13, fontWeight: 600 }}>
      <Icon size={18} />
      {label}
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>
      {value}
    </div>
    {trend && (
      <div style={{ fontSize: 12, fontWeight: 600, color: trendColor || 'var(--green)' }}>
        {trend}
      </div>
    )}
  </div>
);

export const AdminOverview = () => {
  return (
    <>
      <div className="greeting">
        <p className="hello">System Admin</p>
        <p className="name">Platform Overview</p>
        <span className="badge badge-admin" style={{ marginTop: 8, display: 'inline-block' }}>GOD MODE</span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24
      }}>
        <MetricCard icon={Users} label="Total Users" value="34,502" trend="+1,204 this month" />
        <MetricCard icon={Database} label="Active Groups" value="1,204" trend="+42 this month" />
        <MetricCard icon={Activity} label="Transactions" value="142k" trend="Processed this month" />
        <MetricCard icon={ShieldCheck} label="System Health" value="99.9%" trend="All systems operational" />
      </div>

      <div className="section">
        <div className="section-head">
          <h3>Platform Activity Pulse</h3>
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Live</span>
        </div>
        
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: 16 }}>
          {/* Mock chart area */}
          <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
             {[30, 45, 20, 60, 80, 50, 90, 70, 40, 65, 85, 100, 75, 55].map((h, i) => (
               <div key={i} style={{ flex: 1, background: 'var(--green-deep)', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                 <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, var(--green) 0%, transparent 100%)', opacity: 0.3 }} />
               </div>
             ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </>
  );
};

export const AdminGroupsView = () => {
  return (
    <>
      <div className="greeting">
        <p className="hello">System Admin</p>
        <p className="name">All Groups</p>
      </div>

      <div className="section">
        <div className="section-head">
          <h3>1,204 Active Groups</h3>
          <div style={{ display: 'flex', gap: 8 }}>
             <input type="text" placeholder="Search..." style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
          </div>
        </div>
        
        <div className="member-list">
          <MemberRow 
            name="Katonga Traders SACCO" 
            initials="KT" 
            sub="28 Members · Established 2018" 
            status="HEALTHY" 
            avatarColor="var(--green)" 
            actionLabel="Manage"
            onAction={() => {}}
          />
          <MemberRow 
            name="Bwaise Women's Group" 
            initials="BW" 
            sub="15 Members · Established 2021" 
            status="HEALTHY" 
            avatarColor="var(--green)" 
            actionLabel="Manage"
            onAction={() => {}}
          />
          <MemberRow 
            name="Kisekka Mechanics" 
            initials="KM" 
            sub="110 Members · High default risk flagged" 
            status="AT RISK" 
            avatarColor="var(--coral)" 
            actionLabel="Manage"
            onAction={() => {}}
          />
          <MemberRow 
            name="Owino Market Vendors" 
            initials="OV" 
            sub="250 Members · Established 2019" 
            status="HEALTHY" 
            avatarColor="var(--green)" 
            actionLabel="Manage"
            onAction={() => {}}
          />
        </div>
      </div>
    </>
  );
};
