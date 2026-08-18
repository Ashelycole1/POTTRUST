import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PotCard, ContribCard, ScoreCard, LoanCard } from '../components/Cards';
import { MemberRow } from '../components/MemberRow';
import { DollarSign, CheckCircle, Landmark, Users, Check, X, Plus, Activity } from 'lucide-react';
import { QuickActionTile } from '../components/QuickActionTile';
import { useApp } from '../context/AppContext';

// Proof detail card shown in the review queue
const ProofCard = ({ proof }) => {
  const { verifyProof, rejectProof } = useApp();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason]       = useState('');

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 16, overflow: 'hidden', marginBottom: 14,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="avatar" style={{ background: 'var(--gold)', flexShrink: 0 }}>
          {proof.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{proof.memberName}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Submitted {proof.submittedAt}</div>
        </div>
        <span className="badge badge-pending">PENDING</span>
      </div>

      {/* Details */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DetailRow label="Mode"      value={proof.mode} />
        <DetailRow label="Amount"    value={`UGX ${Number(proof.amount).toLocaleString()}`} mono />
        <DetailRow label="Txn ref"   value={`#${proof.txnRef}`} mono />
        {proof.notes && <DetailRow label="Notes" value={proof.notes} />}
      </div>

      {/* Screenshot */}
      {(proof.screenshot || proof.proofUrl) && (
        <div style={{ padding: '0 16px 14px' }}>
          <img
            src={proof.screenshot ? URL.createObjectURL(proof.screenshot) : proof.proofUrl}
            alt="Payment screenshot"
            style={{ width: '100%', borderRadius: 10, maxHeight: 180, objectFit: 'cover', border: '1px solid var(--line)' }}
          />
        </div>
      )}

      {/* Reject reason input */}
      {rejecting && (
        <div style={{ padding: '0 16px 14px' }}>
          <input
            autoFocus
            type="text"
            placeholder="State reason for rejection..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg)', border: '1px solid var(--coral)',
              borderRadius: 10, padding: '10px 12px', color: 'var(--text)',
              fontSize: 13, fontFamily: 'Inter', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--line)' }}>
        {rejecting ? (
          <>
            <button
              onClick={() => setRejecting(false)}
              style={actionBtn('var(--surface-2)', 'var(--text-dim)')}
            >
              <X size={15} /> Cancel
            </button>
            <button
              onClick={() => rejectProof(proof.id, reason || 'No reason given')}
              style={actionBtn('var(--coral-deep)', 'var(--coral)')}
            >
              <X size={15} /> Confirm Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setRejecting(true)}
              style={actionBtn('var(--surface-2)', 'var(--coral)')}
            >
              <X size={15} /> Reject
            </button>
            <button
              onClick={() => verifyProof(proof.id)}
              style={actionBtn('var(--green-deep)', 'var(--green)')}
            >
              <Check size={15} /> Verify Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: mono ? 'IBM Plex Mono' : 'Inter' }}>{value}</span>
  </div>
);

const actionBtn = (bg, color) => ({
  flex: 1, background: bg, border: 'none', color,
  padding: '13px 0', fontWeight: 700, fontSize: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 6, cursor: 'pointer',
});

export const TreasurerView = () => {
  const [activeTab, setActiveTab] = useState('review');
  const navigate = useNavigate();
  const { pendingProofs, setProofModalOpen, displayName } = useApp();

  return (
    <>
      <div className="greeting">
        <p className="hello">Good morning</p>
        <p className="name">{displayName}</p>
        <span className="badge badge-admin" style={{ marginTop: 8, display: 'inline-block' }}>TREASURER</span>
      </div>

      <div className="carousel-wrap">
        <div className="carousel">
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
        <button className={`tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
          Review Queue {pendingProofs.length > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--coral)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {pendingProofs.length}
            </span>
          )}
        </button>
        <button className={`tab ${activeTab === 'foryou' ? 'active' : ''}`} onClick={() => setActiveTab('foryou')}>For You</button>
        <button className="tab" onClick={() => navigate('/members')}>Members</button>
      </div>

      {activeTab === 'review' && (
        <div className="section tab-panel">
          {pendingProofs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
              <CheckCircle size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Nothing waiting on you right now</p>
              <p style={{ fontSize: 13, margin: '6px 0 0' }}>All payment proofs have been reviewed.</p>
            </div>
          ) : (
            <>
              <div className="section-head">
                <h3>{pendingProofs.length} pending {pendingProofs.length === 1 ? 'proof' : 'proofs'}</h3>
              </div>
              {pendingProofs.map(proof => (
                <ProofCard key={proof.id} proof={proof} />
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'foryou' && (
        <div className="section tab-panel">
          <div className="section-head"><h3>Quick actions</h3></div>
          <div className="quick-grid">
            <QuickActionTile icon={Plus}        label="Contribute"  colorClass="qi-green" onClick={() => setProofModalOpen(true)} />
            <QuickActionTile icon={CheckCircle}  label="Verify Proof" colorClass="qi-gold"  onClick={() => setActiveTab('review')} />
            <QuickActionTile icon={Activity}     label="Request Loan" colorClass="qi-green" onClick={() => navigate('/loans')} />
            <QuickActionTile icon={Users}        label="Group Info"   colorClass="qi-gold"  onClick={() => navigate('/members')} />
          </div>
        </div>
      )}
    </>
  );
};
