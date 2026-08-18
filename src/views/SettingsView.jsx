import React, { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  Camera, Save, Users, DollarSign, Bell, Shield,
  MapPin, Phone, Mail, Globe, Trash2, UserPlus, User, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

// ── helpers ───────────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ fontFamily: 'Sora', fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
    {subtitle && <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: '4px 0 0' }}>{subtitle}</p>}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{
      display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)',
      textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8,
    }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 12, padding: '12px 14px', color: 'var(--text)',
  fontSize: 14, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box',
};

const selectStyle = { ...inputStyle, appearance: 'none', cursor: 'pointer' };

const SaveBtn = ({ onClick, saved, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      marginTop: 8,
      background: saved ? 'var(--green-deep)' : 'var(--green)',
      color: saved ? 'var(--green)' : '#08251d',
      border: 'none', borderRadius: 12, padding: '13px 24px',
      fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
      opacity: loading ? 0.7 : 1,
    }}
  >
    <Save size={16} />
    {loading ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
  </button>
);

const Card = ({ children }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--line)',
    borderRadius: 16, padding: '20px 20px', marginBottom: 16,
  }}>
    {children}
  </div>
);

const Toggle = ({ value, onChange, label, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{sub}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: value ? 'var(--green)' : 'var(--line)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s',
      }} />
    </button>
  </div>
);

// ── Personal Profile ──────────────────────────────────────────────────────────
const UserProfile = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { userData } = useApp();
  const [saved, setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError]   = useState('');

  // Pre-populate from Clerk
  const [phone, setPhone]   = useState('');
  const [nin, setNin]       = useState('');
  const [nokName, setNokName]   = useState('');
  const [nokPhone, setNokPhone] = useState('');
  const [lang, setLang]     = useState('English');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarRef = useRef();

  // Load extras from Supabase users table
  useEffect(() => {
    if (!userData) return;
    setPhone(userData.phone || '');
    setNin(userData.nin || '');
    setNokName(userData.nok_name || '');
    setNokPhone(userData.nok_phone || '');
    setLang(userData.preferred_language || 'English');
    if (userData.avatar_url) setAvatarPreview(userData.avatar_url);
  }, [userData]);

  const displayName = isLoaded && user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'User';

  const email = isLoaded && user
    ? user.primaryEmailAddress?.emailAddress || ''
    : '';

  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const memberSince = userData?.created_at
    ? new Date(userData.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '';

  // Upload avatar to Supabase Storage then update Clerk profile image
  const handleAvatar = async (e) => {
    const f = e.target.files[0];
    if (!f || !user) return;
    setUploadingAvatar(true);
    setError('');
    try {
      // Preview immediately
      setAvatarPreview(URL.createObjectURL(f));

      // Upload to Supabase storage
      const ext  = f.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, f, { upsert: true });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = urlData?.publicUrl;

      if (publicUrl) {
        // Persist URL in our users table
        await supabase.from('users').update({ avatar_url: publicUrl }).eq('clerk_id', user.id);
        // Update Clerk profile image
        await user.setProfileImage({ file: f });
        setAvatarPreview(publicUrl);
      }
    } catch (err) {
      console.error('[avatar upload]', err);
      setError('Photo upload failed. Try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const save = async () => {
    setLoading(true);
    setError('');
    try {
      // Update Supabase extras
      if (userData?.id) {
        const { error: dbErr } = await supabase.from('users').update({
          phone,
          nin,
          nok_name:  nokName,
          nok_phone: nokPhone,
          preferred_language: lang,
        }).eq('id', userData.id);
        if (dbErr) throw dbErr;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('[save profile]', err);
      setError('Save failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionHeader title="My Profile" subtitle="Your personal information visible to group administrators." />

      {error && (
        <div style={{ background: 'var(--coral-deep)', border: '1px solid var(--coral)', color: 'var(--coral)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Avatar */}
      <Card>
        <input type="file" accept="image/*" ref={avatarRef} onChange={handleAvatar} style={{ display: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <div
            onClick={() => !uploadingAvatar && avatarRef.current.click()}
            style={{
              width: 76, height: 76, borderRadius: '50%',
              background: avatarPreview ? 'transparent' : 'var(--green-deep)',
              border: '2px solid var(--line)', cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0, position: 'relative',
              opacity: uploadingAvatar ? 0.6 : 1,
            }}
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, color: 'var(--green)' }}>{initials}</span>}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={11} color="#08251d" />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{displayName}</div>
            {memberSince && <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 2 }}>Member since {memberSince}</div>}
            <button
              onClick={() => !uploadingAvatar && avatarRef.current.click()}
              disabled={uploadingAvatar}
              style={{ marginTop: 8, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 10, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, cursor: uploadingAvatar ? 'not-allowed' : 'pointer' }}
            >
              {uploadingAvatar ? 'Uploading…' : avatarPreview ? 'Change photo' : 'Upload photo'}
            </button>
          </div>
        </div>

        {/* Full name from Clerk — read-only display */}
        <Field label="Full Name">
          <input style={{ ...inputStyle, color: 'var(--text-dim)', background: 'var(--bg)' }} value={displayName} readOnly />
          <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '5px 0 0' }}>Name is managed via your Clerk account.</p>
        </Field>

        <Field label="Phone Number">
          <div style={{ position: 'relative' }}>
            <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 700 000000" />
          </div>
        </Field>

        <Field label="Email Address">
          <div style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input type="email" style={{ ...inputStyle, paddingLeft: 34, color: 'var(--text-dim)', background: 'var(--bg)' }} value={email} readOnly />
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '5px 0 0' }}>Email is managed via your Clerk account.</p>
        </Field>

        <Field label="National ID (NIN)">
          <input style={inputStyle} value={nin} onChange={e => setNin(e.target.value)} placeholder="e.g. CM12345678XXXX" />
          <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '6px 0 0' }}>Used for identity verification. Not shared publicly.</p>
        </Field>

        <Field label="Preferred Language">
          <select style={selectStyle} value={lang} onChange={e => setLang(e.target.value)}>
            <option>English</option>
            <option>Luganda</option>
            <option>Swahili</option>
            <option>French</option>
          </select>
        </Field>
      </Card>

      {/* Next of Kin */}
      <Card>
        <SectionHeader title="Next of Kin" subtitle="Contact in case of emergency." />
        <Field label="Full Name">
          <input style={inputStyle} value={nokName} onChange={e => setNokName(e.target.value)} placeholder="e.g. Mugisha Robert" />
        </Field>
        <Field label="Phone Number">
          <div style={{ position: 'relative' }}>
            <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={nokPhone} onChange={e => setNokPhone(e.target.value)} placeholder="+256 700 000000" />
          </div>
        </Field>
      </Card>

      <SaveBtn onClick={save} saved={saved} loading={loading} />

      <Card>
        <button 
          onClick={() => signOut()}
          style={{ width: '100%', background: 'none', border: '1px solid var(--coral)', color: 'var(--coral)', padding: 14, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </Card>
    </>
  );
};

// ── Group Profile ─────────────────────────────────────────────────────────────
const ProfileSettings = ({ groupId }) => {
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName]       = useState('');
  const [description, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [website, setWebsite] = useState('');
  const [logoPreview, setLogoPreview]     = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const logoRef   = useRef();
  const bannerRef = useRef();

  useEffect(() => {
    if (!groupId) return;
    supabase.from('groups').select('*').eq('id', groupId).single().then(({ data }) => {
      if (!data) return;
      setName(data.name || '');
      setDesc(data.description || '');
      setLocation(data.location || '');
      setPhone(data.contact_phone || '');
      setEmail(data.contact_email || '');
      setWebsite(data.website || '');
      if (data.logo_url) setLogoPreview(data.logo_url);
      if (data.banner_url) setBannerPreview(data.banner_url);
    });
  }, [groupId]);

  const uploadImage = async (file, bucket, path) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data?.publicUrl;
  };

  const handleLogo = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    setLogoPreview(URL.createObjectURL(f));
    try {
      const url = await uploadImage(f, 'group-assets', `logos/${groupId}`);
      if (url) { setLogoPreview(url); await supabase.from('groups').update({ logo_url: url }).eq('id', groupId); }
    } catch (err) { console.error(err); }
  };

  const handleBanner = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    setBannerPreview(URL.createObjectURL(f));
    try {
      const url = await uploadImage(f, 'group-assets', `banners/${groupId}`);
      if (url) { setBannerPreview(url); await supabase.from('groups').update({ banner_url: url }).eq('id', groupId); }
    } catch (err) { console.error(err); }
  };

  const save = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      await supabase.from('groups').update({
        name, description, location,
        contact_phone: phone, contact_email: email, website,
      }).eq('id', groupId);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <>
      <SectionHeader title="Group Profile" subtitle="This information is visible to all group members." />

      <Card>
        <Field label="Group Logo">
          <input type="file" accept="image/*" ref={logoRef} onChange={handleLogo} style={{ display: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => logoRef.current.click()}
              style={{ width: 72, height: 72, borderRadius: '50%', background: logoPreview ? 'transparent' : 'var(--green-deep)', border: '2px solid var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}
            >
              {logoPreview
                ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: 'var(--green)' }}>{name?.[0]?.toUpperCase() || 'G'}</span>}
            </div>
            <div>
              <button onClick={() => logoRef.current.click()} style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={14} /> {logoPreview ? 'Change logo' : 'Upload logo'}
              </button>
              <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '6px 0 0' }}>PNG or JPG · max 2 MB</p>
            </div>
          </div>
        </Field>

        <Field label="Group Banner Image">
          <input type="file" accept="image/*" ref={bannerRef} onChange={handleBanner} style={{ display: 'none' }} />
          {bannerPreview
            ? (
              <div style={{ position: 'relative' }}>
                <img src={bannerPreview} alt="Banner" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--line)' }} />
                <button onClick={() => bannerRef.current.click()} style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Camera size={12} /> Change
                </button>
              </div>
            )
            : (
              <button onClick={() => bannerRef.current.click()} style={{ width: '100%', background: 'var(--bg)', border: '1.5px dashed var(--line)', borderRadius: 12, padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-faint)', cursor: 'pointer' }}>
                <Camera size={22} />
                <span style={{ fontSize: 13 }}>Upload a banner image</span>
                <span style={{ fontSize: 11.5 }}>Recommended: 1200 × 400 px</span>
              </button>
            )}
        </Field>
      </Card>

      <Card>
        <Field label="Group Name">
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="Description">
          <textarea style={{ ...inputStyle, resize: 'none', height: 90, lineHeight: 1.5 }} value={description} onChange={e => setDesc(e.target.value)} placeholder="A short description of your group..." />
        </Field>
      </Card>

      <Card>
        <SectionHeader title="Contact Information" />
        <Field label="Physical Location">
          <div style={{ position: 'relative' }}>
            <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Katonga Road, Kampala" />
          </div>
        </Field>
        <Field label="Phone Number">
          <div style={{ position: 'relative' }}>
            <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+256 700 000000" />
          </div>
        </Field>
        <Field label="Email Address">
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input type="email" style={{ ...inputStyle, paddingLeft: 34 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="group@example.com" />
          </div>
        </Field>
        <Field label="Website (optional)">
          <div style={{ position: 'relative' }}>
            <Globe size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" />
          </div>
        </Field>
      </Card>

      <SaveBtn onClick={save} saved={saved} loading={loading} />
    </>
  );
};

// ── Contribution Settings ────────────────────────────────────────────────────
const ContributionSettings = ({ groupId }) => {
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [amount, setAmount]     = useState('');
  const [cycle, setCycle]       = useState('monthly');
  const [dueDay, setDueDay]     = useState('15');
  const [graceDays, setGrace]   = useState('3');
  const [currency, setCurrency] = useState('UGX');

  useEffect(() => {
    if (!groupId) return;
    supabase.from('groups').select('contribution_amount,currency,cycle_frequency,due_day,grace_days').eq('id', groupId).single().then(({ data }) => {
      if (!data) return;
      setAmount(data.contribution_amount?.toString() || '');
      setCurrency(data.currency || 'UGX');
      setCycle(data.cycle_frequency || 'monthly');
      setDueDay(data.due_day?.toString() || '15');
      setGrace(data.grace_days?.toString() || '3');
    });
  }, [groupId]);

  const save = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      await supabase.from('groups').update({
        contribution_amount: Number(amount),
        currency,
        cycle_frequency: cycle,
        due_day: Number(dueDay),
        grace_days: Number(graceDays),
      }).eq('id', groupId);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <>
      <SectionHeader title="Contribution Rules" subtitle="These rules apply to all members. Changes take effect from the next cycle." />
      <Card>
        <Field label="Contribution Currency">
          <select style={selectStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="UGX">UGX — Ugandan Shilling</option>
            <option value="KES">KES — Kenyan Shilling</option>
            <option value="TZS">TZS — Tanzanian Shilling</option>
            <option value="USD">USD — US Dollar</option>
          </select>
        </Field>
        <Field label="Contribution Amount per Member">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 13, fontFamily: 'IBM Plex Mono', fontWeight: 600 }}>{currency}</span>
            <input type="number" style={{ ...inputStyle, paddingLeft: 52, fontFamily: 'IBM Plex Mono' }} value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        </Field>
        <Field label="Cycle Frequency">
          <select style={selectStyle} value={cycle} onChange={e => setCycle(e.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </Field>
        <Field label="Due Day of Cycle">
          <input type="number" min="1" max="31" style={inputStyle} value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="e.g. 15 = 15th of every month" />
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>Members must pay by this day each cycle to remain PAID.</p>
        </Field>
        <Field label="Grace Period (days)">
          <input type="number" min="0" max="14" style={inputStyle} value={graceDays} onChange={e => setGrace(e.target.value)} />
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>Days after the due date before a member is marked OVERDUE.</p>
        </Field>
      </Card>
      <SaveBtn onClick={save} saved={saved} loading={loading} />
    </>
  );
};

// ── Fines Settings ────────────────────────────────────────────────────────────
const FinesSettings = () => {
  const [saved, setSaved]           = useState(false);
  const [autoFine, setAutoFine]     = useState(true);
  const [fineAmount, setFineAmount] = useState('5000');
  const [fineMax, setFineMax]       = useState('3');
  const [lateInterest, setLateInt]  = useState('5');
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <>
      <SectionHeader title="Fines and Penalty Rules" subtitle="Define how the group handles overdue contributions and late loan repayments." />
      <Card>
        <Toggle value={autoFine} onChange={setAutoFine} label="Automatic fines" sub="Apply a fine automatically when a member is marked OVERDUE" />
        <div style={{ paddingTop: 8 }} />
        <Field label="Fine Amount (UGX) per Overdue Cycle">
          <input type="number" style={{ ...inputStyle, fontFamily: 'IBM Plex Mono' }} value={fineAmount} onChange={e => setFineAmount(e.target.value)} disabled={!autoFine} />
        </Field>
        <Field label="Maximum Fine Cycles">
          <input type="number" min="1" style={inputStyle} value={fineMax} onChange={e => setFineMax(e.target.value)} disabled={!autoFine} />
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>Stop accumulating fines after this many cycles.</p>
        </Field>
      </Card>
      <Card>
        <SectionHeader title="Loan Late Payment Interest" subtitle="Applied per overdue instalment on loans." />
        <Field label="Late Payment Interest Rate (%)">
          <input type="number" min="0" max="100" style={inputStyle} value={lateInterest} onChange={e => setLateInt(e.target.value)} />
        </Field>
      </Card>
      <SaveBtn onClick={save} saved={saved} />
    </>
  );
};

// ── Members Settings (uses real Supabase data) ────────────────────────────────
const MembersSettings = ({ groupId }) => {
  const [email, setEmail]   = useState('');
  const [members, setMembers] = useState([]);
  const [roles, setRoles]   = useState({});
  const [saving, setSaving] = useState({});
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    if (!groupId) return;
    supabase
      .from('group_members')
      .select('*, users(first_name, last_name, email, avatar_url)')
      .eq('group_id', groupId)
      .then(({ data }) => {
        if (!data) return;
        setMembers(data);
        const r = {};
        data.forEach(m => { r[m.id] = m.role; });
        setRoles(r);
      });
  }, [groupId]);

  const handleRoleChange = async (memberId, newRole) => {
    setRoles(prev => ({ ...prev, [memberId]: newRole }));
    setSaving(prev => ({ ...prev, [memberId]: true }));
    await supabase.from('group_members').update({ role: newRole }).eq('id', memberId);
    setSaving(prev => ({ ...prev, [memberId]: false }));
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member from the group?')) return;
    setRemoving(prev => ({ ...prev, [memberId]: true }));
    await supabase.from('group_members').delete().eq('id', memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  return (
    <>
      <SectionHeader title="Manage Members" subtitle="Invite new members or change roles within the group." />

      <Card>
        <SectionHeader title="Invite a Member" />
        <Field label="Email or Phone Number">
          <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. +256 700 000000" />
        </Field>
        <button style={{
          background: 'var(--green)', color: '#08251d', border: 'none', borderRadius: 12,
          padding: '12px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <UserPlus size={16} /> Send Invite
        </button>
      </Card>

      <Card>
        <SectionHeader title="Current Members" subtitle={`${members.length} members`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {members.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No members found.</div>
          ) : members.map((m, i) => {
            const uName = `${m.users?.first_name || ''} ${m.users?.last_name || ''}`.trim() || m.users?.email || 'Unknown';
            const inits = `${m.users?.first_name?.[0] || ''}${m.users?.last_name?.[0] || ''}`.toUpperCase() || '?';
            const currentRole = roles[m.id] || m.role;
            const isLeader = currentRole === 'Chairperson' || currentRole === 'Treasurer';
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < members.length - 1 ? '1px solid var(--line)' : 'none' }}>
                {m.users?.avatar_url
                  ? <img src={m.users.avatar_url} alt={inits} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div className="avatar" style={{ background: isLeader ? 'var(--green)' : 'var(--surface-2)', width: 36, height: 36, fontSize: 12 }}>{inits}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uName}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{currentRole}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <select
                    value={currentRole}
                    onChange={e => handleRoleChange(m.id, e.target.value)}
                    disabled={saving[m.id]}
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}
                  >
                    <option value="Member">Member</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Chairperson">Chairperson</option>
                  </select>
                  {!isLeader && (
                    <button
                      onClick={() => handleRemove(m.id)}
                      disabled={removing[m.id]}
                      style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
};

// ── Notifications Settings ───────────────────────────────────────────────────
const NotificationsSettings = () => {
  const [saved, setSaved]           = useState(false);
  const [proofAlert, setProof]      = useState(true);
  const [paymentAlert, setPayment]  = useState(true);
  const [loanAlert, setLoan]        = useState(true);
  const [overdueAlert, setOverdue]  = useState(true);
  const [weeklyDigest, setDigest]   = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <>
      <SectionHeader title="Notification Preferences" subtitle="Choose which events trigger alerts for your role." />
      <Card>
        <Toggle value={proofAlert}   onChange={setProof}   label="Payment proof uploaded"    sub="When a member submits a payment slip" />
        <Toggle value={paymentAlert} onChange={setPayment} label="Payment verified"          sub="When the treasurer confirms a contribution" />
        <Toggle value={loanAlert}    onChange={setLoan}    label="Loan request submitted"    sub="When a member requests a loan" />
        <Toggle value={overdueAlert} onChange={setOverdue} label="Member marked overdue"     sub="When a contribution deadline is missed" />
        <div style={{ borderBottom: 'none' }}>
          <Toggle value={weeklyDigest} onChange={setDigest}  label="Weekly digest"             sub="A summary of group activity every Monday" />
        </div>
      </Card>
      <SaveBtn onClick={save} saved={saved} />
    </>
  );
};

// ── tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'personal',      icon: User,       label: 'My Profile' },
  { id: 'profile',       icon: Users,      label: 'Group Profile' },
  { id: 'contributions', icon: DollarSign, label: 'Contributions' },
  { id: 'fines',         icon: Shield,     label: 'Fines & Rules' },
  { id: 'members',       icon: UserPlus,   label: 'Members' },
  { id: 'notifications', icon: Bell,       label: 'Notifications' },
];

// ── main view ─────────────────────────────────────────────────────────────────
export const SettingsView = ({ role }) => {
  const { groupData, userData } = useApp();
  const [adminGroups, setAdminGroups]   = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // For admin: load all groups
  useEffect(() => {
    if (role !== 'Admin') return;
    supabase.from('groups').select('id, name').order('name').then(({ data }) => {
      if (data && data.length > 0) {
        setAdminGroups(data);
        setSelectedGroupId(data[0].id);
      }
    });
  }, [role]);

  // Effective group id: admin picks, others use their own group
  const effectiveGroupId = role === 'Admin' ? selectedGroupId : groupData?.id || null;

  const getTabsForRole = () => {
    switch (role) {
      case 'Admin':        return TABS;
      case 'Chairperson':  return TABS.filter(t => ['personal', 'profile', 'fines', 'members', 'notifications'].includes(t.id));
      case 'Treasurer':    return TABS.filter(t => ['personal', 'contributions', 'notifications'].includes(t.id));
      case 'Member':
      default:             return TABS.filter(t => ['personal', 'notifications'].includes(t.id));
    }
  };

  const visibleTabs = getTabsForRole();
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || 'notifications');

  const renderTab = () => {
    switch (activeTab) {
      case 'personal':      return <UserProfile />;
      case 'contributions': return <ContributionSettings groupId={effectiveGroupId} />;
      case 'fines':         return <FinesSettings />;
      case 'members':       return <MembersSettings groupId={effectiveGroupId} />;
      case 'notifications': return <NotificationsSettings />;
      default:              return <ProfileSettings groupId={effectiveGroupId} />;
    }
  };

  return (
    <>
      <div className="greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="hello">{role === 'Admin' ? 'Platform administration' : 'Group administration'}</p>
          <p className="name">Settings</p>
        </div>

        {role === 'Admin' && adminGroups.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <select
              value={selectedGroupId || ''}
              onChange={e => setSelectedGroupId(e.target.value)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 10, padding: '8px 12px', fontSize: 13,
                fontWeight: 600, color: 'var(--text)', cursor: 'pointer', outline: 'none',
              }}
            >
              {adminGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 0, flexDirection: 'column' }}>
        <div style={{
          display: 'flex', gap: 0, overflowX: 'auto', borderBottom: '1px solid var(--line)',
          scrollbarWidth: 'none', padding: '0 20px', marginBottom: 0,
        }}>
          {visibleTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 16px 14px', whiteSpace: 'nowrap',
                fontSize: 13.5, fontWeight: 600,
                color: activeTab === t.id ? 'var(--text)' : 'var(--text-faint)',
                borderBottom: `2px solid ${activeTab === t.id ? 'var(--green)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        <div className="section" style={{ paddingTop: 24 }}>
          {renderTab()}
        </div>
      </div>
    </>
  );
};
