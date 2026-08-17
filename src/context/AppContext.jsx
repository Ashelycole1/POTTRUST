import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

// ── Seed / fallback data (used when Supabase is not configured) ───────────────
const INITIAL_LOG = [
  { id: 1, color_hint: 'green', headline: '<b>Egabo Aaron</b> was verified PAID',           detail: 'UGX 200,000 · MTN MoMo ref #82103',        created_at: 'Today, 9:14 AM' },
  { id: 2, color_hint: 'gold',  headline: '<b>Onyango J. Steven</b> uploaded a payment slip', detail: 'Awaiting treasurer review',               created_at: 'Today, 8:02 AM' },
  { id: 3, color_hint: 'coral', headline: '<b>Ssenyonjo K.</b> marked OVERDUE',              detail: 'Fine of UGX 5,000 applied automatically',  created_at: 'Yesterday, 6:30 PM' },
  { id: 4, color_hint: 'green', headline: 'Loan repayment received from <b>you</b>',         detail: 'UGX 95,000 · pot updated',                 created_at: 'Yesterday, 2:11 PM' },
  { id: 5, color_hint: 'green', headline: '<b>Tumwine N.</b> was verified PAID',             detail: 'UGX 200,000 · Airtel Money ref #55291',    created_at: 'Mon, 4:47 PM' },
  { id: 6, color_hint: 'gold',  headline: 'New loan request from <b>Ssenyonjo K.</b>',       detail: 'UGX 450,000 requested · pending vote',     created_at: 'Mon, 11:20 AM' },
];

const INITIAL_SCHEDULE = [
  { id: 5, label: 'Instalment 5', date: '12 Aug 2026', amount: 95000, done: false },
  { id: 6, label: 'Instalment 6', date: '12 Sep 2026', amount: 95000, done: false },
  { id: 7, label: 'Instalment 7', date: '12 Oct 2026', amount: 95000, done: false },
  { id: 8, label: 'Instalment 8', date: '12 Nov 2026', amount: 95000, done: false },
];

const isSupabaseConfigured = () =>
  !!import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

const AppContext = createContext(null);

export const AppProvider = ({ children, supabaseData = null }) => {
  const { user: clerkUser } = useUser();

  // ── Derive display name from Clerk or fallback ────────────────────────────
  const displayName = clerkUser
    ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.primaryEmailAddress?.emailAddress
    : 'Ashelycole';

  // ── Use Supabase data if available, else use mock data ───────────────────
  const [memberContrib, setMemberContrib] = useState({
    paid:        supabaseData?.myContrib?.amount || 180000,
    total:       supabaseData?.groupData?.contribution_amount || 200000,
    status:      supabaseData?.myContrib?.status || 'PAID',
    lastPayment: supabaseData?.myContrib
      ? `Paid via ${supabaseData.myContrib.payment_mode}`
      : 'Paid 12 Jul via MTN MoMo',
  });

  const [groupPot, setGroupPot] = useState(
    supabaseData?.groupData?.total_pot || 4820000
  );

  const [pendingProofs, setPendingProofs] = useState(
    supabaseData?.pendingProofs || []
  );

  const [activityLog, setActivityLog] = useState(
    supabaseData?.auditLogs?.length ? supabaseData.auditLogs : INITIAL_LOG
  );

  // Modals
  const [proofModalOpen,        setProofModalOpen]        = useState(false);
  const [loanRequestModalOpen,  setLoanRequestModalOpen]  = useState(false);
  const [loanRepayModalOpen,    setLoanRepayModalOpen]    = useState(false);
  const [notificationsOpen,     setNotificationsOpen]     = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState(
    supabaseData?.notifications?.length
      ? supabaseData.notifications
      : [
          { id: 1, title: 'Your payment was verified',    description: 'Treasurer verified your UGX 200,000 contribution.', created_at: '2 hours ago', is_read: false },
          { id: 2, title: 'New loan request',             description: 'Ssenyonjo K. requested UGX 450,000.',              created_at: '1 day ago',   is_read: true  },
          { id: 3, title: 'Upcoming due date',            description: 'Your next loan instalment of UGX 95,000 is due in 3 days.', created_at: '2 days ago', is_read: true  },
        ]
  );

  // Loan state
  const [memberLoan, setMemberLoan] = useState(() => {
    const sl = supabaseData?.myLoan;
    return {
      outstanding:   sl?.outstanding  || 620000,
      nextRepayment: 95000,
      totalPaid:     sl?.total_paid   || 380000,
      totalTerm:     sl?.amount       || 1000000,
    };
  });

  const [loansList, setLoansList] = useState(() => {
    if (supabaseData?.loans?.length) {
      return supabaseData.loans.map(l => ({
        id:      l.id,
        name:    `${l.users?.first_name} ${l.users?.last_name}`,
        initials: `${l.users?.first_name?.[0] || ''}${l.users?.last_name?.[0] || ''}`,
        sub:     `UGX ${l.outstanding.toLocaleString()} outstanding`,
        status:  l.status,
        color:   l.status === 'CLEARED' ? 'var(--green)' : l.status === 'AT RISK' ? 'var(--coral)' : 'var(--gold)',
      }));
    }
    return [
      { id: 1, name: 'You',           initials: 'NA', sub: 'UGX 620,000 outstanding · 4 of 8 instalments paid', status: 'ACTIVE',  color: 'var(--gold)'  },
      { id: 2, name: 'Egabo Aaron',   initials: 'EA', sub: 'UGX 300,000 · cleared 2 Jul',                       status: 'CLEARED', color: 'var(--green)' },
      { id: 3, name: 'Ssenyonjo K.',  initials: 'SK', sub: 'UGX 450,000 · repayment overdue',                   status: 'AT RISK', color: 'var(--coral)' },
    ];
  });

  const [repaymentSchedule, setRepaymentSchedule] = useState(INITIAL_SCHEDULE);

  const [trustScore, setTrustScore] = useState(
    supabaseData?.trustScore
      ? { score: supabaseData.trustScore.score, tier: supabaseData.trustScore.tier, streak: 14, loanRepayments: '4 / 4 on time', pendingProofs: 1, finesIssued: 0, lateContributions: 0, history: [], tips: [] }
      : {
          score: 812, tier: 'Very good', streak: 14,
          loanRepayments: '4 / 4 on time', pendingProofs: 1, finesIssued: 0, lateContributions: 0,
          history: [
            { cycle: 'Aug 2026', score: 812, change: '+3' },
            { cycle: 'Jul 2026', score: 809, change: '+11' },
            { cycle: 'Jun 2026', score: 798, change: '+8'  },
            { cycle: 'May 2026', score: 790, change: '-5'  },
          ],
          tips: [
            { tip: 'Resolve your pending payment proof',                          impact: 'High impact',   color: 'var(--gold)'     },
            { tip: 'Pay your next loan instalment before the due date',           impact: 'High impact',   color: 'var(--gold)'     },
            { tip: 'Maintain your contribution streak for 3 more cycles',         impact: 'Medium impact', color: 'var(--text-dim)' },
          ],
        }
  );

  // Chairperson local state
  const [pendingLoanRequests, setPendingLoanRequests] = useState([
    { id: 1, name: 'Ssenyonjo K.', initials: 'SK', sub: 'UGX 450,000 requested · pending vote', status: 'PENDING', avatarColor: 'var(--gold)' },
    { id: 2, name: 'Niwasiima A.', initials: 'NA', sub: 'UGX 200,000 requested · pending vote', status: 'PENDING', avatarColor: 'var(--gold)' },
  ]);
  const [pendingFines, setPendingFines] = useState([
    { id: 1, name: 'Ssenyonjo K.',      initials: 'SK', sub: '3 days overdue',  status: 'OVERDUE', avatarColor: 'var(--coral)' },
    { id: 2, name: 'Onyango J. Steven', initials: 'OJ', sub: '5 days overdue',  status: 'OVERDUE', avatarColor: 'var(--coral)' },
  ]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addLogEntry = useCallback(async (entry) => {
    const local = { id: Date.now(), ...entry, created_at: 'Just now' };
    setActivityLog(prev => [local, ...prev]);

    if (isSupabaseConfigured() && supabaseData?.groupData?.id) {
      await supabase.from('audit_logs').insert({
        group_id:   supabaseData.groupData.id,
        action:     entry.action || 'GENERIC',
        headline:   entry.headline,
        detail:     entry.detail,
        color_hint: entry.color_hint,
      });
    }
  }, [supabaseData]);

  // ── Submit Contribution Proof ────────────────────────────────────────────
  const submitProof = useCallback(async (proofData) => {
    const proof = {
      id:          Date.now(),
      memberName:  displayName,
      initials:    displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      amount:      proofData.amount,
      mode:        proofData.mode,
      txnRef:      proofData.txnRef,
      screenshot:  proofData.screenshot,
      notes:       proofData.notes,
      submittedAt: 'Just now',
      status:      'PENDING',
    };

    setPendingProofs(prev => [proof, ...prev]);
    setMemberContrib(prev => ({ ...prev, status: 'PENDING', lastPayment: 'Slip uploaded · awaiting review' }));

    await addLogEntry({
      color_hint: 'gold',
      headline:   `<b>${displayName}</b> uploaded a payment slip`,
      detail:     `UGX ${Number(proofData.amount).toLocaleString()} · ${proofData.mode} ref #${proofData.txnRef}`,
      action:     'PROOF_SUBMITTED',
    });

    // Persist to Supabase if configured
    if (isSupabaseConfigured() && supabaseData?.userData?.id && supabaseData?.groupData?.id) {
      await supabase.from('contributions').insert({
        group_id:     supabaseData.groupData.id,
        user_id:      supabaseData.userData.id,
        cycle_label:  'Aug 2026',
        amount:       Number(proofData.amount),
        payment_mode: proofData.mode,
        txn_ref:      proofData.txnRef,
        proof_url:    proofData.proofUrl || null,
        notes:        proofData.notes,
        status:       'PENDING',
      });
    }

    setProofModalOpen(false);
  }, [addLogEntry, displayName, supabaseData]);

  // ── Verify Proof (Treasurer) ─────────────────────────────────────────────
  const verifyProof = useCallback(async (proofId) => {
    const proof = pendingProofs.find(p => p.id === proofId);
    if (!proof) return;

    setPendingProofs(prev => prev.filter(p => p.id !== proofId));
    setGroupPot(prev => prev + Number(proof.amount));
    setMemberContrib(prev => ({
      ...prev,
      paid:        prev.paid + Number(proof.amount),
      status:      'PAID',
      lastPayment: `Paid via ${proof.mode} ref #${proof.txnRef}`,
    }));

    await addLogEntry({
      color_hint: 'green',
      headline:   `<b>${proof.memberName}</b> was verified PAID`,
      detail:     `UGX ${Number(proof.amount).toLocaleString()} · ${proof.mode} ref #${proof.txnRef}`,
      action:     'CONTRIBUTION_VERIFIED',
    });

    if (isSupabaseConfigured()) {
      await supabase
        .from('contributions')
        .update({ status: 'PAID', reviewed_at: new Date().toISOString() })
        .eq('txn_ref', proof.txnRef);

      await supabase
        .from('groups')
        .update({ total_pot: groupPot + Number(proof.amount) })
        .eq('id', supabaseData?.groupData?.id);
    }
  }, [pendingProofs, addLogEntry, groupPot, supabaseData]);

  // ── Reject Proof (Treasurer) ─────────────────────────────────────────────
  const rejectProof = useCallback(async (proofId, reason) => {
    const proof = pendingProofs.find(p => p.id === proofId);
    if (!proof) return;

    setPendingProofs(prev => prev.filter(p => p.id !== proofId));
    setMemberContrib(prev => ({ ...prev, status: 'OVERDUE', lastPayment: `Rejected: ${reason}` }));

    await addLogEntry({
      color_hint: 'coral',
      headline:   `Payment proof from <b>${proof.memberName}</b> rejected`,
      detail:     `Reason: ${reason}`,
      action:     'PROOF_REJECTED',
    });

    if (isSupabaseConfigured()) {
      await supabase
        .from('contributions')
        .update({ status: 'REJECTED', rejection_reason: reason, reviewed_at: new Date().toISOString() })
        .eq('txn_ref', proof.txnRef);
    }
  }, [pendingProofs, addLogEntry]);

  // ── Repay Loan ───────────────────────────────────────────────────────────
  const repayLoan = useCallback(async (repayAmount, mode, txnRef) => {
    const amt = Number(repayAmount);
    setMemberLoan(prev => ({
      ...prev,
      outstanding: Math.max(0, prev.outstanding - amt),
      totalPaid:   prev.totalPaid + amt,
    }));

    setRepaymentSchedule(prev => {
      let remaining = amt;
      return prev.map(inst => {
        if (!inst.done && remaining >= inst.amount) {
          remaining -= inst.amount;
          return { ...inst, done: true };
        }
        return inst;
      });
    });

    setGroupPot(prev => prev + amt);

    await addLogEntry({
      color_hint: 'green',
      headline:   'Loan repayment received from <b>you</b>',
      detail:     `UGX ${amt.toLocaleString()} · ${mode} ref #${txnRef} · pot updated`,
      action:     'LOAN_REPAYMENT',
    });

    setLoansList(prev => prev.map(l => {
      if (l.name === 'You') {
        const cleared = memberLoan.outstanding - amt <= 0;
        return {
          ...l,
          sub:    cleared ? `UGX ${memberLoan.totalTerm.toLocaleString()} · fully cleared` : `UGX ${(memberLoan.outstanding - amt).toLocaleString()} outstanding`,
          status: cleared ? 'CLEARED' : 'ACTIVE',
          color:  cleared ? 'var(--green)' : 'var(--gold)',
        };
      }
      return l;
    }));

    if (isSupabaseConfigured() && supabaseData?.myLoan?.id) {
      await supabase.from('loan_repayments').insert({
        loan_id:      supabaseData.myLoan.id,
        user_id:      supabaseData.userData.id,
        amount:       amt,
        payment_mode: mode,
        txn_ref:      txnRef,
      });
      await supabase
        .from('loans')
        .update({ outstanding: Math.max(0, memberLoan.outstanding - amt), total_paid: memberLoan.totalPaid + amt })
        .eq('id', supabaseData.myLoan.id);
    }

    setLoanRepayModalOpen(false);
  }, [addLogEntry, memberLoan, supabaseData]);

  // ── Request Loan ─────────────────────────────────────────────────────────
  const requestLoan = useCallback(async (loanData) => {
    await addLogEntry({
      color_hint: 'gold',
      headline:   'New loan request from <b>you</b>',
      detail:     `UGX ${Number(loanData.amount).toLocaleString()} requested · pending approval`,
      action:     'LOAN_REQUESTED',
    });

    if (isSupabaseConfigured() && supabaseData?.userData?.id && supabaseData?.groupData?.id) {
      await supabase.from('loans').insert({
        group_id:    supabaseData.groupData.id,
        user_id:     supabaseData.userData.id,
        amount:      Number(loanData.amount),
        outstanding: Number(loanData.amount),
        purpose:     loanData.purpose,
        term_months: Number(loanData.term) || 8,
        status:      'PENDING',
      });
    }

    setLoanRequestModalOpen(false);
  }, [addLogEntry, supabaseData]);

  // ── Approve Loan (Chairperson) ───────────────────────────────────────────
  const approveLoan = useCallback(async (loanId, memberName) => {
    setPendingLoanRequests(prev => prev.filter(l => l.id !== loanId));
    await addLogEntry({
      color_hint: 'green',
      headline:   `Loan for <b>${memberName}</b> approved`,
      detail:     'Chairperson approval granted',
      action:     'LOAN_APPROVED',
    });

    if (isSupabaseConfigured()) {
      await supabase.from('loans').update({ status: 'ACTIVE' }).eq('id', loanId);
    }
  }, [addLogEntry]);

  // ── Reject Loan (Chairperson) ────────────────────────────────────────────
  const rejectLoan = useCallback(async (loanId, memberName, reason) => {
    setPendingLoanRequests(prev => prev.filter(l => l.id !== loanId));
    await addLogEntry({
      color_hint: 'coral',
      headline:   `Loan for <b>${memberName}</b> rejected`,
      detail:     `Reason: ${reason || 'Not specified'}`,
      action:     'LOAN_REJECTED',
    });

    if (isSupabaseConfigured()) {
      await supabase.from('loans').update({ status: 'REJECTED', rejection_reason: reason }).eq('id', loanId);
    }
  }, [addLogEntry]);

  // ── Issue Fine (Chairperson) ─────────────────────────────────────────────
  const issueFine = useCallback(async (memberId, memberName, amount) => {
    setPendingFines(prev => prev.filter(f => f.id !== memberId));
    await addLogEntry({
      color_hint: 'coral',
      headline:   `Fine issued to <b>${memberName}</b>`,
      detail:     `UGX ${Number(amount || 5000).toLocaleString()} · overdue contribution`,
      action:     'FINE_ISSUED',
    });

    if (isSupabaseConfigured() && supabaseData?.groupData?.id) {
      await supabase.from('fines').insert({
        group_id: supabaseData.groupData.id,
        user_id:  memberId,
        amount:   Number(amount || 5000),
        reason:   'Overdue contribution',
        status:   'OUTSTANDING',
      });
    }
  }, [addLogEntry, supabaseData]);

  // ── Mark notification read ───────────────────────────────────────────────
  const markNotifRead = useCallback(async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    if (isSupabaseConfigured()) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (isSupabaseConfigured() && supabaseData?.userData?.id) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', supabaseData.userData.id);
    }
  }, [supabaseData]);

  return (
    <AppContext.Provider value={{
      // User
      displayName,
      userData:              supabaseData?.userData || null,
      // Contribution
      memberContrib,
      groupPot,
      pendingProofs,
      activityLog,
      // Modals
      proofModalOpen,        setProofModalOpen,
      loanRequestModalOpen,  setLoanRequestModalOpen,
      loanRepayModalOpen,    setLoanRepayModalOpen,
      notificationsOpen,     setNotificationsOpen,
      // Notifications
      notifications,         setNotifications,
      markNotifRead,         markAllRead,
      // Actions
      submitProof,
      verifyProof,
      rejectProof,
      // Loans
      memberLoan,
      loansList,
      repaymentSchedule,
      repayLoan,
      requestLoan,
      // Chairperson
      pendingLoanRequests,   setPendingLoanRequests,
      pendingFines,          setPendingFines,
      approveLoan,
      rejectLoan,
      issueFine,
      // Trust
      trustScore,            setTrustScore,
      // Group
      groupData:             supabaseData?.groupData || null,
      groupMember:           supabaseData?.groupMember || null,
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
