import React, { useState } from 'react';

const faqs = [
  { q: 'How do I apply for leave?', a: 'Go to "Apply Leave" in the sidebar. Select the leave type, choose your dates, provide a reason, and attach any required documents. Submit the form — your manager will be notified.' },
  { q: 'How many days in advance should I apply?', a: 'This depends on the leave type. Casual leave typically requires 1-2 days notice, while planned leave (like vacation) should be applied at least 5-7 days in advance. Check the leave type description when applying.' },
  { q: 'What happens after I submit a request?', a: 'Your request goes to your manager/admin for review. You\'ll receive a notification by email and in-app when it\'s approved or rejected. You can track status in Leave History.' },
  { q: 'Can I cancel a leave request?', a: 'Yes — but only if the status is still "Pending". Go to Leave History, open the request, and click Cancel. Approved leaves cannot be cancelled through the system; contact HR.' },
  { q: 'What documents do I need for medical leave?', a: 'A doctor\'s certificate or medical prescription is required for sick leave exceeding 2 consecutive days. Upload it when applying. JPG, PNG, or PDF files are accepted (max 5MB).' },
  { q: 'How is my leave balance calculated?', a: 'Balances are allocated at the start of the year based on leave type policies. When a leave is approved, your balance is automatically reduced. Check Dashboard or Profile to see your current balances.' },
  { q: 'Who can approve my leave?', a: 'Your designated manager or any admin can approve/reject your requests. The admin team reviews all pending requests daily.' },
  { q: 'Can I take half-day leave?', a: 'Yes. When applying, check the "Half Day" option and specify Morning or Afternoon. Half-day leaves count as 0.5 days from your balance.' },
];

const HelpPage = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div className="page-header">
        <h1>Help & FAQ</h1>
        <p>Everything you need to know about leave management</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{faq.q}</span>
                  <span style={{ fontSize: 18, color: '#94a3b8', transition: 'transform 0.2s', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {open === i && (
                  <div style={{ padding: '0 0 16px', fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Leave Process</h3>
            {[
              { step: '1', title: 'Apply', desc: 'Fill out the leave request form', icon: '✏️' },
              { step: '2', title: 'Review', desc: 'Manager reviews your request', icon: '👀' },
              { step: '3', title: 'Decision', desc: 'Approved or rejected with comment', icon: '⚖️' },
              { step: '4', title: 'Notified', desc: 'You receive email + in-app alert', icon: '🔔' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{item.icon} {item.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Contact Support</h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>For issues not covered here, reach out to HR:</p>
            <div style={{ fontSize: 13, color: '#334155', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>📧 hr@company.com</div>
              <div>📞 +91 80 1234 5678</div>
              <div>🕘 Mon–Fri, 9am–6pm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
