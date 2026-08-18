/**
 * MembersView — Chairperson view
 * Loads real members from the current user's group.
 * Chairperson can change roles of any member within their group.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Shield, AlertCircle, CheckCircle2, X, Info, ChevronDown, Check, Loader } from 'lucide-react';
import { MemberRow } from '../components/MemberRow';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

const ROLES = ['Member', 'Treasurer', 'Chairperson'];

const roleColor = (role) => ({
  Chairperson: { bg: 'var(--green-deep)',      fg: 'var(--green)' },
  Treasurer:   { bg: 'rgba(251,191,36,0.15)',  fg: 'var(--gold)' },
  Member:      { bg: 'var(--surface-2)',        fg: 'var(--text-dim)' },
}[role] || { bg: 'var(--surface-2)', fg: 'var(--text-dim)' });

const statusColor = (s) => ({
  PAID:    'var(--green)',
  PENDING: 'var(--gold)',
  OVERDUE: 'var(--coral)',
}[s] || 'var(--text-dim)');

export const MembersView = ({ role }) => {
  const { groupData, userData } = useApp();
  const canEditRoles = role === 'Chairperson' || role === 'Admin';

  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selected, setSelected]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [savedId, setSavedId]     = useState(null);

  // ── Load group members ───────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!groupData?.id) { setLoading(false); return; }
    setLoading(true);

    // Members + their latest contribution status + trust score
    const { data: gms } = await supabase
      .from('group_members')
      .select('id, role, user_id, users(id, first_name, last_name, email, avatar_url, created_at)')
      .eq('group_id', groupData.id);

    if (!gms) { setLoading(false); return; }

    // Fetch latest contribution per member for this group
    const { data: contribs } = await supabase
      .from('contributions')
      .select('user_id, status, amount, cycle_label, submitted_at')
      .eq('group_id', groupData.id)
      .order('submitted_at', { ascending: false });

    // Fetch trust scores
    const { data: scores } = await supabase
      .from('trust_scores')
      .select('user_id, score, tier')
      .eq('group_id', groupData.id)
      .order('computed_at', { ascending: false });

    // Merge data
    const enriched = gms.map(gm => {
      const u            = gm.users;
      const latestContrib = (contribs || []).find(c => c.user_id === u?.id);
      const ts           = (scores || []).find(s => s.user_id === u?.id);
      return {
        memberId:   gm.id,
        userId:     u?.id,
        name:       `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.email || 'Unknown',
        initials:   `${u?.first_name?.[0] || ''}${u?.last_name?.[0] || ''}`.toUpperCase() || '?',
        email:      u?.email || '—',
        avatarUrl:  u?.avatar_url,
        joined:     u?.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—',
        role:       gm.role,
        status:     latestContrib?.status || 'PENDING',
        cycle:      latestContrib?.cycle_label || '—',
        amount:     latestContrib?.amount || 0,
        score:      ts?.score || null,
        tier:       ts?.tier  || null,
      };
    });

    setMembers(enriched);
    setLoading(false);
  }, [groupData]);

  useEffect(() => { load(); }, [load]);

  // ── Role change ──────────────────────────────────────────────────────────
  const changeRole = async (memberId, newRole) => {
    setSaving(true);
    const { error } = await supabase
      .from('group_members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (!error) {
      setMembers(prev => prev.map(m => m.memberId === memberId ? { ...m, role: newRole } : m));
      if (selected?.memberId === memberId) setSelected(prev => ({ ...prev, role: newRole }));
      setSavedId(memberId);
      setTimeout(() => setSavedId(null), 2000);
    } else {
      console.error('[MembersView changeRole]', error);
    }
    setSaving(false);
  };

  // ── Stats from real data ─────────────────────────────────────────────────
  const paidCount    = members.filter(m => m.status === 'PAID').length;
  const pendingCount = members.filter(m => m.status === 'PENDING').length;
  const overdueCount = members.filter(m => m.status === 'OVERDUE').length;

  const filtered = members
    .filter(m => {
      const q = search.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      const matchFilter = filter === 'ALL' || m.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: 'var(--text-dim)' }}>
      <Loader size={20} style={{ animation: 'spin 0.8s linear infinite' }} />
      <span>Loading members…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  if (!groupData) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
      <Shield size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
      <p style={{ fontSize: 15, fontWeight: 600 }}>You are not part of any group yet.</p>
      <p style={{ fontSize: 13, marginTop: 8 }}>Ask your Admin to add you to a SACCO group.</p>
    </div>
  );

  return (
    <>
      <div className="greeting">
        <p className="hello">{groupData?.name || 'Group'}</p>
        <p className="name">All Members</p>
      </div>

      {/* Stats — real numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: CheckCircle2, label: 'Paid',    value: paidCount,    color: 'var(--green)' },
          { icon: Shield,       label: 'Pending', value: pendingCount, color: 'var(--gold)'  },
          { icon: AlertCircle,  label: 'Overdue', value: overdueCount, color: 'var(--coral)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)', fontSize: 12, fontWeight: 600 }}>
              <s.icon size={16} color={s.color} /> {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head" style={{ marginBottom: 16 }}>
          <h3>{members.length} Members</h3>
          <button
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13, color: 'var(--green)', fontWeight: 600 }}
          >
            <Filter size={16} /> Sort ({sortOrder === 'asc' ? 'A–Z' : 'Z–A'})
          </button>
        </div>

        {/* Search + Status filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search members by name, email or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px 12px 40px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ background: filter === f ? 'var(--text)' : 'var(--surface-2)', color: filter === f ? 'var(--bg)' : 'var(--text-dim)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Member list */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14, fontWeight: 500 }}>
              No members match your search.
            </div>
          ) : filtered.map((m, i) => {
            const rc     = roleColor(m.role);
            const isSaved = savedId === m.memberId;

            return (
              <div key={m.memberId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
                {/* Avatar */}
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt={m.name} style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                    {m.initials}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: statusColor(m.status), fontWeight: 700 }}>{m.status}</span>
                    · {m.cycle}
                  </div>
                </div>

                {/* Role dropdown */}
                {canEditRoles ? (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <select
                      value={m.role}
                      onChange={e => changeRole(m.memberId, e.target.value)}
                      disabled={saving}
                      style={{
                        appearance: 'none', background: rc.bg, color: rc.fg,
                        border: `1px solid ${rc.fg}40`, borderRadius: 8,
                        padding: '6px 26px 6px 10px', fontSize: 11.5, fontWeight: 700,
                        cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: rc.fg, pointerEvents: 'none' }} />
                  </div>
                ) : (
                  <div style={{
                    background: rc.bg, color: rc.fg, border: `1px solid ${rc.fg}40`,
                    borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, flexShrink: 0
                  }}>
                    {m.role}
                  </div>
                )}

                {isSaved && <Check size={15} color="var(--green)" style={{ flexShrink: 0 }} />}

                <button
                  onClick={() => setSelected(m)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', cursor: 'pointer', flexShrink: 0 }}
                >
                  View
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)', borderRadius: 24, width: '100%', maxWidth: 420, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, fontFamily: 'Sora' }}>Member Profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              {selected.avatarUrl ? (
                <img src={selected.avatarUrl} alt={selected.name} style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{selected.initials}</div>
              )}
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selected.name}</h4>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-faint)' }}>Joined {selected.joined}</p>
              </div>
            </div>

            {/* Info rows */}
            {[
              { label: 'Email',       value: selected.email },
              { label: 'Status',      value: selected.status },
              { label: 'Last Cycle',  value: selected.cycle  },
              { label: 'Last Amount', value: selected.amount ? `UGX ${selected.amount.toLocaleString()}` : '—' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-dim)' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}

            {/* Trust score */}
            {selected.score !== null && (
              <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--line)', marginTop: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Info size={14} /> Trust Score
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{selected.score}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', background: 'var(--green-deep)', padding: '4px 10px', borderRadius: 6 }}>{selected.tier}</span>
                </div>
              </div>
            )}

            {/* Role picker */}
            {canEditRoles && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                  Change Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {ROLES.map(roleOption => {
                    const rc = roleColor(roleOption);
                    const isActive = selected.role === roleOption;
                    return (
                      <button
                        key={roleOption}
                        onClick={() => changeRole(selected.memberId, roleOption)}
                        disabled={saving}
                        style={{
                          background: isActive ? rc.bg : 'var(--surface)',
                          border: `1.5px solid ${isActive ? rc.fg : 'var(--line)'}`,
                          color: isActive ? rc.fg : 'var(--text-dim)',
                          borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 12,
                          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          transition: 'all 0.15s',
                        }}
                      >
                        {isActive && <Check size={13} />}
                        {roleOption}
                      </button>
                    );
                  })}
                </div>
                {saving && <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>Saving…</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
