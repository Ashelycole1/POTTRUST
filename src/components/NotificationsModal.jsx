import React from 'react';
import { X, Check, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsModal = () => {
  const {
    notificationsOpen, setNotificationsOpen,
    notifications,
    markNotifRead, markAllRead,
  } = useApp();

  if (!notificationsOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-raised)', width: '100%', maxWidth: 440,
        borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh', border: '1px solid var(--line)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--line)', background: 'var(--surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} />
            <h2 style={{ margin: 0, fontSize: 17, fontFamily: 'Sora', fontWeight: 700 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--coral)', color: '#fff', borderRadius: '50%',
                width: 20, height: 20, fontSize: 11, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setNotificationsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
              <Bell size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>No notifications yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotifRead(n.id)}
                  style={{
                    background: n.is_read ? 'var(--surface)' : 'rgba(23,181,112,0.07)',
                    border: `1px solid ${n.is_read ? 'var(--line)' : 'rgba(23,181,112,0.25)'}`,
                    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                    transition: 'all 0.2s', position: 'relative',
                  }}
                >
                  {!n.is_read && (
                    <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                  )}
                  <h4 style={{ margin: '0 0 5px', fontSize: 13.5, fontWeight: n.is_read ? 600 : 700, paddingRight: 18 }}>
                    {n.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.45 }}>
                    {n.description || n.desc}
                  </p>
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
                    {n.created_at || n.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {unreadCount > 0 && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
            <button
              onClick={markAllRead}
              style={{
                width: '100%', background: 'var(--surface-2)', color: 'var(--text)',
                border: '1px solid var(--line)', borderRadius: 12, padding: '13px',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Check size={15} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
