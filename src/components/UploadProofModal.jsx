import React, { useState, useRef } from 'react';
import { X, Upload, Camera, CreditCard, Smartphone, Building2, Banknote, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadImage, proofStoragePath } from '../lib/supabase';

const PAYMENT_MODES = [
  { id: 'MTN MoMo',      icon: Smartphone,  label: 'MTN MoMo' },
  { id: 'Airtel Money',  icon: Smartphone,  label: 'Airtel Money' },
  { id: 'Bank Transfer', icon: Building2,   label: 'Bank Transfer' },
  { id: 'Cash',          icon: Banknote,    label: 'Cash Deposit' },
];

export const UploadProofModal = () => {
  const { proofModalOpen, setProofModalOpen, submitProof, groupData, userData } = useApp();

  const [step, setStep]               = useState(1); // 1 = form, 2 = confirm, 3 = success
  const [mode, setMode]               = useState('');
  const [amount, setAmount]           = useState('');
  const [txnRef, setTxnRef]           = useState('');
  const [notes, setNotes]             = useState('');
  const [screenshot, setScreenshot]   = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [errors, setErrors]           = useState({});
  const [uploading, setUploading]     = useState(false);
  const [uploadErr, setUploadErr]     = useState('');
  const fileRef                       = useRef();

  if (!proofModalOpen) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!mode)   errs.mode   = 'Select a payment mode';
    if (!amount || isNaN(amount) || Number(amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!txnRef) errs.txnRef = 'Enter the transaction reference';
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    setUploadErr('');
    setUploading(true);
    let proofUrl = null;

    // Upload screenshot to Supabase Storage if one was selected
    if (screenshot && groupData?.id && userData?.id) {
      try {
        const path = proofStoragePath(groupData.id, userData.id, screenshot);
        proofUrl = await uploadImage(screenshot, path);
      } catch (err) {
        console.warn('[UploadProofModal] Storage upload failed:', err.message);
        // Non-fatal: we still submit the contribution without the URL
        setUploadErr('Screenshot could not be uploaded, but your proof will still be submitted.');
      }
    }

    await submitProof({ mode, amount, txnRef, notes, screenshot, proofUrl });
    setUploading(false);
    setStep(3);
  };

  const handleClose = () => {
    setProofModalOpen(false);
    setStep(1);
    setMode(''); setAmount(''); setTxnRef(''); setNotes('');
    setScreenshot(null); setScreenshotPreview(null); setErrors({}); setUploadErr('');
  };


  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--line)',
        borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520,
        padding: '28px 24px 40px', position: 'relative',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, background: 'var(--line)', borderRadius: 4, margin: '0 auto 24px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, margin: 0 }}>
              {step === 1 && 'Upload Payment Proof'}
              {step === 2 && 'Confirm Submission'}
              {step === 3 && 'Submitted'}
            </h2>
            <p style={{ color: 'var(--text-faint)', fontSize: 12.5, margin: '4px 0 0' }}>
              {step === 1 && 'Aug cycle · Due: UGX 200,000'}
              {step === 2 && 'Review before submitting to the treasurer'}
              {step === 3 && 'Your proof is in the review queue'}
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', padding: 4 }}>
            <X size={22} />
          </button>
        </div>

        {/* ── STEP 1: FORM ── */}
        {step === 1 && (
          <>
            {/* Payment mode */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Mode of Payment</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {PAYMENT_MODES.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setMode(pm.id)}
                    style={{
                      background: mode === pm.id ? 'var(--green-deep)' : 'var(--surface)',
                      border: `1px solid ${mode === pm.id ? 'var(--green)' : 'var(--line)'}`,
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      color: mode === pm.id ? 'var(--green)' : 'var(--text-dim)',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    <pm.icon size={16} /> {pm.label}
                  </button>
                ))}
              </div>
              {errors.mode && <p style={errStyle}>{errors.mode}</p>}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Amount Paid (UGX)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 200000"
                style={inputStyle(!!errors.amount)}
              />
              {errors.amount && <p style={errStyle}>{errors.amount}</p>}
            </div>

            {/* Transaction reference */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Transaction Reference / ID</label>
              <input
                type="text"
                value={txnRef}
                onChange={e => setTxnRef(e.target.value)}
                placeholder="e.g. 82103"
                style={inputStyle(!!errors.txnRef)}
              />
              {errors.txnRef && <p style={errStyle}>{errors.txnRef}</p>}
            </div>

            {/* Screenshot */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Screenshot (optional but recommended)</label>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} style={{ display: 'none' }} />
              {screenshotPreview ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot"
                    style={{ width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'cover', border: '1px solid var(--line)' }}
                  />
                  <button
                    onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current.click()}
                  style={{
                    width: '100%', background: 'var(--surface)', border: '1.5px dashed var(--line)',
                    borderRadius: 12, padding: '22px 0', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 8, color: 'var(--text-faint)', cursor: 'pointer',
                  }}
                >
                  <Camera size={24} />
                  <span style={{ fontSize: 13 }}>Tap to attach screenshot</span>
                </button>
              )}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional details for the treasurer..."
                style={{ ...inputStyle(false), resize: 'none', height: 76, lineHeight: 1.5 }}
              />
            </div>

            <button onClick={handleNext} style={primaryBtn}>
              <Upload size={16} /> Review before submitting
            </button>
          </>
        )}

        {/* ── STEP 2: CONFIRM ── */}
        {step === 2 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              <ConfirmRow label="Payment mode"  value={mode} />
              <ConfirmRow label="Amount"         value={`UGX ${Number(amount).toLocaleString()}`} mono />
              <ConfirmRow label="Txn reference"  value={`#${txnRef}`} mono />
              {notes && <ConfirmRow label="Notes" value={notes} />}
              {screenshotPreview && (
                <div>
                  <p style={{ ...labelStyle, marginBottom: 8 }}>Screenshot</p>
                  <img src={screenshotPreview} alt="Preview" style={{ width: '100%', borderRadius: 12, maxHeight: 160, objectFit: 'cover', border: '1px solid var(--line)' }} />
                </div>
              )}
            </div>

            {uploadErr && (
              <p style={{ color: 'var(--gold)', fontSize: 12.5, marginBottom: 12, lineHeight: 1.4 }}>
                ⚠ {uploadErr}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} style={secondaryBtn} disabled={uploading}>Edit</button>
              <button onClick={handleSubmit} style={{ ...primaryBtn, flex: 1, opacity: uploading ? 0.7 : 1 }} disabled={uploading}>
                {uploading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid #08251d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Uploading…
                  </>
                ) : 'Submit to Treasurer'}
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--green-deep)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <Upload size={28} color="var(--green)" />
            </div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>
              Proof submitted
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: '0 0 28px', lineHeight: 1.5 }}>
              Your payment proof is now in the treasurer&rsquo;s review queue. You will be updated once it is verified.
            </p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 16px', textAlign: 'left', marginBottom: 24 }}>
              <ConfirmRow label="Amount"        value={`UGX ${Number(amount).toLocaleString()}`} mono />
              <ConfirmRow label="Mode"          value={mode} />
              <ConfirmRow label="Reference"     value={`#${txnRef}`} mono />
              <ConfirmRow label="Status"        value="PENDING — awaiting treasurer" />
            </div>
            <button onClick={handleClose} style={primaryBtn}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── helpers ──────────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8,
};

const errStyle = { color: 'var(--coral)', fontSize: 12, marginTop: 6, fontWeight: 500 };

const inputStyle = (hasErr) => ({
  width: '100%', background: 'var(--surface)',
  border: `1px solid ${hasErr ? 'var(--coral)' : 'var(--line)'}`,
  borderRadius: 12, padding: '12px 14px', color: 'var(--text)',
  fontSize: 14, fontFamily: 'Inter', outline: 'none',
  boxSizing: 'border-box',
});

const primaryBtn = {
  width: '100%', background: 'var(--green)', color: '#08251d',
  border: 'none', borderRadius: 12, padding: '14px',
  fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 8, cursor: 'pointer',
};

const secondaryBtn = {
  flex: '0 0 100px', background: 'var(--surface)', color: 'var(--text-dim)',
  border: '1px solid var(--line)', borderRadius: 12, padding: '14px',
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
};

const ConfirmRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
    <span style={{ fontSize: 12.5, color: 'var(--text-faint)', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: mono ? 'IBM Plex Mono' : 'Inter' }}>{value}</span>
  </div>
);
