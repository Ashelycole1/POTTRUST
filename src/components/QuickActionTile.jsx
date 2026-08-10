import React from 'react';

export const QuickActionTile = ({ icon: Icon, label, colorClass, onClick }) => (
  <div className="quick-item" onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className={`qi-icon ${colorClass}`}>
      <Icon size={20} />
    </div>
    {label}
  </div>
);
