import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { type Leave } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, isSameDay } from 'date-fns';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Leave[]>([]);

  useEffect(() => {
    setLoading(true);
    reportAPI.getCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1)
      .then(r => setLeaves(r.data.leaves))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getLeavesForDay = (day: Date) => leaves.filter(l =>
    day >= new Date(l.startDate) && day <= new Date(l.endDate)
  );

  const handleDayClick = (day: Date) => setSelected(getLeavesForDay(day));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Team Calendar</h1>
          <p>Approved leaves across the organization</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>←</button>
          <span style={{ fontWeight: 600, fontSize: 15, minWidth: 160, textAlign: 'center' }}>{format(currentDate, 'MMMM yyyy')}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>→</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div className="card">
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#94a3b8', padding: '8px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const dayLeaves = getLeavesForDay(day);
              const today = isToday(day);
              return (
                <div key={day.toISOString()} onClick={() => handleDayClick(day)} style={{ minHeight: 80, padding: 6, borderRadius: 8, border: `1px solid ${today ? '#2563eb' : '#f1f5f9'}`, background: today ? '#eff6ff' : 'white', cursor: dayLeaves.length > 0 ? 'pointer' : 'default', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (dayLeaves.length > 0) (e.currentTarget as HTMLDivElement).style.background = '#f0f9ff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = today ? '#eff6ff' : 'white'; }}>
                  <div style={{ fontSize: 13, fontWeight: today ? 700 : 400, color: today ? '#2563eb' : '#374151', marginBottom: 4 }}>{format(day, 'd')}</div>
                  {dayLeaves.slice(0, 2).map(l => {
                    const u = l.userId as any;
                    const lt = l.leaveTypeId as any;
                    return <div key={l._id} style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: lt?.color + '30' || '#dbeafe', color: lt?.color || '#2563eb', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{u?.firstName || 'User'}</div>;
                  })}
                  {dayLeaves.length > 2 && <div style={{ fontSize: 10, color: '#94a3b8' }}>+{dayLeaves.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {selected.length > 0 ? (
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>On Leave</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selected.map(l => {
                  const u = l.userId as any;
                  const lt = l.leaveTypeId as any;
                  return (
                    <div key={l._id} style={{ padding: 12, background: '#f8fafc', borderRadius: 10, borderLeft: `3px solid ${lt?.color || '#2563eb'}` }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{u?.firstName} {u?.lastName}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{lt?.name} · {u?.department}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{format(new Date(l.startDate), 'MMM d')} – {format(new Date(l.endDate), 'MMM d')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div style={{ fontSize: 40 }}>📅</div>
                <h3>Select a day</h3>
                <p>Click a day to see who's on leave</p>
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>This Month</h3>
            <div style={{ fontSize: 14, color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>Total on leave</span><b>{leaves.length}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span>Total days</span><b>{leaves.reduce((s, l) => s + l.totalDays, 0)}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
