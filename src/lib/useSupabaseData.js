/**
 * useSupabaseData — React hook that syncs the current Clerk user into Supabase
 * on first login, then fetches all data the app needs for the dashboard.
 *
 * Returns { loading, error, userData, groupData, contributions, loans,
 *           auditLogs, notifications, trustScore }
 */
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from './supabase';

export function useSupabaseData() {
  const { user, isLoaded } = useUser();

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [userData, setUserData]         = useState(null);
  const [groupData, setGroupData]       = useState(null);
  const [groupMember, setGroupMember]   = useState(null);
  const [contributions, setContribs]    = useState([]);
  const [pendingProofs, setPending]     = useState([]);
  const [loans, setLoans]               = useState([]);
  const [myLoan, setMyLoan]             = useState(null);
  const [repaySchedule, setSchedule]    = useState([]);
  const [auditLogs, setAuditLogs]       = useState([]);
  const [notifications, setNotifs]      = useState([]);
  const [trustScore, setTrustScore]     = useState(null);

  const [myContrib, setMyContrib]       = useState(null);

  // ── Upsert current Clerk user into Supabase ─────────────────────────────
  const syncUser = useCallback(async () => {
    if (!user) return null;

    const payload = {
      clerk_id:   user.id,
      email:      user.primaryEmailAddress?.emailAddress ?? '',
      first_name: user.firstName ?? '',
      last_name:  user.lastName  ?? '',
      avatar_url: user.imageUrl   ?? '',
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'clerk_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  // ── Fetch all dashboard data ────────────────────────────────────────────
  const fetchDashboard = useCallback(async (dbUser) => {
    if (!dbUser) return;

    // 1. Group membership
    const { data: gm, error: gmErr } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('user_id', dbUser.id)
      .single();

    if (gmErr && gmErr.code !== 'PGRST116') throw gmErr;
    setGroupMember(gm || null);
    setGroupData(gm?.groups || null);

    if (!gm) return;

    const gid = gm.group_id;

    // 2. Contributions for this group
    const { data: contribs } = await supabase
      .from('contributions')
      .select('*, users(first_name, last_name)')
      .eq('group_id', gid)
      .order('submitted_at', { ascending: false });
    setContribs(contribs || []);
    setPending((contribs || []).filter(c => c.status === 'PENDING'));

    // 3. My latest contribution
    const mine = (contribs || []).find(c => c.user_id === dbUser.id);
    setMyContrib(mine || null);

    // 4. Loans
    const { data: loanData } = await supabase
      .from('loans')
      .select('*, users(first_name, last_name)')
      .eq('group_id', gid)
      .order('requested_at', { ascending: false });
    setLoans(loanData || []);
    const activeLoan = (loanData || []).find(l => l.user_id === dbUser.id && l.status === 'ACTIVE');
    setMyLoan(activeLoan || null);

    if (activeLoan) {
      const { data: repays } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('loan_id', activeLoan.id)
        .order('instalment_no', { ascending: true });
      setSchedule(repays || []);
    }

    // 5. Audit log
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('group_id', gid)
      .order('created_at', { ascending: false })
      .limit(30);
    setAuditLogs(logs || []);

    // 6. Notifications
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifs(notifs || []);

    // 7. Trust score
    const { data: ts } = await supabase
      .from('trust_scores')
      .select('*')
      .eq('user_id', dbUser.id)
      .eq('group_id', gid)
      .order('computed_at', { ascending: false })
      .limit(4);
    if (ts && ts.length > 0) setTrustScore(ts[0]);

  }, []);

  // ── Main init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }

    (async () => {
      try {
        setLoading(true);
        const dbUser = await syncUser();
        setUserData(dbUser);
        await fetchDashboard(dbUser);
      } catch (err) {
        console.error('[useSupabaseData]', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user, syncUser, fetchDashboard]);

  return {
    loading,
    error,
    userData,
    groupData,
    groupMember,
    contributions,
    myContrib,
    pendingProofs,
    loans,
    myLoan,
    repaySchedule,
    auditLogs,
    notifications,
    trustScore,
    refetch: () => userData && fetchDashboard(userData),
  };
}

