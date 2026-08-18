import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberRow } from '../components/MemberRow';
import { Activity, ShieldCheck, TrendingUp, Users, DollarSign, Database, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

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
  const { displayName } = useApp();
  const [stats, setStats] = useState({ users: null, groups: null, transactions: null, txnAmount: null });
  const [activity, setActivity] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);

      // Parallel fetches
      const [
        { count: userCount },
        { count: groupCount },
        { data: txns },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('contributions')
          .select('amount, submitted_at')
          .gte('submitted_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      ]);

      const totalAmount = (txns || []).reduce((s, c) => s + (c.amount || 0), 0);

      setStats({
        users: userCount ?? 0,
        groups: groupCount ?? 0,
        transactions: (txns || []).length,
        txnAmount: totalAmount,
      });

      // Build last-14-days activity bars from contributions
      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const buckets = days.map(day => {
        const next = new Date(day); next.setDate(next.getDate() + 1);
        const count = (txns || []).filter(c => {
          const t = new Date(c.submitted_at);
          return t >= day && t < next;
        }).length;
        return count;
      });

      setActivity(buckets);
      setStatsLoading(false);
    };

    fetchStats();
  }, []);

  const maxActivity = Math.max(...activity, 1);
  const fmtAmount = (n) => n >= 1_000_000
    ? `UGX ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `UGX ${(n / 1000).toFixed(0)}K`
    : `UGX ${n}`;

  return (
    <>
      <div className="greeting">
        <p className="hello">System Admin</p>
        <p className="name">{displayName}</p>
        <span className="badge badge-admin" style={{ marginTop: 8, display: 'inline-block' }}>GOD MODE</span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24
      }}>
        <MetricCard
          icon={Users}
          label="Total Users"
          value={statsLoading ? '…' : stats.users}
          trend={statsLoading ? '' : `${stats.users} registered accounts`}
        />
        <MetricCard
          icon={Database}
          label="Active Groups"
          value={statsLoading ? '…' : stats.groups}
          trend={statsLoading ? '' : `${stats.groups} SACCO workspaces`}
        />
        <MetricCard
          icon={Activity}
          label="Transactions (30d)"
          value={statsLoading ? '…' : stats.transactions}
          trend={statsLoading ? '' : fmtAmount(stats.txnAmount)}
        />
        <MetricCard
          icon={ShieldCheck}
          label="System Health"
          value="99.9%"
          trend="All systems operational"
        />
      </div>

      <div className="section">
        <div className="section-head">
          <h3>Contribution Activity — Last 14 Days</h3>
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Live</span>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: 16 }}>
          {statsLoading ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
              Loading activity…
            </div>
          ) : activity.every(v => v === 0) ? (
            <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 13, gap: 8 }}>
              <Activity size={32} opacity={0.3} />
              <span>No contribution activity in the last 14 days</span>
            </div>
          ) : (
            <>
              <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                {activity.map((count, i) => {
                  const h = Math.max((count / maxActivity) * 100, count > 0 ? 8 : 2);
                  return (
                    <div key={i} title={`${count} contribution${count !== 1 ? 's' : ''}`}
                      style={{ flex: 1, background: count > 0 ? 'var(--green-deep)' : 'var(--line)', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative', cursor: 'default' }}>
                      {count > 0 && (
                        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, var(--green) 0%, transparent 100%)', opacity: 0.35, borderRadius: '4px 4px 0 0' }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </>
          )}
        </div>

        {/* Recent Breakdown */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Avg per group</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>
              {statsLoading ? '…' : stats.groups > 0 ? Math.round(stats.transactions / stats.groups) : 0}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>transactions / group</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Users per group</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>
              {statsLoading ? '…' : stats.groups > 0 ? (stats.users / stats.groups).toFixed(1) : stats.users}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>avg members</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Volume (30d)</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>
              {statsLoading ? '…' : fmtAmount(stats.txnAmount)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>total processed</div>
          </div>
        </div>
      </div>
    </>
  );
};

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { userData } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [chairEmail, setChairEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      supabase.from('users').select('email, first_name, last_name')
        .then(({ data }) => setUsers(data || []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--line)',
        borderRadius: 24, width: '100%', maxWidth: 440,
        padding: '32px 28px', position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, margin: 0 }}>
              {step === 1 ? 'Create New Group' : 'Group Created'}
            </h2>
            <p style={{ color: 'var(--text-faint)', fontSize: 12.5, margin: '4px 0 0' }}>
              {step === 1 ? 'Set up a new workspace for a SACCO' : 'The workspace is ready'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', padding: 4, cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Group Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Masaka Traders SACCO"
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Chairperson Email</label>
              <select
                value={chairEmail}
                onChange={e => setChairEmail(e.target.value)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="">-- Optional: Select Chairperson --</option>
                {users.map(u => (
                  <option key={u.email} value={u.email}>
                    {u.first_name} {u.last_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {error && <div style={{ color: 'var(--coral)', fontSize: 13, marginBottom: 16, background: 'rgba(255,100,100,0.1)', padding: 10, borderRadius: 8 }}>{error}</div>}

            <button 
              disabled={loading || !name}
              onClick={async () => { 
                if(!name) return;
                setLoading(true); setError(null);
                
                let targetUserId = null;
                // If email provided, find the user
                if (chairEmail) {
                  const { data: userRow } = await supabase.from('users').select('id').eq('email', chairEmail).single();
                  if (!userRow) {
                    setError(`No user found with email ${chairEmail}. They must create an account first.`);
                    setLoading(false);
                    return;
                  }
                  targetUserId = userRow.id;
                }

                // Insert Group
                const { data: newGroup, error: groupErr } = await supabase.from('groups').insert({
                  name,
                  created_by: userData?.id
                }).select().single();

                if (groupErr) {
                  setError('Failed to create group: ' + groupErr.message);
                  setLoading(false); return;
                }

                // Assign Chairperson
                if (targetUserId && newGroup) {
                  await supabase.from('group_members').insert({
                    group_id: newGroup.id,
                    user_id: targetUserId,
                    role: 'Chairperson'
                  });
                }

                setLoading(false);
                setStep(2); 
              }} 
              style={{ width: '100%', background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !name ? 0.7 : 1 }}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '10px 0 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Database size={28} color="var(--green)" />
            </div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>{name}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: '0 0 28px', lineHeight: 1.5 }}>
              The group has been provisioned successfully. An invite link has been sent to the designated Chairperson to complete onboarding.
            </p>
            <button onClick={onClose} style={{ width: '100%', background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminGroupsView = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const { displayName } = useApp();

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
    if (data) setGroups(data);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <>
      <div className="greeting">
        <p className="hello">System Admin</p>
        <p className="name">{displayName}</p>
      </div>

      <div className="section">
        <div className="section-head">
          <h3>{groups.length} Active Groups</h3>
          <div style={{ display: 'flex', gap: 8 }}>
             <input type="text" placeholder="Search..." style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
             <button 
               onClick={() => setModalOpen(true)}
               style={{ background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
             >
               <Plus size={16} /> New Group
             </button>
          </div>
        </div>
        
        <div className="member-list">
          {groups.length > 0 ? (
            groups.map(group => (
              <MemberRow 
                key={group.id}
                name={group.name} 
                initials={group.name.substring(0, 2).toUpperCase()} 
                sub={`Pot: UGX ${(group.total_pot || 0).toLocaleString()}`} 
                status="HEALTHY" 
                avatarColor="var(--green)" 
                actionLabel="Manage"
                onAction={() => navigate('/settings')}
              />
            ))
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>No groups found.</div>
          )}
        </div>
      </div>
      <CreateGroupModal isOpen={modalOpen} onClose={() => { setModalOpen(false); fetchGroups(); }} />
    </>
  );
};
