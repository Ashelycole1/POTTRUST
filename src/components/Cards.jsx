import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, FileText, Plus, Upload, Download, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PotCard = () => {
  const { groupPot, setProofModalOpen, groupData } = useApp();
  const navigate = useNavigate();
  return (
    <div className="card card-pot">
      <div className="weave"></div>
      <div className="card-label">Group pot · active</div>
      <div className="card-value" style={{ fontFamily: 'IBM Plex Mono' }}>
        UGX {groupPot.toLocaleString()}
      </div>
      <div className="card-meta">{groupData?.member_count || 1} members · {new Date().toLocaleString('default', { month: 'short' })} cycle</div>
      <div className="card-actions">
        <button onClick={() => setProofModalOpen(true)}><Download size={18} /><span>Contribute</span></button>
        <div className="divider"></div>
        <button onClick={() => navigate('/statements')}><FileText size={18} /><span>Statement</span></button>
      </div>
    </div>
  );
};

export const ScoreCard = () => {
  const navigate = useNavigate();
  const { trustScore } = useApp();
  
  if (!trustScore) {
    return (
      <div className="card card-score">
        <div className="weave"></div>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-dim)', textAlign: 'center', padding: '0 20px' }}>
          <TrendingUp size={28} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>No score yet</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Your score appears after your first contribution</div>
        </div>
      </div>
    );
  }

  // Calculate stroke dash based on score out of 1000
  const maxScore = 1000;
  const percentage = trustScore.score / maxScore;
  const circumference = 2 * Math.PI * 22; // r=22
  const strokeDashoffset = circumference - percentage * circumference;

  return (
  <div className="card card-score">
    <div className="weave"></div>
    <svg className="score-ring" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r="22" fill="none" stroke="#4a3a12" strokeWidth="5"/>
      <circle cx="27" cy="27" r="22" fill="none" stroke="#f2c14e" strokeWidth="5"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-90 27 27)"/>
      <text x="27" y="31" textAnchor="middle" className="score-num">{trustScore.score}</text>
    </svg>
    <div className="card-label">Your trust score</div>
    <div className="card-value" style={{ fontSize: '22px' }}>{trustScore.tier} <small>tier</small></div>
    <div className="card-meta">On-time streak: {trustScore.streak} cycles</div>
    <div className="card-actions">
      <button onClick={() => navigate('/trust')}><TrendingUp size={18} /><span>Breakdown</span></button>
      <div className="divider"></div>
      <button onClick={() => navigate('/trust')}><Plus size={18} /><span>Improve it</span></button>
    </div>
  </div>
  );
};

export const ContribCard = () => {
  const { memberContrib, setProofModalOpen } = useApp();
  const { paid, total, lastPayment } = memberContrib;
  const remaining = total - paid;

  return (
    <div className="card card-contrib">
      <div className="card-label">My contributions</div>
      <div className="card-value" style={{ fontFamily: 'IBM Plex Mono' }}>
        UGX {paid.toLocaleString()} <small>/ {total.toLocaleString()}</small>
      </div>
      <div className="card-meta">{lastPayment}</div>
      {remaining > 0 && (
        <div className="card-meta" style={{ color: 'var(--gold)', marginTop: 2 }}>
          UGX {remaining.toLocaleString()} remaining this cycle
        </div>
      )}
      <div className="card-actions">
        <button onClick={() => setProofModalOpen(true)}><Plus size={18} /><span>Top up</span></button>
        <div className="divider"></div>
        <button onClick={() => setProofModalOpen(true)}>
          <Upload size={18} /><span>Upload proof</span>
        </button>
      </div>
    </div>
  );
};

export const LoanCard = () => {
  const navigate = useNavigate();
  const { setLoanRepayModalOpen, memberLoan } = useApp();
  return (
  <div className="card card-loan">
    <div className="card-label">Active loan</div>
    <div className="card-value" style={{ fontFamily: 'IBM Plex Mono' }}>UGX {memberLoan.outstanding.toLocaleString()}</div>
    <div className="card-meta">Next repayment: UGX {memberLoan.nextRepayment.toLocaleString()} (this cycle)</div>
    <div className="card-actions">
      <button onClick={() => setLoanRepayModalOpen(true)}><Download size={18} /><span>Repay</span></button>
      <div className="divider"></div>
      <button onClick={() => navigate('/loans')}><Calendar size={18} /><span>Schedule</span></button>
    </div>
  </div>
  );
};
