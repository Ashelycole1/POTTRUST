import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';

// ── Background wrapper ────────────────────────────────────────────────────────
const AuthContainer = ({ children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(circle at top right, rgba(23,181,112,0.1) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(242,193,78,0.05) 0%, transparent 40%), var(--bg)',
    padding: 20, position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: '10%', left: '15%', width: 300, height: 300, background: 'var(--green)', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 250, height: 250, background: 'var(--gold)', filter: 'blur(100px)', opacity: 0.05, borderRadius: '50%', pointerEvents: 'none' }} />

    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 420 }}>
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

// ── Fallback when Clerk is not configured ─────────────────────────────────────
const NoClerkNotice = () => (
  <AuthContainer>
    <div style={{
      background: 'rgba(51, 53, 66, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 20px',
      width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: '0 24px 40px rgba(0,0,0,0.2)', boxSizing: 'border-box'
    }}>
      <h1 style={{ fontFamily: 'Sora', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>PotTrust</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px', textAlign: 'center' }}>
        Authentication is not yet configured.<br />
        Add <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>VITE_CLERK_PUBLISHABLE_KEY</code> to your <code style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>.env</code> file to enable login.
      </p>
      <div style={{ background: 'rgba(242,193,78,0.1)', border: '1px solid rgba(242,193,78,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#e8cd84' }}>
        ⚠ Running without authentication — set up your environment variables.
      </div>
    </div>
  </AuthContainer>
);

// ── Clerk Styling config ──────────────────────────────────────────────────────
const clerkAppearance = {
  variables: {
    colorPrimary: '#17b570',
    colorBackground: 'rgba(51, 53, 66, 0.4)',
    colorInputBackground: '#2a2d39',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#8f93a3',
    borderRadius: '12px',
    fontFamily: '"Inter", sans-serif',
  },
  elements: {
    card: {
      background: 'rgba(51, 53, 66, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 40px rgba(0,0,0,0.2)',
      borderRadius: '24px',
      padding: '30px 20px',
      width: '100%',
      boxSizing: 'border-box'
    },
    headerTitle: { fontFamily: '"Sora", sans-serif', fontSize: '24px' },
    headerSubtitle: { color: 'var(--text-dim)' },
    socialButtonsBlockButton: { border: '1px solid var(--line)', background: 'var(--surface)' },
    socialButtonsBlockButtonText: { color: 'var(--text)' },
    dividerLine: { background: 'var(--line)' },
    dividerText: { color: 'var(--text-faint)' },
    formFieldLabel: { color: 'var(--text-dim)' },
    formFieldInput: { 
      border: '1px solid var(--line)', 
      background: 'var(--surface)', 
      color: 'var(--text)',
      padding: '12px 14px'
    },
    formButtonPrimary: { 
      background: 'var(--green)', 
      color: '#08251d', 
      fontWeight: '700',
      textTransform: 'none',
      fontSize: '14px',
      padding: '12px 14px'
    },
    footerActionText: { color: 'var(--text-dim)' },
    footerActionLink: { color: 'var(--green)', fontWeight: '700' },
    identityPreview: { background: 'var(--surface)', border: '1px solid var(--line)' },
    identityPreviewText: { color: 'var(--text)' },
    identityPreviewEditButtonIcon: { color: 'var(--green)' }
  }
};

// ── Main exported component ───────────────────────────────────────────────────
export const AuthView = ({ clerkAvailable = false }) => {
  const [isSignIn, setIsSignIn] = useState(true);

  if (!clerkAvailable) return <NoClerkNotice />;

  return (
    <AuthContainer>
      {isSignIn ? (
        <SignIn 
          appearance={clerkAppearance} 
          afterSignInUrl="/"
          signUpUrl="javascript:void(0)" // intercept to handle locally
          path={undefined} // Make sure it works completely locally
          routing="virtual"
        />
      ) : (
        <SignUp 
          appearance={clerkAppearance} 
          afterSignUpUrl="/"
          signInUrl="javascript:void(0)"
          path={undefined}
          routing="virtual"
        />
      )}

      {/* Manual toggle below Clerk's form in case routing="virtual" suppresses the footer links */}
      <div style={{ marginTop: 24, fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', zIndex: 10 }}>
        {isSignIn ? "Don't have an account? " : "Already have an account? "}
        <button 
          type="button" 
          onClick={() => setIsSignIn(!isSignIn)}
          style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
        >
          {isSignIn ? "Create one" : "Sign in"}
        </button>
      </div>
    </AuthContainer>
  );
};
