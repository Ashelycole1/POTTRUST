import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
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

// ── Spinner shown while fetching Supabase data ────────────────────────────────
function LoadingScreen() {
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

// ── Full app shell — receives role derived from Supabase ──────────────────────
function AppShell({ role }) {
  const renderDashboard = () => {
    switch (role) {
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
          <DesktopSidebar role={role} />

          <div className="main-col">
            <Topbar role={role} />

            <Routes>
              <Route path="/"           element={renderDashboard()} />
              <Route path="/members"    element={<MembersView role={role} />} />
              <Route path="/loans"      element={<LoansView />} />
              <Route path="/trust"      element={<TrustScoreView />} />
              <Route path="/statements" element={<StatementsView role={role} />} />
              <Route path="/activity"   element={<ActivityView />} />
              <Route path="/groups"     element={role === 'Admin' ? <AdminGroupsView /> : <Navigate to="/" />} />
              <Route path="/users"      element={role === 'Admin' ? <UsersView /> : <Navigate to="/" />} />
              <Route path="/settings"   element={<SettingsView role={role} />} />
              <Route path="*"           element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>

      <MobileBottomNav role={role} />
      <UploadProofModal />
      <NotificationsModal />
    </Router>
  );
}

// ── Fetches Supabase data, derives role, then renders shell ───────────────────
function AppShellWithData() {
  const supabaseData = useSupabaseData();

  if (supabaseData.loading) return <LoadingScreen />;

  // Derive role from Supabase group_members.role (what they were assigned in the group)
  // Fall back to 'Member' if the user hasn't been added to any group yet
  const role = supabaseData.groupMember?.role || 'Member';

  return (
    <AppProvider supabaseData={supabaseData}>
      <AppShell role={role} />
    </AppProvider>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
function App() {
  const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkConfigured) {
    // Supabase / Clerk not yet set up — show the sign-in/sign-up UI
    return <AuthView clerkAvailable={false} />;
  }

  return (
    <>
      <SignedOut>
        <AuthView clerkAvailable={true} />
      </SignedOut>
      <SignedIn>
        {/* No role picker — go straight to the dashboard using the Supabase-assigned role */}
        <AppShellWithData />
      </SignedIn>
    </>
  );
}

export default App;
