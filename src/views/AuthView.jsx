import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle } from 'lucide-react';

// ── Shared styles ─────────────────────────────────────────────────────────────
const formStyle = { width: '100%', maxWidth: 380, marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 };
const fieldWrap = { position: 'relative' };
const iconStyle  = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' };
const inputSt    = { width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '13px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box' };

const ErrorBanner = ({ msg }) => (
  <div style={{ color: 'var(--coral)', fontSize: 13, textAlign: 'center', background: 'rgba(255,100,100,0.08)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,100,100,0.2)', lineHeight: 1.4 }}>
    {msg}
  </div>
);

const SubmitBtn = ({ loading, label }) => (
  <button type="submit" disabled={loading}
    style={{ width: '100%', background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
  >
    {loading && <span style={{ width: 16, height: 16, border: '2px solid #08251d', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
    {loading ? 'Please wait…' : label}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </button>
);

const FooterLink = ({ text, linkText, onClick }) => (
  <div style={{ marginTop: 24, fontSize: 13, color: 'var(--text-dim)', textAlign: 'center' }}>
    {text}
    <button type="button" onClick={onClick}
      style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
      {linkText}
    </button>
  </div>
);

// ── Background wrapper ────────────────────────────────────────────────────────
const AuthContainer = ({ children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(circle at top right, rgba(23,181,112,0.1) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(242,193,78,0.05) 0%, transparent 40%), var(--bg)',
    padding: 20, position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: '10%', left: '15%', width: 300, height: 300, background: 'var(--green)', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 250, height: 250, background: 'var(--gold)', filter: 'blur(100px)', opacity: 0.05, borderRadius: '50%', pointerEvents: 'none' }} />

    <div style={{
      background: 'rgba(51, 53, 66, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 20px',
      width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: '0 24px 40px rgba(0,0,0,0.2)', position: 'relative', zIndex: 10, boxSizing: 'border-box'
    }}>
      <div style={{
        width: 70, height: 70, borderRadius: 18,
        background: 'linear-gradient(135deg, var(--green) 0%, #0d6b47 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Sora', fontWeight: 800, color: '#08251d', fontSize: 32,
        marginBottom: 24, boxShadow: '0 8px 24px rgba(23,181,112,0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>P</div>
      {children}
    </div>
  </div>
);

// ── Clerk Auth Form ───────────────────────────────────────────────────────────
import { useSignIn, useSignUp } from '@clerk/clerk-react';

const ClerkAuthForm = () => {
  const { isLoaded: siLoaded, signIn, setActive: siSetActive } = useSignIn();
  const { isLoaded: suLoaded, signUp, setActive: suSetActive } = useSignUp();

  const [mode, setMode]           = useState('signin'); // signin | signup | verify
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const clearError = () => setError('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!siLoaded) return;
    setLoading(true); clearError();
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await siSetActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_second_factor') {
        // Send a code if it's phone/email based, or just set mode if TOTP
        const factor = result.supportedFirstFactors?.find(f => f.strategy === 'phone_code') || 
                       result.supportedSecondFactors?.find(f => f.strategy === 'phone_code');
        if (factor) {
          await signIn.prepareSecondFactor({ strategy: 'phone_code', phoneNumberId: factor.phoneNumberId });
        }
        setMode('mfa');
      } else {
        setError(`Sign in incomplete. Status: ${result.status}. Please check your account.`);
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign in failed. Check your credentials.');
    } finally { 
      if (document.body.contains(e.target)) {
        setLoading(false); 
      }
    }
  };

  const handleMfa = async (e) => {
    e.preventDefault();
    if (!siLoaded) return;
    setLoading(true); clearError();
    try {
      // attempt phone_code first, then totp if that fails or was chosen
      let result;
      try {
        result = await signIn.attemptSecondFactor({ strategy: 'phone_code', code: verifyCode });
      } catch (err) {
        result = await signIn.attemptSecondFactor({ strategy: 'totp', code: verifyCode });
      }
      
      if (result.status === 'complete') {
        await siSetActive({ session: result.createdSessionId });
      } else {
        setError(`Failed to verify code. Status: ${result.status}`);
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!suLoaded) return;
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true); clearError();
    try {
      await signUp.create({
        emailAddress: email, password, firstName, lastName,
        unsafeMetadata: { phone },
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setMode('verify');
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign up failed.');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!suLoaded) return;
    setLoading(true); clearError();
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verifyCode });
      if (result.status === 'complete') {
        await suSetActive({ session: result.createdSessionId });
        // App will now re-render as <SignedIn> and load data from Supabase
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid code.');
    } finally { setLoading(false); }
  };

  if (mode === 'verify' || mode === 'mfa') return (
    <AuthContainer>
      <h1 style={{ fontFamily: 'Sora', fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
        {mode === 'mfa' ? 'Two-Step Verification' : 'Check your inbox'}
      </h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 4px', textAlign: 'center' }}>
        {mode === 'mfa' ? 'Enter the verification code sent to your phone or authenticator app.' : `We sent a 6-digit code to ${email}.`}
      </p>
      <form onSubmit={mode === 'mfa' ? handleMfa : handleVerify} style={formStyle}>
        {error && <ErrorBanner msg={error} />}
        <div style={fieldWrap}>
          <CheckCircle size={18} style={iconStyle} />
          <input type="text" inputMode="numeric" value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
            placeholder="Enter verification code" maxLength={6} style={{ ...inputSt, paddingLeft: 42 }} required autoFocus />
        </div>
        <SubmitBtn loading={loading} label="Verify & Continue" />
      </form>
      {mode === 'verify' && (
        <FooterLink text="Didn't receive it? " linkText="Resend code"
          onClick={async () => { try { await signUp.prepareEmailAddressVerification({ strategy: 'email_code' }); } catch { setError('Failed to resend.'); } }} />
      )}
      {mode === 'mfa' && (
        <FooterLink text="Having trouble? " linkText="Back to sign in" onClick={() => { setMode('signin'); clearError(); }} />
      )}
    </AuthContainer>
  );

  if (mode === 'signup') return (
    <AuthContainer>
      <h1 style={{ fontFamily: 'Sora', fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Create an account</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 4px', textAlign: 'center' }}>Join your group savings platform today.</p>
      <form onSubmit={handleSignUp} style={formStyle}>
        {error && <ErrorBanner msg={error} />}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ ...fieldWrap, flex: 1 }}>
            <UserIcon size={18} style={iconStyle} />
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
              placeholder="First name" style={{ ...inputSt, paddingLeft: 42 }} required />
          </div>
          <div style={{ ...fieldWrap, flex: 1 }}>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
              placeholder="Last name" style={inputSt} required />
          </div>
        </div>
        <div style={fieldWrap}>
          <Mail size={18} style={iconStyle} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address" style={{ ...inputSt, paddingLeft: 42 }} required />
        </div>
        <div style={fieldWrap}>
          <span style={{ ...iconStyle, fontSize: 14, fontWeight: 700 }}>+</span>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Phone (e.g. +256 700 123456)" style={{ ...inputSt, paddingLeft: 36 }} />
        </div>
        <div style={fieldWrap}>
          <Lock size={18} style={iconStyle} />
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)" style={{ ...inputSt, paddingLeft: 42, paddingRight: 42 }} minLength={8} required />
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div style={fieldWrap}>
          <Lock size={18} style={iconStyle} />
          <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm password" style={{ ...inputSt, paddingLeft: 42 }} required />
        </div>
        <SubmitBtn loading={loading} label="Create Account" />
      </form>
      <FooterLink text="Already have an account? " linkText="Sign in" onClick={() => { setMode('signin'); clearError(); }} />
    </AuthContainer>
  );

  // Default: Sign In
  return (
    <AuthContainer>
      <h1 style={{ fontFamily: 'Sora', fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Welcome back</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 4px', textAlign: 'center' }}>Sign in to access your PotTrust dashboard.</p>
      <form onSubmit={handleSignIn} style={formStyle}>
        {error && <ErrorBanner msg={error} />}
        <div style={fieldWrap}>
          <Mail size={18} style={iconStyle} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address" style={{ ...inputSt, paddingLeft: 42 }} required autoFocus />
        </div>
        <div style={fieldWrap}>
          <Lock size={18} style={iconStyle} />
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" style={{ ...inputSt, paddingLeft: 42, paddingRight: 42 }} required />
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <SubmitBtn loading={loading} label="Sign In" />
      </form>
      <FooterLink text="Don't have an account? " linkText="Create one" onClick={() => { setMode('signup'); clearError(); }} />
    </AuthContainer>
  );
};

// ── Fallback when Clerk is not configured ─────────────────────────────────────
const NoClerkNotice = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', padding: 20,
  }}>
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24,
      padding: '40px 30px', maxWidth: 420, width: '100%', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 48, color: 'var(--green)', marginBottom: 24 }}>P</div>
      <h1 style={{ fontFamily: 'Sora', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>PotTrust</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
        Authentication is not yet configured.<br />
        Add <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>VITE_CLERK_PUBLISHABLE_KEY</code> to your <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>.env</code> file to enable login.
      </p>
      <div style={{ background: 'rgba(242,193,78,0.1)', border: '1px solid rgba(242,193,78,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#e8cd84' }}>
        ⚠ Running without authentication — set up your environment variables.
      </div>
    </div>
  </div>
);

// ── Main exported component ───────────────────────────────────────────────────
export const AuthView = ({ clerkAvailable = false }) => {
  if (!clerkAvailable) return <NoClerkNotice />;
  return <ClerkAuthForm />;
};
