import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RequestLoanModal = () => {
  const { loanRequestModalOpen, setLoanRequestModalOpen, requestLoan } = useApp();
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('3 Months');
  const [done, setDone] = useState(false);

  if (!loanRequestModalOpen) return null;

  const handleClose = () => {
    setDone(false);
    setAmount('');
    setPurpose('');
    setLoanRequestModalOpen(false);
  };

  const handleSubmit = () => {
    if (!amount || !purpose) return;
    requestLoan({ amount, purpose, duration });
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
              {done ? 'Request Submitted' : 'Request Loan'}
            </h2>
            <p style={{ color: 'var(--text-faint)', fontSize: 12.5, margin: '4px 0 0' }}>
              {done ? 'Your request is pending review' : 'Apply for a new loan'}
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <X size={22} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={28} color="var(--gold)" />
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: '0 0 24px', lineHeight: 1.5 }}>
              Your loan request for UGX {Number(amount).toLocaleString()} has been submitted. The chairperson and committee will review your request.
            </p>
            <button onClick={handleClose} style={{ width: '100%', background: 'var(--gold)', color: '#251a08', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
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
                placeholder="0"
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'IBM Plex Mono', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="e.g. School Fees"
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Repayment Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              >
                <option>1 Month</option>
                <option>3 Months</option>
                <option>6 Months</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!amount || !purpose}
              style={{ width: '100%', background: amount && purpose ? 'var(--gold)' : 'var(--surface-2)', color: amount && purpose ? '#251a08' : 'var(--text-dim)', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 14, cursor: amount && purpose ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >
              Submit Request
            </button>
          </>
        )}
      </div>
    </div>
  );
};
