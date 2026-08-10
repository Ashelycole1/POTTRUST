import React, { useState } from 'react';
import { X, Check, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RepayLoanModal = () => {
  const { loanRepayModalOpen, setLoanRepayModalOpen, repayLoan, memberLoan } = useApp();
  const [amount, setAmount] = useState(memberLoan.nextRepayment.toString());
  const [mode, setMode] = useState('MTN MoMo');
  const [txnRef, setTxnRef] = useState('');
  const [done, setDone] = useState(false);

  if (!loanRepayModalOpen) return null;

  const handleClose = () => {
    setDone(false);
    setTxnRef('');
    setLoanRepayModalOpen(false);
  };

  const handleSubmit = () => {
    if (!amount || !txnRef) return;
    repayLoan(amount, mode, txnRef);
    setDone(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--line)',
        borderRadius: 24, width: '100%', maxWidth: 420, padding: '32px 28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, margin: 0 }}>
              {done ? 'Repayment Submitted' : 'Repay Loan'}
            </h2>
            <p style={{ color: 'var(--text-faint)', fontSize: 12.5, margin: '4px 0 0' }}>
              {done ? 'Your instalment has been recorded' : `Outstanding: UGX ${memberLoan.outstanding.toLocaleString()}`}
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <X size={22} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={28} color="var(--green)" />
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: '0 0 24px', lineHeight: 1.5 }}>
              UGX {Number(amount).toLocaleString()} repayment via {mode} recorded. The group pot has been updated and the activity log has been notified.
            </p>
            <button onClick={handleClose} style={{ width: '100%', background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Amount (UGX)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'IBM Plex Mono', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Payment Mode</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              >
                <option>MTN MoMo</option>
                <option>Airtel Money</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Transaction Reference</label>
              <input
                type="text"
                value={txnRef}
                onChange={e => setTxnRef(e.target.value)}
                placeholder="e.g. 82103"
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!amount || !txnRef}
              style={{ width: '100%', background: amount && txnRef ? 'var(--green)' : 'var(--surface-2)', color: amount && txnRef ? '#08251d' : 'var(--text-dim)', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 14, cursor: amount && txnRef ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >
              Submit Repayment
            </button>
          </>
        )}
      </div>
    </div>
  );
};
