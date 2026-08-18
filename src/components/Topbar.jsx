import React from 'react';
import { Bell, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Topbar = ({ role }) => {
  const { setNotificationsOpen, notifications, groupName } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="topbar">
      <div className="brand" id="mobileBrand">
        <div className="brand-mark">P</div>
        <div>
          <div className="brand-name">PotTrust</div>
          <div className="brand-sub">{role === 'Admin' ? 'Admin Portal' : (groupName || 'None')}</div>
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

