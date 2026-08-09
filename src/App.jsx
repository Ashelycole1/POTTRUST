import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DesktopSidebar, MobileBottomNav } from './components/Navigation';
import { Topbar } from './components/Topbar';
import { AuthView } from './views/AuthView';
import { MemberView } from './views/MemberView';
import { TreasurerView } from './views/TreasurerView';
import { ChairpersonView } from './views/ChairpersonView';
import { AdminOverview, AdminGroupsView } from './views/AdminView';
import { LoansView } from './views/LoansView';
import { TrustScoreView } from './views/TrustScoreView';
import { ActivityView } from './views/ActivityView';
import { SettingsView } from './views/SettingsView';
import { UploadProofModal } from './components/UploadProofModal';
import { AppProvider } from './context/AppContext';

function AppShell({ role, setRole }) {
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
            <div style={{ padding: '0 20px', textAlign: 'right', marginBottom: '10px' }}>
              <button
                onClick={() => setRole(null)}
                style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text-dim)', padding: '6px 12px', borderRadius: 8, fontSize: 12 }}
              >
                Switch Role
              </button>
            </div>

            <Routes>
              <Route path="/"           element={renderDashboard()} />
              <Route path="/members"    element={<div className="section"><h2>Members</h2><p>Member list routing.</p></div>} />
              <Route path="/loans"      element={<LoansView />} />
              <Route path="/trust"      element={<TrustScoreView />} />
              <Route path="/statements" element={<div className="section"><h2>Statements</h2><p>Financial statements.</p></div>} />
              <Route path="/activity"   element={<ActivityView />} />
              <Route path="/groups"     element={role === 'Admin' ? <AdminGroupsView /> : <Navigate to="/" />} />
              <Route path="/users"      element={<div className="section"><h2>Global Users</h2><p>User management interface.</p></div>} />
              <Route path="/settings"   element={<SettingsView role={role} />} />
            </Routes>
          </div>
        </div>
      </div>

      <MobileBottomNav role={role} />

      {/* Global upload proof modal — rendered at root so it overlays everything */}
      <UploadProofModal />
    </Router>
  );
}

function App() {
  const [role, setRole] = useState(null);

  if (!role) return <AuthView setRole={setRole} />;

  return (
    <AppProvider>
      <AppShell role={role} setRole={setRole} />
    </AppProvider>
  );
}

export default App;
