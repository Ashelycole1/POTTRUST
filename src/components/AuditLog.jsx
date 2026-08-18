import React from 'react';

export const AuditLogItem = ({ color, headerHtml, sub, time }) => (
  <div style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 20 }}>
    <div style={{
      position: 'absolute',
      left: 7,
      top: 24,
      bottom: 0,
      width: 2,
      background: 'var(--line)',
      zIndex: 0
    }}></div>
    <div style={{
      width: 16, height: 16, borderRadius: '50%', background: color,
      marginTop: 4, zIndex: 1, border: '3px solid var(--bg)'
    }}></div>
    <div style={{
      flex: 1, background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '12px 16px', zIndex: 1
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: headerHtml }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-faint)', fontSize: 12.5 }}>{sub}</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 11.5, fontFamily: 'IBM Plex Mono' }}>{time}</div>
      </div>
    </div>
  </div>
);

export const AuditLog = ({ entries }) => (
  <div style={{ padding: '8px 0' }}>
    {entries.map((e, idx) => (
      <AuditLogItem 
        key={e.id || idx} 
        color={`var(--${e.color_hint || 'text'})`} 
        headerHtml={e.headline} 
        sub={e.detail} 
        time={new Date(e.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} 
      />
    ))}
  </div>
);
