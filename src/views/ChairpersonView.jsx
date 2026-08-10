import React, { useState } from 'react';
import { PotCard, ScoreCard, ContribCard, LoanCard } from '../components/Cards';
import { MemberRow } from '../components/MemberRow';
import { useApp } from '../context/AppContext';
import { Check, X, AlertCircle } from 'lucide-react';

const RejectModal = ({ member, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)', borderRadius: 24, width: '100%', maxWidth: 380, padding: 28 }}>
        <h3 style={{ fontFamily: 'Sora', fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Reject Loan</h3>
        <p style={{ color: 'var(--text-faint)', fontSize: 13, margin: '0 0 20px' }}>State your reason for rejecting {member}'s loan request.</p>
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Insufficient trust score..."
          style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'Inter', resize: 'none', height: 90, outline: 'none', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-dim)', borderRadius: 12, padding: '12px 0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onConfirm(reason || 'No reason given')}
            style={{ flex: 1, background: 'var(--coral-deep)', color: 'var(--coral)', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <X size={14} /> Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const FineModal = ({ member, onConfirm, onClose }) => {
  const [amount, setAmount] = useState('5000');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--line)', borderRadius: 24, width: '100%', maxWidth: 380, padding: 28 }}>
        <h3 style={{ fontFamily: 'Sora', fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Issue Fine</h3>
        <p style={{ color: 'var(--text-faint)', fontSize: 13, margin: '0 0 20px' }}>You are issuing a fine to <strong>{member}</strong> for overdue contribution.</p>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Fine Amount (UGX)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'IBM Plex Mono', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-dim)', borderRadius: 12, padding: '12px 0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onConfirm(Number(amount))}
            style={{ flex: 1, background: 'var(--coral-deep)', color: 'var(--coral)', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <AlertCircle size={14} /> Confirm Fine
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChairpersonView = () => {
  const [activeTab, setActiveTab] = useState('loans');
  const [toast, setToast]         = useState('');
  const [rejectTarget, setRejectTarget] = useState(null); // { id, name }
  const [fineTarget, setFineTarget]     = useState(null); // { id, name }

  const {
    pendingLoanRequests,
    pendingFines,
    approveLoan,
    rejectLoan,
    issueFine,
  } = useApp();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (id, name) => {
    await approveLoan(id, name);
    showToast(`Loan for ${name} approved`);
  };

  const handleRejectConfirm = async (reason) => {
    await rejectLoan(rejectTarget.id, rejectTarget.name, reason);
    showToast(`Loan for ${rejectTarget.name} rejected`);
    setRejectTarget(null);
  };

  const handleFineConfirm = async (amount) => {
    await issueFine(fineTarget.id, fineTarget.name, amount);
    showToast(`Fine of UGX ${Number(amount).toLocaleString()} issued to ${fineTarget.name}`);
    setFineTarget(null);
  };

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">Rwothomio Evans</p>
        <span className="badge badge-admin" style={{ marginTop: 8, display: 'inline-block' }}>CHAIRPERSON</span>
      </div>

      {toast && (
        <div style={{ background: 'var(--green-deep)', border: '1px solid var(--green)', color: 'var(--green)', padding: '12px 16px', borderRadius: 12, fontSize: 13.5, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {toast}
        </div>
      )}

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
        <button className={`tab ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>
          Loan Approvals
          {pendingLoanRequests.length > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--coral)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {pendingLoanRequests.length}
            </span>
          )}
        </button>
        <button className={`tab ${activeTab === 'fines' ? 'active' : ''}`} onClick={() => setActiveTab('fines')}>
          Fines
          {pendingFines.length > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--gold)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {pendingFines.length}
            </span>
          )}
        </button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
      </div>

      {activeTab === 'loans' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Pending Loan Requests</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingLoanRequests.length > 0 ? (
              pendingLoanRequests.map(loan => (
                <div key={loan.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ background: loan.avatarColor }}>{loan.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{loan.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>{loan.sub}</div>
                      </div>
                      <span className="badge badge-pending">PENDING</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', borderTop: '1px solid var(--line)' }}>
                    <button
                      onClick={() => setRejectTarget({ id: loan.id, name: loan.name })}
                      style={{ flex: 1, background: 'none', border: 'none', color: 'var(--coral)', padding: '12px 0', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(loan.id, loan.name)}
                      style={{ flex: 1, background: 'var(--green-deep)', border: 'none', color: 'var(--green)', padding: '12px 0', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <Check size={14} /> Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
                <Check size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No pending loan requests</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fines' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Overdue Members — Issue Fines</h3></div>
          <div className="member-list">
            {pendingFines.length > 0 ? (
              pendingFines.map(fine => (
                <MemberRow
                  key={fine.id}
                  name={fine.name}
                  initials={fine.initials}
                  sub={fine.sub}
                  status={fine.status}
                  avatarColor={fine.avatarColor}
                  actionLabel="Issue Fine"
                  onAction={() => setFineTarget({ id: fine.id, name: fine.name })}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
                <AlertCircle size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No overdue contributions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>All 28 members</h3></div>
          <div className="member-list">
            <MemberRow name="Rwothomio Evans (you)" initials="RE" sub="Chairperson" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Alimpa A. Hillary" initials="AH" sub="Treasurer" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Niwasiima A." initials="NA" sub="Member · Paid" status="PAID" avatarColor="var(--green)" />
            <MemberRow name="Ssenyonjo K." initials="SK" sub="Member · 3 days overdue" status="OVERDUE" avatarColor="var(--coral)" />
            <MemberRow name="Onyango J. Steven" initials="OJ" sub="Member · Slip under review" status="PENDING" avatarColor="var(--gold)" />
          </div>
        </div>
      )}

      {/* Modals */}
      {rejectTarget && (
        <RejectModal
          member={rejectTarget.name}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
      {fineTarget && (
        <FineModal
          member={fineTarget.name}
          onConfirm={handleFineConfirm}
          onClose={() => setFineTarget(null)}
        />
      )}
    </>
  );
};
