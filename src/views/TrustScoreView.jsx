import React from 'react';
import { ScoreCard } from '../components/Cards';

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

export const TrustScoreView = () => (
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
        <BreakdownRow label="On-time contribution streak" value="+14 cycles" color="var(--green)" />
        <BreakdownRow label="Loan repayment history" value="4 / 4 on time" color="var(--green)" />
        <BreakdownRow label="Pending proof upload" value="1 unresolved" color="var(--gold)" />
        <BreakdownRow label="Fines issued" value="None" color="var(--green)" />
        <BreakdownRow label="Late contributions" value="0" color="var(--green)" />
      </div>

      <div className="section-head" style={{ marginTop: 28 }}>
        <h3>How to improve it</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { tip: 'Resolve your pending payment proof', impact: 'High impact', color: 'var(--gold)' },
          { tip: 'Pay your next loan instalment before the due date', impact: 'High impact', color: 'var(--gold)' },
          { tip: 'Maintain your contribution streak for 3 more cycles', impact: 'Medium impact', color: 'var(--text-dim)' },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 14, padding: '14px 16px'
          }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{item.tip}</div>
            <div style={{ fontSize: 11.5, color: item.color, fontWeight: 600 }}>{item.impact}</div>
          </div>
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 28 }}>
        <h3>Score history</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { cycle: 'Aug 2026', score: 812, change: '+3' },
          { cycle: 'Jul 2026', score: 809, change: '+11' },
          { cycle: 'Jun 2026', score: 798, change: '+8' },
          { cycle: 'May 2026', score: 790, change: '-5' },
        ].map((item, idx) => (
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
        ))}
      </div>
    </div>
  </>
);
