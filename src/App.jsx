import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import { DesktopSidebar, MobileBottomNav } from './components/Navigation';
import { Topbar } from './components/Topbar';
import { AuthView } from './views/AuthView';
import { MemberView } from './views/MemberView';
import { TreasurerView } from './views/TreasurerView';
import { ChairpersonView } from './views/ChairpersonView';
import { AdminOverview, AdminGroupsView } from './views/AdminView';
import { MembersView } from './views/MembersView';
import { LoansView } from './views/LoansView';
import { TrustScoreView } from './views/TrustScoreView';
import { ActivityView } from './views/ActivityView';
import { SettingsView } from './views/SettingsView';
import { StatementsView } from './views/StatementsView';
import { UsersView } from './views/UsersView';
import { UploadProofModal } from './components/UploadProofModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AppProvider } from './context/AppContext';
import { useSupabaseData } from './lib/useSupabaseData';

// ── When Clerk IS loaded and user is signed in ────────────────────────────────
function AppShellWithData({ role, setRole }) {
  const supabaseData = useSupabaseData();

  if (supabaseData.loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'var(--bg)', color: 'var(--text-dim)',
      }}>
        <div style={{
          width: 48, height: 48, border: '3px solid var(--line)',
          borderTopColor: 'var(--green)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: 14, fontWeight: 500 }}>Loading your dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AppProvider supabaseData={supabaseData}>
      <AppShell role={role} setRole={setRole} />
    </AppProvider>
  );
}

function AppShell({ role, setRole }) {

  // Determine effective role: prefer Supabase group_member role if available,
  // then fall back to the mock role chosen on the auth screen
  const effectiveRole = role;

  const renderDashboard = () => {
    switch (effectiveRole) {
      case 'Treasurer':   return <TreasurerView />;
      case 'Chairperson': return <ChairpersonView />;
      case 'Admin':       return <AdminOverview />;
      case 'Member':
      default:            return <MemberView />;
    }
  };

  return (
    <Router>
      <div className="shell">
        <div className="app-grid">
          <DesktopSidebar role={effectiveRole} />

          <div className="main-col">
            <Topbar role={effectiveRole} />

            {/* Role switcher (dev convenience – remove before production) */}
            <div style={{ padding: '0 20px', textAlign: 'right', marginBottom: 10 }}>
              <select
                value={effectiveRole}
                onChange={e => setRole(e.target.value)}
                style={{
                  background: 'transparent', border: '1px solid var(--line)',
                  color: 'var(--text-dim)', padding: '5px 10px', borderRadius: 8,
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                <option value="Member">Member</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Chairperson">Chairperson</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <Routes>
              <Route path="/"           element={renderDashboard()} />
              <Route path="/members"    element={<MembersView />} />
              <Route path="/loans"      element={<LoansView />} />
              <Route path="/trust"      element={<TrustScoreView />} />
              <Route path="/statements" element={<StatementsView role={effectiveRole} />} />
              <Route path="/activity"   element={<ActivityView />} />
              <Route path="/groups"     element={effectiveRole === 'Admin' ? <AdminGroupsView /> : <Navigate to="/" />} />
              <Route path="/users"      element={effectiveRole === 'Admin' ? <UsersView /> : <Navigate to="/" />} />
              <Route path="/settings"   element={<SettingsView role={effectiveRole} />} />
              <Route path="*"           element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>

      <MobileBottomNav role={effectiveRole} />
      <UploadProofModal />
      <NotificationsModal />
    </Router>
  );
}

// ── Root: handle Clerk loaded vs not configured ───────────────────────────────
function App() {
  const [role, setRole] = useState(null);
  const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // ── Clerk NOT configured — run in demo mode with role selector ────────────
  if (!clerkConfigured) {
    if (!role) return <AuthView setRole={setRole} clerkAvailable={false} />;
    return (
      <AppProvider supabaseData={null}>
        <AppShell role={role} setRole={setRole} />
      </AppProvider>
    );
  }

  // ── Clerk IS configured — use real auth ───────────────────────────────────
  return (
    <>
      <SignedOut>
        <AuthView setRole={setRole} clerkAvailable={true} />
      </SignedOut>
      <SignedIn>
        {!role ? (
          // First time after sign-in: let user pick a role (dev convenience)
          // In production you'd derive this from Supabase group_members table
          <AuthView setRole={setRole} clerkAvailable={true} rolePickerOnly={true} />
        ) : (
          <AppShellWithData role={role} setRole={setRole} />
        )}
      </SignedIn>
    </>
  );
}

export default App;
