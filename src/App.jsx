import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DesktopSidebar, MobileBottomNav } from './components/Navigation';
import { Topbar } from './components/Topbar';
import { AuthView } from './views/AuthView';
import { MemberView } from './views/MemberView';
import { TreasurerView } from './views/TreasurerView';
import { ChairpersonView } from './views/ChairpersonView';
import { AdminView } from './views/AdminView';
import { LoansView } from './views/LoansView';
import { TrustScoreView } from './views/TrustScoreView';
import { AuditLog } from './components/AuditLog';

const logEntries = [
  {c:'var(--green)', h:'<b>Egabo Aaron</b> was verified PAID', s:'UGX 200,000 · MTN MoMo ref #82103', t:'Today, 9:14 AM'},
  {c:'var(--gold)', h:'<b>Onyango J. Steven</b> uploaded a payment slip', s:'Awaiting treasurer review', t:'Today, 8:02 AM'},
  {c:'var(--coral)', h:'<b>Ssenyonjo K.</b> marked OVERDUE', s:'Fine of UGX 5,000 applied automatically', t:'Yesterday, 6:30 PM'},
  {c:'var(--green)', h:'Loan repayment received from <b>you</b>', s:'UGX 95,000 · pot updated', t:'Yesterday, 2:11 PM'},
  {c:'var(--green)', h:'<b>Tumwine N.</b> was verified PAID', s:'UGX 200,000 · Airtel Money ref #55291', t:'Mon, 4:47 PM'},
  {c:'var(--gold)', h:'New loan request from <b>Ssenyonjo K.</b>', s:'UGX 450,000 requested · pending vote', t:'Mon, 11:20 AM'},
];

function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return <AuthView setRole={setRole} />;
  }

  const handleLogout = () => {
    setRole(null);
  };

  const renderDashboard = () => {
    switch(role) {
      case 'Treasurer': return <TreasurerView />;
      case 'Chairperson': return <ChairpersonView />;
      case 'Admin': return <AdminView />;
      case 'Member': 
      default: return <MemberView />;
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
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text-dim)', padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
                Switch Role
              </button>
            </div>

            <Routes>
              <Route path="/" element={renderDashboard()} />
              <Route path="/members" element={<div className="section"><h2>Members</h2><p>Member list routing.</p></div>} />
              <Route path="/loans" element={<LoansView />} />
              <Route path="/trust" element={<TrustScoreView />} />
              <Route path="/statements" element={<div className="section"><h2>Statements</h2><p>Financial statements.</p></div>} />
              <Route path="/groups" element={role === 'Admin' ? renderDashboard() : <Navigate to="/" />} />
              <Route path="/users" element={<div className="section"><h2>Users</h2><p>User management.</p></div>} />
              <Route path="/settings" element={<div className="section"><h2>Settings</h2><p>Settings panel.</p></div>} />
            </Routes>

            {/* Audit log visible on mobile as an inline section, hidden on desktop */}
            <div className="audit-side audit-inline">
              <h3>Immutable audit log</h3>
              <div className="card-meta">Every entry is timestamped and permanent</div>
              <AuditLog entries={logEntries} />
            </div>
          </div>

          {/* Desktop-only sticky audit panel */}
          <aside className="audit-side">
            <h3>Immutable audit log</h3>
            <div className="card-meta">Every entry is timestamped and permanent</div>
            <AuditLog entries={logEntries} />
          </aside>

        </div>
      </div>
      
      <MobileBottomNav role={role} />
    </Router>
  );
}

export default App;
