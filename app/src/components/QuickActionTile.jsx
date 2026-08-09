import React from 'react';

export const QuickActionTile = ({ icon: Icon, label, colorClass }) => (
  <div className="quick-item">
    <div className={`qi-icon ${colorClass}`}>
      <Icon size={20} />
    </div>
    {label}
  </div>
);
