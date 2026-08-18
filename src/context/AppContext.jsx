import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

// ── Helper: is Supabase actually configured? ─────────────────────────────────
const isSupabaseConfigured = () =>
  !!import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

const AppContext = createContext(null);

export const AppProvider = ({ children, supabaseData = null }) => {
  // refetch lets us reload live data from Supabase after mutations
  const refetch = supabaseData?.refetch || (() => {});
  const { user: clerkUser } = useUser();

  // ── Derive display name from Clerk (never hardcoded) ─────────────────────
  const displayName = clerkUser
    ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
      clerkUser.primaryEmailAddress?.emailAddress ||
      'User'
    : 'User';

  // ── Derive my current contribution from Supabase data ────────────────────
  const myContrib = supabaseData?.contributions?.find(
    c => c.user_id === supabaseData?.userData?.id
  ) || null;

  const [memberContrib, setMemberContrib] = useState({
    paid:        myContrib?.amount        || 0,
    total:       supabaseData?.groupData?.contribution_amount || 0,
    status:      myContrib?.status        || 'PENDING',
    lastPayment: myContrib
      ? `Paid via ${myContrib.payment_mode} · ref #${myContrib.txn_ref}`
      : 'No payment recorded yet',
  });

  const [groupPot, setGroupPot] = useState(
    supabaseData?.groupData?.total_pot || 0
  );

  const [pendingProofs, setPendingProofs] = useState(
    supabaseData?.pendingProofs || []
  );

  const [activityLog, setActivityLog] = useState(
    supabaseData?.auditLogs || []
  );

  // Modals
  const [proofModalOpen,       setProofModalOpen]       = useState(false);
  const [loanRequestModalOpen, setLoanRequestModalOpen] = useState(false);
  const [loanRepayModalOpen,   setLoanRepayModalOpen]   = useState(false);
  const [notificationsOpen,    setNotificationsOpen]    = useState(false);

  // Notifications — real data only
  const [notifications, setNotifications] = useState(
    supabaseData?.notifications || []
  );

  // Loan state — real data only
  const [memberLoan, setMemberLoan] = useState(() => {
    const sl = supabaseData?.myLoan;
    if (!sl) return { outstanding: 0, nextRepayment: 0, totalPaid: 0, totalTerm: 0 };
    return {
      outstanding:   sl.outstanding,
      nextRepayment: sl.outstanding > 0
        ? Math.ceil(sl.outstanding / Math.max((sl.term_months || 1) - ((sl.total_paid / (sl.amount / (sl.term_months || 1))) || 0), 1))
        : 0,
      totalPaid:  sl.total_paid  || 0,
      totalTerm:  sl.amount      || 0,
    };
  });

  // Loans list — mapped from real Supabase data
  const [loansList, setLoansList] = useState(() => {
    if (!supabaseData?.loans?.length) return [];
    return supabaseData.loans.map(l => ({
      id:       l.id,
      name:     `${l.users?.first_name || ''} ${l.users?.last_name || ''}`.trim() || 'Unknown',
      initials: `${l.users?.first_name?.[0] || ''}${l.users?.last_name?.[0] || ''}`.toUpperCase() || '?',
      sub:      `UGX ${(l.outstanding || 0).toLocaleString()} outstanding`,
      status:   l.status,
      color:    l.status === 'CLEARED' ? 'var(--green)'
              : l.status === 'AT RISK' ? 'var(--coral)'
              : 'var(--gold)',
    }));
  });

  // Repayment schedule — real data from loan_repayments table
  const [repaymentSchedule, setRepaymentSchedule] = useState(
    supabaseData?.repaySchedule?.map((r, i) => ({
      id:     r.id,
      label:  `Instalment ${r.instalment_no || i + 1}`,
      date:   r.paid_at ? new Date(r.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending',
      amount: r.amount,
      done:   !!r.paid_at,
    })) || []
  );

  // Trust score — real data only
  const [trustScore, setTrustScore] = useState(
    supabaseData?.trustScore
      ? {
          score:             supabaseData.trustScore.score,
          tier:              supabaseData.trustScore.tier,
          streak:            0,
          loanRepayments:    'See loan history',
          pendingProofs:     (supabaseData?.pendingProofs || []).length,
          finesIssued:       0,
          lateContributions: 0,
          history:           [],
          tips:              [],
          change:            supabaseData.trustScore.change || 0,
        }
      : null
  );

  // Chairperson — pending loans from real Supabase data
  const [pendingLoanRequests, setPendingLoanRequests] = useState(() =>
    (supabaseData?.loans || [])
      .filter(l => l.status === 'PENDING')
      .map(l => ({
        id:          l.id,
        name:        `${l.users?.first_name || ''} ${l.users?.last_name || ''}`.trim() || 'Unknown',
        initials:    `${l.users?.first_name?.[0] || ''}${l.users?.last_name?.[0] || ''}`.toUpperCase() || '?',
        sub:         `UGX ${(l.amount || 0).toLocaleString()} requested · pending vote`,
        status:      'PENDING',
        avatarColor: 'var(--gold)',
      }))
  );

  // Overdue contributions — real data
  const [pendingFines, setPendingFines] = useState(() =>
    (supabaseData?.contributions || [])
      .filter(c => c.status === 'OVERDUE')
      .map(c => ({
        id:          c.id,
        name:        `${c.users?.first_name || ''} ${c.users?.last_name || ''}`.trim() || 'Unknown',
        initials:    `${c.users?.first_name?.[0] || ''}${c.users?.last_name?.[0] || ''}`.toUpperCase() || '?',
        sub:         `${c.cycle_label} · overdue`,
        status:      'PENDING',
        avatarColor: 'var(--coral)',
      }))
  );

  // ── Sync Supabase Data on Load ──────────────────────────────────────────
  useEffect(() => {
    if (!supabaseData) return;
    
    const myC = supabaseData.contributions?.find(c => c.user_id === supabaseData.userData?.id);
    setMemberContrib(prev => ({
      ...prev,
      paid:        myC?.amount || 0,
      total:       supabaseData.groupData?.contribution_amount || 0,
      status:      myC?.status || 'PENDING',
      lastPayment: myC ? `Paid via ${myC.payment_mode} · ref #${myC.txn_ref}` : 'No payment recorded yet',
    }));

    setGroupPot(supabaseData.groupData?.total_pot || 0);
    setActivityLog(supabaseData.auditLogs || []);
    setNotifications(supabaseData.notifications || []);
    
    setPendingProofs((supabaseData.pendingProofs || []).map(p => ({
      id:          p.id,
      memberName:  `${p.users?.first_name || ''} ${p.users?.last_name || ''}`.trim() || 'Unknown',
      initials:    `${p.users?.first_name?.[0] || ''}${p.users?.last_name?.[0] || ''}`.toUpperCase() || '?',
      amount:      p.amount,
      mode:        p.payment_mode,
      txnRef:      p.txn_ref,
      proofUrl:    p.proof_url,
      notes:       p.notes,
      submittedAt: p.submitted_at ? new Date(p.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      status:      p.status,
    })));
    
    if (supabaseData.myLoan) {
      const sl = supabaseData.myLoan;
      setMemberLoan({
        outstanding:   sl.outstanding,
        nextRepayment: sl.outstanding > 0
          ? Math.ceil(sl.outstanding / Math.max((sl.term_months || 1) - ((sl.total_paid / (sl.amount / (sl.term_months || 1))) || 0), 1))
          : 0,
        totalPaid:  sl.total_paid  || 0,
        totalTerm:  sl.amount      || 0,
      });
    }

    if (supabaseData.loans) {
      setLoansList(supabaseData.loans.map(l => ({
        id:       l.id,
        name:     `${l.users?.first_name || ''} ${l.users?.last_name || ''}`.trim() || 'Unknown',
        initials: `${l.users?.first_name?.[0] || ''}${l.users?.last_name?.[0] || ''}`.toUpperCase() || '?',
        sub:      `UGX ${(l.outstanding || 0).toLocaleString()} outstanding`,
        status:   l.status,
        color:    l.status === 'CLEARED' ? 'var(--green)'
                : l.status === 'AT RISK' ? 'var(--coral)'
                : 'var(--gold)',
      })));
    }

    if (supabaseData.repaySchedule) {
      setRepaymentSchedule(supabaseData.repaySchedule.map((r, i) => ({
        id:     r.id,
        label:  `Instalment ${r.instalment_no || i + 1}`,
        date:   r.paid_at ? new Date(r.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending',
        amount: r.amount,
        done:   !!r.paid_at,
      })));
    }

    if (supabaseData.trustScore) {
      setTrustScore({
        score:             supabaseData.trustScore.score,
        tier:              supabaseData.trustScore.tier,
        streak:            0,
        loanRepayments:    'See loan history',
        pendingProofs:     (supabaseData.pendingProofs || []).length,
        finesIssued:       0,
        lateContributions: 0,
        history:           [],
        tips:              [],
        change:            supabaseData.trustScore.change || 0,
      });
    }

    if (supabaseData.loans) {
      setPendingLoanRequests(
        supabaseData.loans.filter(l => l.status === 'PENDING').map(l => ({
          id:          l.id,
          name:        `${l.users?.first_name || ''} ${l.users?.last_name || ''}`.trim() || 'Unknown',
          initials:    `${l.users?.first_name?.[0] || ''}${l.users?.last_name?.[0] || ''}`.toUpperCase() || '?',
          sub:         `UGX ${(l.amount || 0).toLocaleString()} requested · pending vote`,
          status:      'PENDING',
          avatarColor: 'var(--gold)',
        }))
      );
    }

    if (supabaseData.contributions) {
      setPendingFines(
        supabaseData.contributions.filter(c => c.status === 'OVERDUE').map(c => ({
          id:          c.id,
          name:        `${c.users?.first_name || ''} ${c.users?.last_name || ''}`.trim() || 'Unknown',
          initials:    `${c.users?.first_name?.[0] || ''}${c.users?.last_name?.[0] || ''}`.toUpperCase() || '?',
          sub:         `${c.cycle_label} · overdue`,
          status:      'PENDING',
          avatarColor: 'var(--coral)',
        }))
      );
    }
  }, [supabaseData]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addLogEntry = useCallback(async (entry, notifyUserId = null) => {
    const local = { id: Date.now(), ...entry, created_at: new Date().toISOString() };
    setActivityLog(prev => [local, ...prev]);

    // Mirror every action as a notification for the current user too
    const notifEntry = {
      id:          local.id + '_n',
      title:       entry.headline?.replace(/<[^>]+>/g, '') || entry.action,
      description: entry.detail || '',
      color_hint:  entry.color_hint,
      is_read:     false,
      created_at:  local.created_at,
    };
    setNotifications(prev => [notifEntry, ...prev]);

    if (isSupabaseConfigured() && supabaseData?.groupData?.id) {
      await supabase.from('audit_logs').insert({
        group_id:   supabaseData.groupData.id,
        user_id:    supabaseData.userData?.id || null,
        action:     entry.action || 'GENERIC',
        headline:   entry.headline,
        detail:     entry.detail,
        color_hint: entry.color_hint,
      });

      // If a specific target user should receive a notification, insert it for them
      const targetUser = notifyUserId || supabaseData.userData?.id;
      if (targetUser) {
        await supabase.from('notifications').insert({
          user_id:     targetUser,
          title:       entry.headline?.replace(/<[^>]+>/g, '') || entry.action,
          description: entry.detail || '',
          is_read:     false,
        });
      }
    }
  }, [supabaseData]);

  // ── Submit Contribution Proof ─────────────────────────────────────────────
  const submitProof = useCallback(async (proofData) => {
    const proof = {
      id:          Date.now(),
      memberName:  displayName,
      initials:    displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      amount:      proofData.amount,
      mode:        proofData.mode,
      txnRef:      proofData.txnRef,
      screenshot:  proofData.screenshot,
      proofUrl:    proofData.proofUrl,
      notes:       proofData.notes,
      submittedAt: new Date().toISOString(),
      status:      'PENDING',
    };

    setPendingProofs(prev => [proof, ...prev]);
    setMemberContrib(prev => ({
      ...prev,
      status:      'PENDING',
      lastPayment: 'Slip uploaded · awaiting review',
    }));

    await addLogEntry({
      color_hint: 'gold',
      headline:   `<b>${displayName}</b> uploaded a payment slip`,
      detail:     `UGX ${Number(proofData.amount).toLocaleString()} · ${proofData.mode} ref #${proofData.txnRef}`,
      action:     'PROOF_SUBMITTED',
    });

    if (isSupabaseConfigured() && supabaseData?.userData?.id && supabaseData?.groupData?.id) {
      const { error } = await supabase.from('contributions').insert({
        group_id:     supabaseData.groupData.id,
        user_id:      supabaseData.userData.id,
        cycle_label:  new Date().toLocaleString('en-GB', { month: 'short', year: 'numeric' }),
        amount:       Number(proofData.amount),
        payment_mode: proofData.mode,
        txn_ref:      proofData.txnRef,
        proof_url:    proofData.proofUrl || null,
        notes:        proofData.notes || null,
        status:       'PENDING',
      });
      if (error) console.error('[submitProof]', error);
      else {
        // Re-fetch so Treasurer's Review Queue gets the new submission immediately
        await refetch();
      }
    }

    setProofModalOpen(false);
  }, [addLogEntry, displayName, supabaseData, refetch]);

  // ── Verify Proof (Treasurer) ──────────────────────────────────────────────
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

    // Log the event — also notifies the current user (Treasurer)
    await addLogEntry({
      color_hint: 'green',
      headline:   `<b>${proof.memberName}</b> was verified PAID`,
      detail:     `UGX ${Number(proof.amount).toLocaleString()} · ${proof.mode} ref #${proof.txnRef}`,
      action:     'CONTRIBUTION_VERIFIED',
    });

    if (isSupabaseConfigured()) {
      // Update the contribution record to PAID
      await supabase
        .from('contributions')
        .update({
          status:      'PAID',
          reviewed_by: supabaseData?.userData?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', proofId);

      // Update the group pot total
      await supabase
        .from('groups')
        .update({ total_pot: groupPot + Number(proof.amount) })
        .eq('id', supabaseData?.groupData?.id);

      // Notify the member whose proof was approved (look up their user_id from the contribution)
      const { data: contrib } = await supabase
        .from('contributions')
        .select('user_id')
        .eq('id', proofId)
        .single();
      if (contrib?.user_id) {
        await supabase.from('notifications').insert({
          user_id:     contrib.user_id,
          title:       'Contribution approved ✓',
          description: `Your UGX ${Number(proof.amount).toLocaleString()} payment has been verified by the Treasurer.`,
          is_read:     false,
        });
      }

      // Reload so everyone sees updated state
      await refetch();
    }
  }, [pendingProofs, addLogEntry, groupPot, supabaseData, refetch]);

  // ── Reject Proof (Treasurer) ──────────────────────────────────────────────
  const rejectProof = useCallback(async (proofId, reason) => {
    const proof = pendingProofs.find(p => p.id === proofId);
    if (!proof) return;

    setPendingProofs(prev => prev.filter(p => p.id !== proofId));
    setMemberContrib(prev => ({ ...prev, status: 'REJECTED', lastPayment: `Rejected: ${reason}` }));

    await addLogEntry({
      color_hint: 'coral',
      headline:   `Payment proof from <b>${proof.memberName}</b> rejected`,
      detail:     `Reason: ${reason}`,
      action:     'PROOF_REJECTED',
    });

    if (isSupabaseConfigured()) {
      // Update the contribution record to REJECTED
      await supabase
        .from('contributions')
        .update({
          status:           'REJECTED',
          rejection_reason: reason,
          reviewed_by:      supabaseData?.userData?.id || null,
          reviewed_at:      new Date().toISOString(),
        })
        .eq('id', proofId);

      // Notify the member whose proof was rejected
      const { data: contrib } = await supabase
        .from('contributions')
        .select('user_id')
        .eq('id', proofId)
        .single();
      if (contrib?.user_id) {
        await supabase.from('notifications').insert({
          user_id:     contrib.user_id,
          title:       'Contribution proof rejected',
          description: `Your payment slip was rejected. Reason: ${reason}`,
          is_read:     false,
        });
      }

      // Reload so queue is refreshed
      await refetch();
    }
  }, [pendingProofs, addLogEntry, supabaseData, refetch]);

  // ── Repay Loan ────────────────────────────────────────────────────────────
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
      if (l.id === supabaseData?.myLoan?.id || l.name === displayName) {
        const cleared = memberLoan.outstanding - amt <= 0;
        return {
          ...l,
          sub:    cleared
            ? `UGX ${memberLoan.totalTerm.toLocaleString()} · fully cleared`
            : `UGX ${(memberLoan.outstanding - amt).toLocaleString()} outstanding`,
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
        .update({
          outstanding: Math.max(0, memberLoan.outstanding - amt),
          total_paid:  memberLoan.totalPaid + amt,
          status:      memberLoan.outstanding - amt <= 0 ? 'CLEARED' : 'ACTIVE',
        })
        .eq('id', supabaseData.myLoan.id);
    }

    setLoanRepayModalOpen(false);
  }, [addLogEntry, memberLoan, supabaseData, displayName]);

  // ── Request Loan ──────────────────────────────────────────────────────────
  const requestLoan = useCallback(async (loanData) => {
    await addLogEntry({
      color_hint: 'gold',
      headline:   `New loan request from <b>${displayName}</b>`,
      detail:     `UGX ${Number(loanData.amount).toLocaleString()} requested · pending approval`,
      action:     'LOAN_REQUESTED',
    });

    if (isSupabaseConfigured() && supabaseData?.userData?.id && supabaseData?.groupData?.id) {
      const { error } = await supabase.from('loans').insert({
        group_id:    supabaseData.groupData.id,
        user_id:     supabaseData.userData.id,
        amount:      Number(loanData.amount),
        outstanding: Number(loanData.amount),
        total_paid:  0,
        purpose:     loanData.purpose || null,
        term_months: Number(loanData.term) || 8,
        status:      'PENDING',
      });
      if (error) console.error('[requestLoan]', error);
    }

    setLoanRequestModalOpen(false);
  }, [addLogEntry, displayName, supabaseData]);

  // ── Approve Loan (Chairperson) ────────────────────────────────────────────
  const approveLoan = useCallback(async (loanId, memberName) => {
    setPendingLoanRequests(prev => prev.filter(l => l.id !== loanId));
    await addLogEntry({
      color_hint: 'green',
      headline:   `Loan for <b>${memberName}</b> approved`,
      detail:     'Chairperson approval granted',
      action:     'LOAN_APPROVED',
    });

    if (isSupabaseConfigured()) {
      await supabase.from('loans').update({
        status:      'ACTIVE',
        approved_by: supabaseData?.userData?.id || null,
        approved_at: new Date().toISOString(),
      }).eq('id', loanId);
    }
  }, [addLogEntry, supabaseData]);

  // ── Reject Loan (Chairperson) ─────────────────────────────────────────────
  const rejectLoan = useCallback(async (loanId, memberName, reason) => {
    setPendingLoanRequests(prev => prev.filter(l => l.id !== loanId));
    await addLogEntry({
      color_hint: 'coral',
      headline:   `Loan for <b>${memberName}</b> rejected`,
      detail:     `Reason: ${reason || 'Not specified'}`,
      action:     'LOAN_REJECTED',
    });

    if (isSupabaseConfigured()) {
      await supabase.from('loans').update({
        status:           'REJECTED',
        rejection_reason: reason,
      }).eq('id', loanId);
    }
  }, [addLogEntry]);

  // ── Issue Fine (Chairperson) ──────────────────────────────────────────────
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
        group_id:  supabaseData.groupData.id,
        user_id:   memberId,
        issued_by: supabaseData?.userData?.id || null,
        amount:    Number(amount || 5000),
        reason:    'Overdue contribution',
        status:    'OUTSTANDING',
      });
    }
  }, [addLogEntry, supabaseData]);

  // ── Mark notification read ────────────────────────────────────────────────
  const markNotifRead = useCallback(async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    if (isSupabaseConfigured()) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (isSupabaseConfigured() && supabaseData?.userData?.id) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', supabaseData.userData.id);
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
      groupContributions:    supabaseData?.contributions || [],
      groupName:             supabaseData?.groupData?.name || '',
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
