import React from 'react';
import { AuditLog } from '../components/AuditLog';

const logEntries = [
  { c: 'var(--green)', h: '<b>Egabo Aaron</b> was verified PAID',         s: 'UGX 200,000 · MTN MoMo ref #82103',           t: 'Today, 9:14 AM' },
  { c: 'var(--gold)',  h: '<b>Onyango J. Steven</b> uploaded a payment slip', s: 'Awaiting treasurer review',                t: 'Today, 8:02 AM' },
  { c: 'var(--coral)', h: '<b>Ssenyonjo K.</b> marked OVERDUE',           s: 'Fine of UGX 5,000 applied automatically',    t: 'Yesterday, 6:30 PM' },
  { c: 'var(--green)', h: 'Loan repayment received from <b>you</b>',      s: 'UGX 95,000 · pot updated',                   t: 'Yesterday, 2:11 PM' },
  { c: 'var(--green)', h: '<b>Tumwine N.</b> was verified PAID',          s: 'UGX 200,000 · Airtel Money ref #55291',      t: 'Mon, 4:47 PM' },
  { c: 'var(--gold)',  h: 'New loan request from <b>Ssenyonjo K.</b>',   s: 'UGX 450,000 requested · pending vote',       t: 'Mon, 11:20 AM' },
  { c: 'var(--green)', h: '<b>Rwothomio Evans</b> was verified PAID',     s: 'UGX 200,000 · Airtel Money ref #49021',      t: 'Mon, 9:05 AM' },
  { c: 'var(--coral)', h: '<b>Natozo Martha</b> marked OVERDUE',          s: 'Fine of UGX 5,000 applied automatically',    t: 'Sun, 11:59 PM' },
  { c: 'var(--gold)',  h: 'Pot balance updated',                          s: 'New cycle started · UGX 4,820,000 total',    t: 'Sat, 12:00 AM' },
  { c: 'var(--green)', h: '<b>Alimpa A. Hillary</b> was verified PAID',   s: 'UGX 200,000 · MTN MoMo ref #77403',          t: 'Fri, 3:22 PM' },
];

export const ActivityView = () => (
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
      <AuditLog entries={logEntries} />
    </div>
  </>
);
