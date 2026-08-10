import React, { createContext, useContext, useState } from 'react';

// ── seed data ────────────────────────────────────────────────────────────────
const INITIAL_LOG = [
  { id: 1, c: 'var(--green)', h: '<b>Egabo Aaron</b> was verified PAID',           s: 'UGX 200,000 · MTN MoMo ref #82103',        t: 'Today, 9:14 AM' },
  { id: 2, c: 'var(--gold)',  h: '<b>Onyango J. Steven</b> uploaded a payment slip', s: 'Awaiting treasurer review',               t: 'Today, 8:02 AM' },
  { id: 3, c: 'var(--coral)', h: '<b>Ssenyonjo K.</b> marked OVERDUE',             s: 'Fine of UGX 5,000 applied automatically',  t: 'Yesterday, 6:30 PM' },
  { id: 4, c: 'var(--green)', h: 'Loan repayment received from <b>you</b>',        s: 'UGX 95,000 · pot updated',                 t: 'Yesterday, 2:11 PM' },
  { id: 5, c: 'var(--green)', h: '<b>Tumwine N.</b> was verified PAID',            s: 'UGX 200,000 · Airtel Money ref #55291',    t: 'Mon, 4:47 PM' },
  { id: 6, c: 'var(--gold)',  h: 'New loan request from <b>Ssenyonjo K.</b>',     s: 'UGX 450,000 requested · pending vote',     t: 'Mon, 11:20 AM' },
];

const INITIAL_SCHEDULE = [
  { id: 5, label: 'Instalment 5', date: '12 Aug 2026', amount: 95000, done: false },
  { id: 6, label: 'Instalment 6', date: '12 Sep 2026', amount: 95000, done: false },
  { id: 7, label: 'Instalment 7', date: '12 Oct 2026', amount: 95000, done: false },
  { id: 8, label: 'Instalment 8', date: '12 Nov 2026', amount: 95000, done: false },
];

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Member's contribution state
  const [memberContrib, setMemberContrib] = useState({
    paid: 180000,
    total: 200000,
    status: 'PAID', // PAID | PENDING | OVERDUE
    lastPayment: 'Paid 12 Jul via MTN MoMo',
  });

  // Group pot
  const [groupPot, setGroupPot] = useState(4820000);

  // Pending proofs queue (what treasurer sees)
  const [pendingProofs, setPendingProofs] = useState([]);

  // Activity log
  const [activityLog, setActivityLog] = useState(INITIAL_LOG);

  // Whether modals are open
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [loanRequestModalOpen, setLoanRequestModalOpen] = useState(false);
  const [loanRepayModalOpen, setLoanRepayModalOpen] = useState(false);

  // Loan state
  const [memberLoan, setMemberLoan] = useState({
    outstanding: 620000,
    nextRepayment: 95000,
    totalPaid: 380000,
    totalTerm: 1000000,
  });

  const [loansList, setLoansList] = useState([
    { id: 1, name: 'You', initials: 'NA', sub: 'UGX 620,000 outstanding · 4 of 8 instalments paid', status: 'ACTIVE', color: 'var(--gold)' },
    { id: 2, name: 'Egabo Aaron', initials: 'EA', sub: 'UGX 300,000 · cleared 2 Jul', status: 'CLEARED', color: 'var(--green)' },
    { id: 3, name: 'Ssenyonjo K.', initials: 'SK', sub: 'UGX 450,000 · repayment overdue', status: 'AT RISK', color: 'var(--coral)' },
  ]);

  const [repaymentSchedule, setRepaymentSchedule] = useState(INITIAL_SCHEDULE);

  // Add a log entry (prepend so newest is first)
  const addLogEntry = (entry) => {
    setActivityLog(prev => [{ id: Date.now(), ...entry }, ...prev]);
  };

  // Member submits proof
  const submitProof = (proofData) => {
    const proof = {
      id: Date.now(),
      memberName: 'Niwasiima A.',
      initials: 'NA',
      amount: proofData.amount,
      mode: proofData.mode,
      txnRef: proofData.txnRef,
      screenshot: proofData.screenshot,
      notes: proofData.notes,
      submittedAt: 'Just now',
      status: 'PENDING',
    };

    setPendingProofs(prev => [proof, ...prev]);
    setMemberContrib(prev => ({
      ...prev,
      status: 'PENDING',
      lastPayment: `Slip uploaded · awaiting review`,
    }));

    addLogEntry({
      c: 'var(--gold)',
      h: '<b>Niwasiima A.</b> uploaded a payment slip',
      s: `UGX ${Number(proofData.amount).toLocaleString()} · ${proofData.mode} ref #${proofData.txnRef}`,
      t: 'Just now',
    });

    setProofModalOpen(false);
  };

  // Treasurer verifies proof
  const verifyProof = (proofId) => {
    const proof = pendingProofs.find(p => p.id === proofId);
    if (!proof) return;

    setPendingProofs(prev => prev.filter(p => p.id !== proofId));
    setGroupPot(prev => prev + Number(proof.amount));
    setMemberContrib(prev => ({
      ...prev,
      paid: prev.paid + Number(proof.amount),
      status: 'PAID',
      lastPayment: `Paid via ${proof.mode} ref #${proof.txnRef}`,
    }));

    addLogEntry({
      c: 'var(--green)',
      h: `<b>${proof.memberName}</b> was verified PAID`,
      s: `UGX ${Number(proof.amount).toLocaleString()} · ${proof.mode} ref #${proof.txnRef}`,
      t: 'Just now',
    });
  };

  // Treasurer rejects proof
  const rejectProof = (proofId, reason) => {
    const proof = pendingProofs.find(p => p.id === proofId);
    if (!proof) return;

    setPendingProofs(prev => prev.filter(p => p.id !== proofId));
    setMemberContrib(prev => ({
      ...prev,
      status: 'OVERDUE',
      lastPayment: `Rejected: ${reason}`,
    }));

    addLogEntry({
      c: 'var(--coral)',
      h: `Payment proof from <b>${proof.memberName}</b> rejected`,
      s: `Reason: ${reason}`,
      t: 'Just now',
    });
  };

  // Repay a loan
  const repayLoan = (repayAmount, mode, txnRef) => {
    const amt = Number(repayAmount);
    setMemberLoan(prev => {
      const newOutstanding = Math.max(0, prev.outstanding - amt);
      return {
        ...prev,
        outstanding: newOutstanding,
        totalPaid: prev.totalPaid + amt,
      };
    });

    // Mark instalment as paid in schedule
    setRepaymentSchedule(prev => {
      let remainingRepay = amt;
      return prev.map(inst => {
        if (!inst.done && remainingRepay >= inst.amount) {
          remainingRepay -= inst.amount;
          return { ...inst, done: true };
        }
        return inst;
      });
    });

    setGroupPot(prev => prev + amt);

    addLogEntry({
      c: 'var(--green)',
      h: 'Loan repayment received from <b>you</b>',
      s: `UGX ${amt.toLocaleString()} · ${mode} ref #${txnRef} · pot updated`,
      t: 'Just now',
    });

    // Update list status if cleared
    setLoansList(prev => prev.map(l => {
      if (l.name === 'You') {
        const isNowCleared = memberLoan.outstanding - amt <= 0;
        return {
          ...l,
          sub: isNowCleared ? `UGX ${memberLoan.totalTerm.toLocaleString()} · fully cleared` : `UGX ${(memberLoan.outstanding - amt).toLocaleString()} outstanding`,
          status: isNowCleared ? 'CLEARED' : 'ACTIVE',
          color: isNowCleared ? 'var(--green)' : 'var(--gold)',
        };
      }
      return l;
    }));

    setLoanRepayModalOpen(false);
  };

  // Request new loan
  const requestLoan = (loanData) => {
    addLogEntry({
      c: 'var(--gold)',
      h: 'New loan request from <b>you</b>',
      s: `UGX ${Number(loanData.amount).toLocaleString()} requested · pending approval`,
      t: 'Just now',
    });
    setLoanRequestModalOpen(false);
  };

  // Trust Score state
  const [trustScore, setTrustScore] = useState({
    score: 812,
    tier: 'Very good',
    streak: 14,
    loanRepayments: '4 / 4 on time',
    pendingProofs: 1,
    finesIssued: 0,
    lateContributions: 0,
    history: [
      { cycle: 'Aug 2026', score: 812, change: '+3' },
      { cycle: 'Jul 2026', score: 809, change: '+11' },
      { cycle: 'Jun 2026', score: 798, change: '+8' },
      { cycle: 'May 2026', score: 790, change: '-5' },
    ],
    tips: [
      { tip: 'Resolve your pending payment proof', impact: 'High impact', color: 'var(--gold)' },
      { tip: 'Pay your next loan instalment before the due date', impact: 'High impact', color: 'var(--gold)' },
      { tip: 'Maintain your contribution streak for 3 more cycles', impact: 'Medium impact', color: 'var(--text-dim)' },
    ]
  });

  return (
    <AppContext.Provider value={{
      memberContrib,
      groupPot,
      pendingProofs,
      activityLog,
      proofModalOpen,
      setProofModalOpen,
      submitProof,
      verifyProof,
      rejectProof,
      // Loan properties
      memberLoan,
      loansList,
      repaymentSchedule,
      loanRequestModalOpen,
      setLoanRequestModalOpen,
      loanRepayModalOpen,
      setLoanRepayModalOpen,
      repayLoan,
      requestLoan,
      // Trust properties
      trustScore,
      setTrustScore,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

