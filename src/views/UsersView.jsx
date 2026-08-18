/**
 * UsersView — Admin only
 * Loads ALL users + their group memberships from Supabase.
 * Admin can change any user's role in any group.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Shield, Users, User, Mail, Phone, X, Trash2, ChevronDown, Check, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

const ROLES = ['Member', 'Treasurer', 'Chairperson', 'Admin'];

const roleColor = (role) => ({
  Admin:       { bg: 'rgba(168,85,247,0.15)', fg: '#a855f7' },
  Chairperson: { bg: 'var(--green-deep)',     fg: 'var(--green)' },
  Treasurer:   { bg: 'rgba(251,191,36,0.15)', fg: 'var(--gold)' },
  Member:      { bg: 'var(--surface-2)',       fg: 'var(--text-dim)' },
}[role] || { bg: 'var(--surface-2)', fg: 'var(--text-dim)' });

export const UsersView = () => {
  const { userData } = useApp();

  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selected, setSelected]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [savedId, setSavedId]     = useState(null);
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName]   = useState('');
  const [inviteSent, setInviteSent]   = useState(false);

  // ── Load all users with their group_member rows ──────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, avatar_url, created_at, global_role, group_members(id, role, group_id, groups(name))');
    if (error) { console.error(error); setLoading(false); return; }

    const mapped = (data || []).map(u => {
      const gm = u.group_members && u.group_members.length > 0 ? u.group_members[0] : null;
      return {
        id: gm?.id || `fake-${u.id}`,
        user_id: u.id,
        // Only use global_role if it's elevated (Admin); otherwise trust group role
        role: (u.global_role && u.global_role === 'Admin') ? 'Admin' : (gm?.role || u.global_role || 'Member'),
        groups: gm?.groups || null,
        group_id: gm?.group_id,
        users: { ...u, group_members: undefined }
      };
    });

    setRows(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total:       rows.length,
    chairpersons: rows.filter(r => r.role === 'Chairperson').length,
    admins:      rows.filter(r => r.role === 'Admin').length,
  };

  const filtered = rows.filter(r => {
    const u    = r.users;
    const name = `${u?.first_name || ''} ${u?.last_name || ''}`.toLowerCase();
    const q    = search.toLowerCase();
    const matchSearch = name.includes(q) || (u?.email || '').toLowerCase().includes(q) || (r.groups?.name || '').toLowerCase().includes(q);
    const matchRole   = roleFilter === 'ALL' || r.role === roleFilter;
    return matchSearch && matchRole;
  });

  const changeRole = async (memberId, userId, newRole) => {
    setSaving(true);
    
    // 1. Update global_role in users table
    const { error: userErr } = await supabase.from('users').update({ global_role: newRole }).eq('id', userId);
    if (userErr) console.error('[changeRole users]', userErr);

    // 2. If they have a group member record, update that too
    if (!memberId.startsWith('fake-')) {
      const { error: gmErr } = await supabase.from('group_members').update({ role: newRole }).eq('id', memberId);
      if (gmErr) console.error('[changeRole gm]', gmErr);
    } else if (newRole !== 'Admin' && newRole !== 'Member') {
      // 3. Auto-assign to latest group if they are made Chairperson/Treasurer but have no group
      const { data: latestGroup } = await supabase.from('groups').select('id').order('created_at', { ascending: false }).limit(1).single();
      if (latestGroup) {
         await supabase.from('group_members').insert({ group_id: latestGroup.id, user_id: userId, role: newRole });
      }
    }

    await load();
    if (selected?.user_id === userId) {
      setSelected(prev => ({ ...prev, role: newRole }));
    }
    setSavedId(userId);
    setTimeout(() => setSavedId(null), 2000);
    setSaving(false);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteSent(true);
    setTimeout(() => { setInviteOpen(false); setInviteSent(false); setInviteEmail(''); setInviteName(''); }, 2500);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: 'var(--text-dim)' }}>
      <Loader size={20} style={{ animation: 'spin 0.8s linear infinite' }} />
      <span>Loading users…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <>
      {/* Header */}
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
          { icon: Users,  label: 'Total Members', value: stats.total,        color: 'var(--green)' },
          { icon: Shield, label: 'Chairpersons',  value: stats.chairpersons, color: 'var(--green)' },
          { icon: User,   label: 'Admins',         value: stats.admins,      color: '#a855f7'       },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)', fontSize: 12, fontWeight: 600 }}>
              <s.icon size={16} color={s.color} /> {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head" style={{ marginBottom: 16 }}>
          <h3>{filtered.length} Memberships</h3>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by name, email or group…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px 12px 40px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {['ALL', ...ROLES].map(r => (
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
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
              No users match your search.
            </div>
          )}
          {filtered.map((r, i) => {
            const u       = r.users;
            const name    = `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.email || 'Unknown';
            const initials = `${u?.first_name?.[0] || ''}${u?.last_name?.[0] || ''}`.toUpperCase() || '?';
            const rc      = roleColor(r.role);
            const isSaved = savedId === r.id;

            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
                {/* Avatar */}
                {u?.avatar_url ? (
                  <img src={u.avatar_url} alt={name} style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.groups?.name || 'No group'} · {u?.email || ''}
                  </div>
                </div>

                {/* Role dropdown — inline */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <select
                    value={r.role}
                    onChange={e => changeRole(r.id, r.user_id, e.target.value)}
                    disabled={saving}
                    style={{
                      appearance: 'none', background: rc.bg, color: rc.fg,
                      border: `1px solid ${rc.fg}30`, borderRadius: 8,
                      padding: '6px 28px 6px 10px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: rc.fg, pointerEvents: 'none' }} />
                </div>

                {/* Saved checkmark */}
                {isSaved && <Check size={16} color="var(--green)" style={{ flexShrink: 0 }} />}

                <button
                  onClick={() => setSelected(r)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', cursor: 'pointer', flexShrink: 0 }}
                >
                  Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Detail Modal */}
      {selected && (() => {
        const u       = selected.users;
        const name    = `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.email || 'Unknown';
        const initials = `${u?.first_name?.[0] || ''}${u?.last_name?.[0] || ''}`.toUpperCase() || '?';
        const rc      = roleColor(selected.role);
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)', borderRadius: 24, width: '100%', maxWidth: 420, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: 'Sora', fontSize: 17 }}>User Profile</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                {u?.avatar_url ? (
                  <img src={u.avatar_url} alt={name} style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{initials}</div>
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{name}</h4>
                  <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--text-faint)' }}>{selected.groups?.name || 'No group'}</p>
                </div>
              </div>

              {/* Fields */}
              {[
                { icon: Mail,   label: 'Email', value: u?.email || '—' },
                { icon: Shield, label: 'Group', value: selected.groups?.name || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <row.icon size={15} color="var(--text-faint)" />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-dim)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}

              {/* Role selector in modal */}
              <div style={{ marginTop: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                  Change Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROLES.map(role => {
                    const rc2 = roleColor(role);
                    return (
                      <button
                        key={role}
                        onClick={() => changeRole(selected.id, selected.user_id, role)}
                        disabled={saving}
                        style={{
                          background: selected.role === role ? rc2.bg : 'var(--surface)',
                          border: `1.5px solid ${selected.role === role ? rc2.fg : 'var(--line)'}`,
                          color: selected.role === role ? rc2.fg : 'var(--text-dim)',
                          borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 13,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                      >
                        {selected.role === role && <Check size={13} />} {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                  <label style={labelStyle}>Full Name</label>
                  <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Mugisha Robert" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" required style={inputStyle} />
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

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 };
const inputStyle = { width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
