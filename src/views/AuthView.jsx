import React from 'react';
import { Shield, User, Users, Landmark } from 'lucide-react';

export const AuthView = ({ setRole }) => {
  return (
    <div className="auth-container">
      <div className="brand-mark" style={{ width: 60, height: 60, fontSize: 28, marginBottom: 20 }}>P</div>
      <h1 className="auth-title" style={{ fontFamily: 'Sora' }}>Welcome to PotTrust</h1>
      <p className="auth-subtitle">Select a role to preview the dashboard experience.</p>
      
      <div className="auth-roles">
        <button className="auth-btn" onClick={() => setRole('Member')}>
          <User size={18} /> Standard Member
        </button>
        <button className="auth-btn" onClick={() => setRole('Treasurer')}>
          <Landmark size={18} /> Group Treasurer
        </button>
        <button className="auth-btn" onClick={() => setRole('Chairperson')}>
          <Users size={18} /> Group Chairperson
        </button>
        <button className="auth-btn" onClick={() => setRole('Admin')}>
          <Shield size={18} /> System Admin
        </button>
      </div>
    </div>
  );
};
