import React from 'react';
import { Bell, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Topbar = ({ role }) => (
  <div className="topbar">
    <div className="brand" id="mobileBrand">
      <div className="brand-mark">P</div>
      <div>
        <div className="brand-name">PotTrust</div>
        <div className="brand-sub">{role === 'Admin' ? 'Admin Portal' : 'Katonga Traders SACCO'}</div>
      </div>
    </div>
    <div className="top-actions">
      {role !== 'Admin' && (
        <button className="icon-btn" aria-label="Verify a payment">
          <Upload size={18} />
        </button>
      )}
      <button className="icon-btn" aria-label="Notifications">
        <Bell size={18} />
        <span className="dot"></span>
      </button>
    </div>
  </div>
);
