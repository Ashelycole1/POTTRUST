import React, { useState } from 'react';
import { MemberRow } from '../components/MemberRow';
import { Search, Filter, Shield, AlertCircle, CheckCircle2, X, Info } from 'lucide-react';

const mockMembers = [
  { id: 1, name: 'Rwothomio Evans',   initials: 'RE', role: 'Chairperson', status: 'PAID',    color: 'var(--green)', phone: '+256 701 234567', email: 'evans@pottrust.org', joined: 'Jan 2024', totalContrib: 'UGX 1,400,000', score: 840, tier: 'Excellent' },
  { id: 2, name: 'Alimpa A. Hillary', initials: 'AH', role: 'Treasurer',   status: 'PAID',    color: 'var(--green)', phone: '+256 752 987654', email: 'hillary@pottrust.org', joined: 'Feb 2024', totalContrib: 'UGX 1,400,000', score: 812, tier: 'Very Good' },
  { id: 3, name: 'Egabo Aaron',       initials: 'EA', role: 'Member',      status: 'PAID',    color: 'var(--green)', phone: '+256 783 111222', email: 'aaron@pottrust.org', joined: 'Jan 2024', totalContrib: 'UGX 1,400,000', score: 790, tier: 'Very Good' },
  { id: 4, name: 'Niwasiima A.',      initials: 'NA', role: 'Member',      status: 'PENDING', color: 'var(--gold)', phone: '+256 774 333444', email: 'niwasiima@pottrust.org', joined: 'Mar 2024', totalContrib: 'UGX 1,200,000', score: 720, tier: 'Good' },
  { id: 5, name: 'Onyango J. Steven', initials: 'OJ', role: 'Member',      status: 'PENDING', color: 'var(--gold)', phone: '+256 705 555666', email: 'steven@pottrust.org', joined: 'Apr 2024', totalContrib: 'UGX 1,000,000', score: 680, tier: 'Average' },
  { id: 6, name: 'Ssenyonjo K.',      initials: 'SK', role: 'Member',      status: 'OVERDUE', color: 'var(--coral)', phone: '+256 756 777888', email: 'ssenyonjo@pottrust.org', joined: 'Jan 2024', totalContrib: 'UGX 1,100,000', score: 580, tier: 'Needs Attention' },
  { id: 7, name: 'Tumwine N.',        initials: 'TN', role: 'Member',      status: 'PAID',    color: 'var(--green)', phone: '+256 787 999000', email: 'tumwine@pottrust.org', joined: 'Feb 2024', totalContrib: 'UGX 1,400,000', score: 805, tier: 'Very Good' },
];

export const MembersView = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PAID, PENDING, OVERDUE
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [selectedMember, setSelectedMember] = useState(null);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredMembers = mockMembers
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'ALL' || m.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
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
            <button 
              onClick={toggleSort}
              className="link" 
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13, color: 'var(--green)', fontWeight: 600 }}
            >
              <Filter size={16} /> Sort ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
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
                onAction={() => setSelectedMember(m)}
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

      {/* Member Details Modal */}
      {selectedMember && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'var(--bg-raised)', border: '1px solid var(--line)',
            borderRadius: 24, width: '100%', maxWidth: 400,
            padding: '28px', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Member Profile</h3>
              <button 
                onClick={() => setSelectedMember(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: selectedMember.color || 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#08251d'
              }}>
                {selectedMember.initials}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedMember.name}</h4>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-faint)' }}>{selectedMember.role}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, fontSize: 13, borderBottom: '1px solid var(--line)', pb: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Phone</span>
                <span style={{ fontWeight: 600 }}>{selectedMember.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Email</span>
                <span style={{ fontWeight: 600 }}>{selectedMember.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Joined Date</span>
                <span style={{ fontWeight: 600 }}>{selectedMember.joined}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total Contributed</span>
                <span style={{ fontWeight: 600 }}>{selectedMember.totalContrib}</span>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Info size={14} /> Trust Score Analytics
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>{selectedMember.score}</span>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, color: selectedMember.status === 'PAID' ? 'var(--green)' : 'var(--gold)',
                  background: selectedMember.status === 'PAID' ? 'var(--green-deep)' : 'var(--gold-deep)',
                  padding: '4px 8px', borderRadius: 6
                }}>
                  {selectedMember.tier}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

