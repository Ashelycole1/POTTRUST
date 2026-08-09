import React from 'react';
import { AuditLog } from '../components/AuditLog';
import { useApp } from '../context/AppContext';

export const ActivityView = () => {
  const { activityLog } = useApp();

  return (
    <>
      <div className="greeting">
        <p className="hello">Immutable record</p>
        <p className="name">Activity Log</p>
      </div>

      <div className="section">
        <div className="section-head">
          <h3>All entries</h3>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Read-only · permanent</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: '0 0 16px' }}>
          Every entry below is timestamped and cannot be edited or deleted.
        </p>
        <AuditLog entries={activityLog} />
      </div>
    </>
  );
};
