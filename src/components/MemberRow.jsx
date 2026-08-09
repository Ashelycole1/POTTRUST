import React from 'react';

export const Badge = ({ status }) => {
  const statusMap = {
    'PAID': 'badge-paid',
    'CLEARED': 'badge-paid',
    'PENDING': 'badge-pending',
    'ACTIVE': 'badge-pending',
    'OVERDUE': 'badge-overdue',
    'AT RISK': 'badge-overdue',
    'ADMIN': 'badge-admin'
  };
  const className = `badge ${statusMap[status] || 'badge-admin'}`;
  return <span className={className}>{status}</span>;
};

export const MemberRow = ({ name, initials, sub, status, avatarColor, actionLabel, onAction }) => (
  <div className="member-row">
    <div className="avatar" style={{ background: avatarColor }}>{initials}</div>
    <div className="member-info">
      <div className="member-name">{name}</div>
      <div className="member-sub">{sub}</div>
    </div>
    {status && <Badge status={status} />}
    {actionLabel && (
      <button className="member-action" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);
