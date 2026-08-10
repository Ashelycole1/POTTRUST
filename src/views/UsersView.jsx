import React, { useState } from 'react';
import { Search, Filter, UserPlus, Shield, Users, User, Mail, Phone, X, Trash2 } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Rwothomio Evans',   email: 'evans@pottrust.org',     phone: '+256 701 234567', group: 'Katonga Traders SACCO', role: 'Chairperson', initials: 'RE', color: 'var(--green)', status: 'Active' },
  { id: 2, name: 'Alimpa A. Hillary', email: 'hillary@pottrust.org',   phone: '+256 752 987654', group: 'Katonga Traders SACCO', role: 'Treasurer',   initials: 'AH', color: 'var(--green)', status: 'Active' },
  { id: 3, name: 'Niwasiima A.',      email: 'niwasiima@pottrust.org', phone: '+256 774 333444', group: 'Katonga Traders SACCO', role: 'Member',      initials: 'NA', color: 'var(--gold)',  status: 'Active' },
  { id: 4, name: 'Egabo Aaron',       email: 'aaron@pottrust.org',     phone: '+256 783 111222', group: 'Bwaise Women\'s Group', role: 'Chairperson', initials: 'EA', color: 'var(--green)', status: 'Active' },
  { id: 5, name: 'Ssenyonjo K.',      email: 'ssenyonjo@pottrust.org', phone: '+256 756 777888', group: 'Kisekka Mechanics',    role: 'Member',      initials: 'SK', color: 'var(--coral)', status: 'Suspended' },
  { id: 6, name: 'Tumwine N.',        email: 'tumwine@pottrust.org',   phone: '+256 787 999000', group: 'Owino Market Vendors', role: 'Treasurer',   initials: 'TN', color: 'var(--green)', status: 'Active' },
];

export const UsersView = () => {
  const [search, setSearch]               = useState('');
  const [roleFilter, setRoleFilter]       = useState('ALL');
  const [selected, setSelected]           = useState(null);
  const [users, setUsers]                 = useState(mockUsers);
  const [inviteOpen, setInviteOpen]       = useState(false);
  const [inviteEmail, setInviteEmail]     = useState('');
  const [inviteName, setInviteName]       = useState('');
  const [inviteSent, setInviteSent]       = useState(false);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.group.toLowerCase().includes(q);
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSuspend = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
    setSelected(null);
  };

  const handleRemove = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setSelected(null);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteSent(true);
    setTimeout(() => { setInviteOpen(false); setInviteSent(false); setInviteEmail(''); setInviteName(''); }, 2000);
  };

  return (
    <>
      <div className="greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="hello">System Admin</p>
          <p className="name">Global Users</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          style={{ marginTop: 12, background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <UserPlus size={16} /> Invite User
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: Users,  label: 'Total Users',  value: '34,502', color: 'var(--green)' },
          { icon: Shield, label: 'Chairpersons', value: '1,204',  color: 'var(--green)' },
          { icon: User,   label: 'Suspended',    value: '23',     color: 'var(--coral)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)', fontSize: 12, fontWeight: 600 }}>
              <s.icon size={16} color={s.color} /> {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head" style={{ marginBottom: 16 }}>
          <h3>{filtered.length} Users</h3>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by name, email or group..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px 12px 40px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {['ALL', 'Member', 'Treasurer', 'Chairperson'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{ background: roleFilter === r ? 'var(--text)' : 'var(--surface-2)', color: roleFilter === r ? 'var(--bg)' : 'var(--text-dim)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
          {filtered.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#08251d', flexShrink: 0 }}>
                {u.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.group} · {u.role}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: u.status === 'Active' ? 'var(--green-deep)' : 'var(--coral-deep)',
                color: u.status === 'Active' ? 'var(--green)' : 'var(--coral)',
                flexShrink: 0,
              }}>
                {u.status.toUpperCase()}
              </span>
              <button
                onClick={() => setSelected(u)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', cursor: 'pointer', flexShrink: 0 }}
              >
                Manage
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>No users match your search.</div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)', borderRadius: 24, width: '100%', maxWidth: 420, padding: 28, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: 17 }}>User Profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#08251d' }}>{selected.initials}</div>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selected.name}</h4>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--text-faint)' }}>{selected.role} · {selected.group}</p>
              </div>
            </div>

            {[
              { icon: Mail,  label: 'Email',  value: selected.email },
              { icon: Phone, label: 'Phone',  value: selected.phone },
              { icon: Shield,label: 'Status', value: selected.status },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <row.icon size={15} color="var(--text-faint)" />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-dim)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => handleSuspend(selected.id)}
                style={{ flex: 1, background: selected.status === 'Active' ? 'var(--gold-deep)' : 'var(--green-deep)', color: selected.status === 'Active' ? 'var(--gold)' : 'var(--green)', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {selected.status === 'Active' ? 'Suspend User' : 'Reactivate User'}
              </button>
              <button
                onClick={() => handleRemove(selected.id)}
                style={{ flex: 1, background: 'var(--coral-deep)', color: 'var(--coral)', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Trash2 size={15} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)', borderRadius: 24, width: '100%', maxWidth: 400, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: 17 }}>Invite User</h3>
              <button onClick={() => setInviteOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {inviteSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Mail size={24} color="var(--green)" />
                </div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>Invite sent!</p>
                <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>An invitation link was sent to {inviteEmail}</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Full Name</label>
                  <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Mugisha Robert" required
                    style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Email Address</label>
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" required
                    style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ width: '100%', background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Send Invite
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
