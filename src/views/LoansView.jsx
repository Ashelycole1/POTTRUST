import React from 'react';
import { LoanCard } from '../components/Cards';
import { MemberRow } from '../components/MemberRow';

export const LoansView = () => (
  <>
    <div className="greeting">
      <p className="hello">Loan book</p>
      <p className="name">Your Loans</p>
    </div>

    <div className="carousel-wrap">
      <div className="carousel">
        <LoanCard />
      </div>
    </div>

    <div className="section">
      <div className="section-head">
        <h3>Active &amp; past loans</h3>
        <a className="link" href="#">New request</a>
      </div>
      <div className="member-list">
        <MemberRow
          name="You"
          initials="NA"
          sub="UGX 620,000 outstanding · 4 of 8 instalments paid"
          status="ACTIVE"
          avatarColor="var(--gold)"
        />
        <MemberRow
          name="Egabo Aaron"
          initials="EA"
          sub="UGX 300,000 · cleared 2 Jul"
          status="CLEARED"
          avatarColor="var(--green)"
        />
        <MemberRow
          name="Ssenyonjo K."
          initials="SK"
          sub="UGX 450,000 · repayment overdue"
          status="AT RISK"
          avatarColor="var(--coral)"
        />
      </div>

      <div className="section-head" style={{ marginTop: 28 }}>
        <h3>Repayment schedule</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Instalment 5', date: '12 Aug 2026', amount: 'UGX 95,000', done: false },
          { label: 'Instalment 6', date: '12 Sep 2026', amount: 'UGX 95,000', done: false },
          { label: 'Instalment 7', date: '12 Oct 2026', amount: 'UGX 95,000', done: false },
          { label: 'Instalment 8', date: '12 Nov 2026', amount: 'UGX 95,000', done: false },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>{item.date}</div>
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
              {item.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);
