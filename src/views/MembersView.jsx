import React, { useState } from 'react';
import { MemberRow } from '../components/MemberRow';
import { Search, Filter, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const mockMembers = [
  { id: 1, name: 'Rwothomio Evans',   initials: 'RE', role: 'Chairperson', status: 'PAID',    color: 'var(--green)' },
  { id: 2, name: 'Alimpa A. Hillary', initials: 'AH', role: 'Treasurer',   status: 'PAID',    color: 'var(--green)' },
  { id: 3, name: 'Egabo Aaron',       initials: 'EA', role: 'Member',      status: 'PAID',    color: 'var(--green)' },
  { id: 4, name: 'Niwasiima A.',      initials: 'NA', role: 'Member',      status: 'PENDING', color: 'var(--gold)' },
  { id: 5, name: 'Onyango J. Steven', initials: 'OJ', role: 'Member',      status: 'PENDING', color: 'var(--gold)' },
  { id: 6, name: 'Ssenyonjo K.',      initials: 'SK', role: 'Member',      status: 'OVERDUE', color: 'var(--coral)' },
  { id: 7, name: 'Tumwine N.',        initials: 'TN', role: 'Member',      status: 'PAID',    color: 'var(--green)' },
];

export const MembersView = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PAID, PENDING, OVERDUE

  const filteredMembers = mockMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="greeting">
        <p className="hello">Group Directory</p>
        <p className="name">All Members</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)', fontSize: 12, fontWeight: 600 }}>
            <CheckCircle2 size={16} color="var(--green)" /> Paid
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>25</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)', fontSize: 12, fontWeight: 600 }}>
            <Shield size={16} color="var(--gold)" /> Pending
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>2</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)', fontSize: 12, fontWeight: 600 }}>
            <AlertCircle size={16} color="var(--coral)" /> Overdue
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>1</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head" style={{ marginBottom: 16 }}>
          <h3>28 Members</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="link" style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <Filter size={16} /> Sort
            </button>
          </div>
        </div>

        {/* Search and Filter bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexDirection: 'column', sm: { flexDirection: 'row' } }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search members by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 12, padding: '12px 14px 12px 40px', color: 'var(--text)',
                fontSize: 14, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'var(--text)' : 'var(--surface-2)',
                  color: filter === f ? 'var(--bg)' : 'var(--text-dim)',
                  border: '1px solid var(--line)', borderRadius: 10, padding: '8px 14px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        {/* List */}
        <div className="member-list" style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '0 16px' }}>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((m, i) => (
              <MemberRow 
                key={m.id}
                name={m.name} 
                initials={m.initials} 
                sub={m.role} 
                status={m.status} 
                avatarColor={m.color} 
                actionLabel="View"
                onAction={() => {}}
                style={{ borderBottom: i < filteredMembers.length - 1 ? '1px solid var(--line)' : 'none', padding: '16px 0' }}
              />
            ))
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14, fontWeight: 500 }}>
              No members found matching your filters.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
