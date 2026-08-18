import React from 'react';
import { Home, Users, Landmark, TrendingUp, FileText, Settings, Plus, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useClerk } from '@clerk/clerk-react';

export const DesktopSidebar = ({ role }) => {
  const location = useLocation();
  const { signOut } = useClerk();
  const { groupName, groupData } = useApp();
  const logoUrl = groupData?.logo_url;
  
  const getNavItems = () => {
    const base = [
      { id: 'home',       icon: Home,       label: 'Home',        path: '/' },
      { id: 'members',    icon: Users,      label: 'Members',     path: '/members' },
      { id: 'loans',      icon: Landmark,   label: 'Loans',       path: '/loans' },
      { id: 'trust',      icon: TrendingUp, label: 'Trust Score', path: '/trust' },
      { id: 'statements', icon: FileText,   label: 'Statements',  path: '/statements' },
      { id: 'activity',   icon: Activity,   label: 'Activity',    path: '/activity' },
    ];
    if (role === 'Admin') {
      return [
        { id: 'dashboard', icon: Home,     label: 'Platform Overview', path: '/' },
        { id: 'groups',    icon: Users,    label: 'All Groups',        path: '/groups' },
        { id: 'users',     icon: Users,    label: 'Global Users',      path: '/users' },
        { id: 'settings',  icon: Settings, label: 'Platform Settings', path: '/settings' },
      ];
    }
    return [...base, { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }];
  };

  return (
    <nav className="desktop-side">
      <div className="brand">
        {role !== 'Admin' && logoUrl ? (
          <img
            src={logoUrl}
            alt={groupName}
            style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div className="brand-mark">P</div>
        )}
        <div>
          <div className="brand-name">{role !== 'Admin' && groupName ? groupName : 'PotTrust'}</div>
          <div className="brand-sub">{role === 'Admin' ? 'Admin Portal' : (groupName ? 'SACCO Workspace' : 'None')}</div>
        </div>
      </div>
      {getNavItems().map(item => (
        <Link key={item.id} to={item.path} className={`side-link ${location.pathname === item.path ? 'active' : ''}`}>
          <item.icon size={18} />&nbsp;&nbsp;{item.label}
        </Link>
      ))}

      <div style={{ flex: 1 }} />
      <button 
        onClick={() => signOut()}
        className="side-link" 
        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--coral)', marginTop: 'auto' }}
      >
        Sign Out
      </button>
    </nav>
  );
};

export const MobileBottomNav = ({ role }) => {
  const location = useLocation();
  const { setProofModalOpen } = useApp();

  if (role === 'Admin') {
    return (
      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={20} /><span>Overview</span>
        </Link>
        <Link to="/groups" className={`nav-item ${location.pathname === '/groups' ? 'active' : ''}`}>
          <Users size={20} /><span>Groups</span>
        </Link>
        <Link to="/users" className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}>
          <Users size={20} /><span>Users</span>
        </Link>
        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={20} /><span>Settings</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={20} /><span>Home</span>
      </Link>
      <Link to="/members" className={`nav-item ${location.pathname === '/members' ? 'active' : ''}`}>
        <Users size={20} /><span>Members</span>
      </Link>
      <div className="nav-fab" onClick={() => setProofModalOpen(true)} style={{ cursor: 'pointer' }}><Plus size={24} /></div>
      <Link to="/loans" className={`nav-item ${location.pathname === '/loans' ? 'active' : ''}`}>
        <Landmark size={20} /><span>Loans</span>
      </Link>
      <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
        <Settings size={20} /><span>Settings</span>
      </Link>
    </nav>
  );
};
