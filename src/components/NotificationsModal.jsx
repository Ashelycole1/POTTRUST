import React from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsModal = () => {
  const { notificationsOpen, setNotificationsOpen, notifications, setNotifications } = useApp();

  if (!notificationsOpen) return null;

  const handleClose = () => {
    setNotificationsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'var(--bg)', width: '100%', maxWidth: 440,
        borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--line)', background: 'var(--surface)'
        }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Notifications</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => toggleRead(n.id)}
                  style={{ 
                    background: n.read ? 'var(--surface)' : 'rgba(23, 181, 112, 0.1)', 
                    border: `1px solid ${n.read ? 'var(--line)' : 'var(--green-deep)'}`,
                    borderRadius: 12, padding: '16px', cursor: 'pointer',
                    transition: 'all 0.2s', position: 'relative'
                  }}
                >
                  {!n.read && (
                    <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                  )}
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: n.read ? 600 : 700, paddingRight: 20 }}>
                    {n.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                    {n.desc}
                  </p>
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
                    {n.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {unreadCount > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
            <button 
              onClick={markAllAsRead}
              style={{
                width: '100%', background: 'var(--surface-2)', color: 'var(--text)',
                border: '1px solid var(--line)', borderRadius: 12, padding: '14px',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s'
              }}
            >
              <Check size={16} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
