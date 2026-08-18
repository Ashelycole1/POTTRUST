import React from 'react';
import { Bell, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Topbar = ({ role }) => {
  const { setNotificationsOpen, notifications, groupName, groupData } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;
  const logoUrl = groupData?.logo_url;

  return (
    <div className="topbar">
      <div className="brand" id="mobileBrand">
        {role !== 'Admin' && logoUrl ? (
          <img
            src={logoUrl}
            alt={groupName}
            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div className="brand-mark">P</div>
        )}
        <div>
          <div className="brand-name">{role !== 'Admin' && groupName ? groupName : 'PotTrust'}</div>
          <div className="brand-sub">{role === 'Admin' ? 'Admin Portal' : (groupName ? 'SACCO Workspace' : 'None')}</div>
        </div>
      </div>
      <div className="top-actions">
        {role !== 'Admin' && (
          <button className="icon-btn" aria-label="Verify a payment">
            <Upload size={18} />
          </button>
        )}
        <button 
          className="icon-btn" 
          aria-label="Notifications"
          onClick={() => setNotificationsOpen(true)}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="dot"></span>}
        </button>
      </div>
    </div>
  );
};

