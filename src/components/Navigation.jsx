import React from 'react';
import { Home, Users, Landmark, TrendingUp, FileText, Settings, Plus, Menu, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const DesktopSidebar = ({ role }) => {
  const location = useLocation();
  
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
        { id: 'groups',   icon: Users,     label: 'Groups',           path: '/groups' },
        { id: 'users',    icon: Users,     label: 'Users',            path: '/users' },
        { id: 'activity', icon: Activity,  label: 'Activity',         path: '/activity' },
        { id: 'settings', icon: Settings,  label: 'Platform Settings', path: '/settings' },
      ];
    }
    return [...base, { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }];
  };

  return (
    <nav className="desktop-side">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <div className="brand-name">PotTrust</div>
          <div className="brand-sub">{role === 'Admin' ? 'Admin Portal' : 'Katonga Traders SACCO'}</div>
        </div>
      </div>
      {getNavItems().map(item => (
        <Link key={item.id} to={item.path} className={`side-link ${location.pathname === item.path ? 'active' : ''}`}>
          <item.icon size={18} />&nbsp;&nbsp;{item.label}
        </Link>
      ))}
    </nav>
  );
};

export const MobileBottomNav = ({ role }) => {
  const location = useLocation();

  if (role === 'Admin') return null;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={20} /><span>Home</span>
      </Link>
      <Link to="/members" className={`nav-item ${location.pathname === '/members' ? 'active' : ''}`}>
        <Users size={20} /><span>Members</span>
      </Link>
      <div className="nav-fab"><Plus size={24} /></div>
      <Link to="/loans" className={`nav-item ${location.pathname === '/loans' ? 'active' : ''}`}>
        <Landmark size={20} /><span>Loans</span>
      </Link>
      <Link to="/activity" className={`nav-item ${location.pathname === '/activity' ? 'active' : ''}`}>
        <Activity size={20} /><span>Activity</span>
      </Link>
    </nav>
  );
};
