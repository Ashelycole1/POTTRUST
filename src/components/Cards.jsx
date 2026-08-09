import React from 'react';
import { TrendingUp, FileText, Plus, Upload, Download, Calendar } from 'lucide-react';

export const PotCard = () => (
  <div className="card card-pot">
    <div className="weave"></div>
    <div className="card-label">Group pot · active</div>
    <div className="card-value">UGX 4,820,000</div>
    <div className="card-meta">↑ 6.2% this cycle · 28 members</div>
    <div className="card-actions">
      <button><Download size={18} /><span>Contribute</span></button>
      <div className="divider"></div>
      <button><FileText size={18} /><span>Statement</span></button>
    </div>
  </div>
);

export const ScoreCard = () => (
  <div className="card card-score">
    <div className="weave"></div>
    <svg className="score-ring" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r="22" fill="none" stroke="#4a3a12" strokeWidth="5"/>
      <circle cx="27" cy="27" r="22" fill="none" stroke="#f2c14e" strokeWidth="5"
        strokeDasharray="138" strokeDashoffset="26" strokeLinecap="round" transform="rotate(-90 27 27)"/>
      <text x="27" y="31" textAnchor="middle" className="score-num">812</text>
    </svg>
    <div className="card-label">Your trust score</div>
    <div className="card-value" style={{fontSize: '22px'}}>Very good <small>tier</small></div>
    <div className="card-meta">On-time streak: 14 cycles</div>
    <div className="card-actions">
      <button><TrendingUp size={18} /><span>Breakdown</span></button>
      <div className="divider"></div>
      <button><Plus size={18} /><span>Improve it</span></button>
    </div>
  </div>
);

export const ContribCard = () => (
  <div className="card card-contrib">
    <div className="card-label">My contributions</div>
    <div className="card-value">UGX 180,000 <small>/ 200,000</small></div>
    <div className="card-meta">Due in 3 days · Aug cycle</div>
    <div className="card-actions">
      <button><Plus size={18} /><span>Top up</span></button>
      <div className="divider"></div>
      <button><Upload size={18} /><span>Upload proof</span></button>
    </div>
  </div>
);

export const LoanCard = () => (
  <div className="card card-loan">
    <div className="card-label">Active loan</div>
    <div className="card-value">UGX 620,000</div>
    <div className="card-meta">Next repayment: UGX 95,000 · 12 Aug</div>
    <div className="card-actions">
      <button><Download size={18} /><span>Repay</span></button>
      <div className="divider"></div>
      <button><Calendar size={18} /><span>Schedule</span></button>
    </div>
  </div>
);
