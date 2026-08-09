import React from 'react';

export const AuditLogItem = ({ color, headerHtml, sub, time }) => (
  <div className="log-item">
    <div className="log-dot" style={{ background: color }}></div>
    <div>
      <div className="log-text" dangerouslySetInnerHTML={{ __html: headerHtml }}></div>
      <div className="log-text"><span style={{ color: 'var(--text-faint)' }}>{sub}</span></div>
      <div className="log-time">{time}</div>
    </div>
  </div>
);

export const AuditLog = ({ entries }) => (
  <div className="log-list">
    {entries.map((e, idx) => (
      <AuditLogItem key={idx} color={e.c} headerHtml={e.h} sub={e.s} time={e.t} />
    ))}
  </div>
);
