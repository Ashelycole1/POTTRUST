import React, { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export const OnboardingView = () => {
  const { user } = useUser();
  const { groupRequests, userData, refetch } = useApp();
  const [saccoName, setSaccoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pendingRequest = groupRequests?.find(r => r.status === 'PENDING');
  const approvedRequest = groupRequests?.find(r => r.status === 'APPROVED');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!saccoName.trim() || !userData) return;

    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('group_requests')
        .insert([{
          user_id: userData.id,
          sacco_name: saccoName.trim()
        }]);
      
      if (dbError) throw dbError;
      
      await refetch();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface)', padding: '40px', borderRadius: 24,
        border: '1px solid var(--line)', width: '100%', maxWidth: 440,
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: 'var(--green-deep)',
            color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, margin: '0 auto 16px'
          }}>
            P
          </div>
          <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Welcome to POTTRUST</h1>
          <p style={{ color: 'var(--text-faint)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            To get started, you need to be part of a SACCO or savings group.
          </p>
        </div>

        {approvedRequest ? (
          <div style={{ textAlign: 'center', padding: '20px', background: 'var(--green-deep)', borderRadius: 16, color: 'var(--green)' }}>
            <h3 style={{ margin: '0 0 8px' }}>Request Approved!</h3>
            <p style={{ fontSize: 13, margin: 0 }}>Your group has been created. Please refresh the page to access your dashboard.</p>
            <button onClick={() => window.location.reload()} className="btn primary" style={{ marginTop: 16, width: '100%' }}>
              Refresh Dashboard
            </button>
          </div>
        ) : pendingRequest ? (
          <div style={{ textAlign: 'center', padding: '20px', background: 'var(--surface-2)', borderRadius: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Request Pending</h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>
              You requested to create the group <strong>{pendingRequest.sacco_name}</strong>.<br/>
              The admin is reviewing your request. Please check back later.
            </p>
            <button onClick={() => refetch()} className="btn secondary" style={{ marginTop: 16, width: '100%' }}>
              Check Status
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-dim)' }}>
                REQUEST A NEW SACCO
              </label>
              <input
                type="text"
                placeholder="Enter SACCO or Group Name"
                value={saccoName}
                onChange={e => setSaccoName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1px solid var(--line)', background: 'var(--bg)',
                  fontSize: 14, outline: 'none', color: 'var(--text)'
                }}
                required
              />
            </div>
            
            {error && <div style={{ color: 'var(--coral)', fontSize: 13 }}>{error}</div>}
            
            <button type="submit" className="btn primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <SignOutButton>
            <button style={{
              background: 'none', border: 'none', color: 'var(--text-faint)',
              fontSize: 13, cursor: 'pointer', textDecoration: 'underline'
            }}>
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
};
