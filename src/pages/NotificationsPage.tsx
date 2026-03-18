import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { type Notification } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const typeIcons: Record<string, string> = { leave_applied: '📤', leave_approved: '✅', leave_rejected: '❌', leave_cancelled: '✕', system: '🔔' };

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await notificationAPI.markRead(id);
    setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
  };

  const markAllRead = async () => {
    await notificationAPI.markRead('all');
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    toast.success('All marked as read');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount} unread · {notifications.length} total</p>
        </div>
        {unreadCount > 0 && <button onClick={markAllRead} className="btn btn-secondary btn-sm">✓ Mark all read</button>}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#2563eb', margin: 'auto' }}></div></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div>
            {notifications.map(notif => (
              <div key={notif._id} onClick={() => !notif.isRead && markRead(notif._id)} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: notif.isRead ? 'transparent' : '#eff6ff', cursor: notif.isRead ? 'default' : 'pointer', transition: 'background 0.15s', borderRadius: 8, marginBottom: 2 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {typeIcons[notif.type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: notif.isRead ? 400 : 600, color: '#0f172a' }}>{notif.title}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#475569' }}>{notif.message}</p>
                </div>
                {!notif.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 6 }}></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
