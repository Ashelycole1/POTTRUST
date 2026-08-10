import React from 'react';
import { LoanCard } from '../components/Cards';
import { MemberRow } from '../components/MemberRow';
import { useApp } from '../context/AppContext';
import { RepayLoanModal } from '../components/RepayLoanModal';
import { RequestLoanModal } from '../components/RequestLoanModal';

export const LoansView = () => {
  const { setLoanRequestModalOpen, loansList, repaymentSchedule } = useApp();

  return (
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
          <button 
            className="link" 
            onClick={() => setLoanRequestModalOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            New request
          </button>
        </div>
        <div className="member-list">
          {loansList.map(loan => (
            <MemberRow
              key={loan.id}
              name={loan.name}
              initials={loan.initials}
              sub={loan.sub}
              status={loan.status}
              avatarColor={loan.color}
            />
          ))}
        </div>

        <div className="section-head" style={{ marginTop: 28 }}>
          <h3>Repayment schedule</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {repaymentSchedule.map((item, idx) => (
            <div key={idx} style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              opacity: item.done ? 0.5 : 1
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>{item.date}</div>
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 600, color: item.done ? 'var(--text-dim)' : 'var(--gold)' }}>
                UGX {item.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RepayLoanModal />
      <RequestLoanModal />
    </>
  );
};
