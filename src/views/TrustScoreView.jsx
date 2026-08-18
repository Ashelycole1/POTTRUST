import React from 'react';
import { ScoreCard } from '../components/Cards';
import { useApp } from '../context/AppContext';

const BreakdownRow = ({ label, value, color }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--line)',
    borderRadius: 14, padding: '14px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }}>
    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 600, color }}>
      {value}
    </div>
  </div>
);

export const TrustScoreView = () => {
  const { trustScore } = useApp();

  if (!trustScore) {
    return (
      <>
        <div className="greeting">
          <p className="hello">Credit standing</p>
          <p className="name">Trust Score</p>
        </div>
        <div className="section" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>No trust score yet.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Your trust score will be calculated after your first contribution.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="greeting">
        <p className="hello">Credit standing</p>
        <p className="name">Trust Score</p>
      </div>

      <div className="carousel-wrap">
        <div className="carousel">
          <ScoreCard />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3>Score breakdown</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BreakdownRow label="On-time contribution streak" value={`+${trustScore.streak} cycles`} color="var(--green)" />
          <BreakdownRow label="Loan repayment history" value={trustScore.loanRepayments} color="var(--green)" />
          <BreakdownRow label="Pending proof upload" value={trustScore.pendingProofs > 0 ? `${trustScore.pendingProofs} unresolved` : 'None'} color={trustScore.pendingProofs > 0 ? "var(--gold)" : "var(--green)"} />
          <BreakdownRow label="Fines issued" value={trustScore.finesIssued === 0 ? "None" : trustScore.finesIssued} color={trustScore.finesIssued === 0 ? "var(--green)" : "var(--coral)"} />
          <BreakdownRow label="Late contributions" value={trustScore.lateContributions} color={trustScore.lateContributions === 0 ? "var(--green)" : "var(--coral)"} />
        </div>

        <div className="section-head" style={{ marginTop: 28 }}>
          <h3>How to improve it</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {trustScore.tips?.length > 0 ? trustScore.tips.map((item, idx) => (
            <div key={idx} style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '14px 16px'
            }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{item.tip}</div>
              <div style={{ fontSize: 11.5, color: item.color, fontWeight: 600 }}>{item.impact}</div>
            </div>
          )) : (
            <div style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>Keep up the good work!</div>
          )}
        </div>

        <div className="section-head" style={{ marginTop: 28 }}>
          <h3>Score history</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trustScore.history?.length > 0 ? trustScore.history.map((item, idx) => (
            <div key={idx} style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.cycle}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 14, fontWeight: 600 }}>{item.score}</span>
                <span style={{
                  fontFamily: 'IBM Plex Mono', fontSize: 12, fontWeight: 600,
                  color: item.change.startsWith('+') ? 'var(--green)' : 'var(--coral)'
                }}>{item.change}</span>
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>No history yet.</div>
          )}
        </div>
      </div>
    </>
  );
};
