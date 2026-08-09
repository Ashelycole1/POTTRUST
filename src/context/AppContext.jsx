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

  // Whether upload modal is open
  const [proofModalOpen, setProofModalOpen] = useState(false);

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
