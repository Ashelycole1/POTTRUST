import React, { useState, useRef } from 'react';
import {
  Camera, Save, Users, DollarSign, Bell, Shield,
  MapPin, Phone, Mail, Globe, ChevronRight, Trash2, UserPlus, Settings
} from 'lucide-react';

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

const selectStyle = {
  ...inputStyle,
  appearance: 'none', cursor: 'pointer',
};

const SaveBtn = ({ onClick, saved }) => (
  <button
    onClick={onClick}
    style={{
      marginTop: 8,
      background: saved ? 'var(--green-deep)' : 'var(--green)',
      color: saved ? 'var(--green)' : '#08251d',
      border: 'none', borderRadius: 12, padding: '13px 24px',
      fontWeight: 700, fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
      transition: 'all 0.2s',
    }}
  >
    <Save size={16} />
    {saved ? 'Saved' : 'Save changes'}
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

// ── tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       icon: Users,      label: 'Group Profile' },
  { id: 'contributions', icon: DollarSign, label: 'Contributions' },
  { id: 'fines',         icon: Shield,     label: 'Fines & Rules' },
  { id: 'members',       icon: UserPlus,   label: 'Members' },
  { id: 'notifications', icon: Bell,       label: 'Notifications' },
];

// ── sections ──────────────────────────────────────────────────────────────────
const ProfileSettings = ({ groupName }) => {
  const [saved, setSaved]         = useState(false);
  const [name, setName]           = useState(groupName || 'Katonga Traders SACCO');
  const [description, setDesc]    = useState('A registered savings and credit cooperative serving market traders.');
  
  React.useEffect(() => {
    if (groupName) setName(groupName);
  }, [groupName]);
  const [location, setLocation]   = useState('Katonga Road, Kampala');
  const [phone, setPhone]         = useState('+256 700 123456');
  const [email, setEmail]         = useState('katonga.sacco@gmail.com');
  const [website, setWebsite]     = useState('');
  const [logo, setLogo]           = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [banner, setBanner]           = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const logoRef   = useRef();
  const bannerRef = useRef();

  const handleLogo = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLogo(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const handleBanner = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBanner(f);
    setBannerPreview(URL.createObjectURL(f));
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <SectionHeader title="Group Profile" subtitle="This information is visible to all group members." />

      {/* Logo + Banner */}
      <Card>
        <Field label="Group Logo">
          <input type="file" accept="image/*" ref={logoRef} onChange={handleLogo} style={{ display: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => logoRef.current.click()}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: logoPreview ? 'transparent' : 'var(--green-deep)',
                border: '2px solid var(--line)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}
            >
              {logoPreview
                ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: 'var(--green)' }}>K</span>}
            </div>
            <div>
              <button
                onClick={() => logoRef.current.click()}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
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
                <button
                  onClick={() => bannerRef.current.click()}
                  style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Camera size={12} /> Change
                </button>
              </div>
            )
            : (
              <button
                onClick={() => bannerRef.current.click()}
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px dashed var(--line)', borderRadius: 12, padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-faint)', cursor: 'pointer' }}
              >
                <Camera size={22} />
                <span style={{ fontSize: 13 }}>Upload a banner image</span>
                <span style={{ fontSize: 11.5 }}>Recommended: 1200 × 400 px</span>
              </button>
            )}
        </Field>
      </Card>

      {/* Basic info */}
      <Card>
        <Field label="Group Name">
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="Description">
          <textarea style={{ ...inputStyle, resize: 'none', height: 90, lineHeight: 1.5 }} value={description} onChange={e => setDesc(e.target.value)} />
        </Field>
      </Card>

      {/* Contact info */}
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
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </Field>
        <Field label="Email Address">
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input type="email" style={{ ...inputStyle, paddingLeft: 34 }} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </Field>
        <Field label="Website (optional)">
          <div style={{ position: 'relative' }}>
            <Globe size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" />
          </div>
        </Field>
      </Card>

      <SaveBtn onClick={save} saved={saved} />
    </>
  );
};

const ContributionSettings = () => {
  const [saved, setSaved]       = useState(false);
  const [amount, setAmount]     = useState('200000');
  const [cycle, setCycle]       = useState('monthly');
  const [dueDay, setDueDay]     = useState('15');
  const [graceDays, setGrace]   = useState('3');
  const [currency, setCurrency] = useState('UGX');

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

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
      <SaveBtn onClick={save} saved={saved} />
    </>
  );
};

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

const MembersSettings = () => {
  const [email, setEmail] = useState('');
  const [members] = useState([
    { name: 'Rwothomio Evans',     role: 'Chairperson', initials: 'RE', color: 'var(--green)' },
    { name: 'Alimpa A. Hillary',   role: 'Treasurer',   initials: 'AH', color: 'var(--green)' },
    { name: 'Niwasiima A.',        role: 'Member',      initials: 'NA', color: 'var(--green)' },
    { name: 'Egabo Aaron',         role: 'Member',      initials: 'EA', color: 'var(--green)' },
    { name: 'Onyango J. Steven',   role: 'Member',      initials: 'OJ', color: 'var(--gold)' },
    { name: 'Ssenyonjo K.',        role: 'Member',      initials: 'SK', color: 'var(--coral)' },
  ]);

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
          {members.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < members.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div className="avatar" style={{ background: m.color, width: 36, height: 36, fontSize: 12 }}>{m.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{m.role}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  defaultValue={m.role}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}
                >
                  <option>Member</option>
                  <option>Treasurer</option>
                  <option>Chairperson</option>
                </select>
                {m.role === 'Member' && (
                  <button style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

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

// ── main view ─────────────────────────────────────────────────────────────────
export const SettingsView = ({ role }) => {
  const ADMIN_GROUPS = [
    'Katonga Traders SACCO',
    'Bwaise Women\'s Group',
    'Kisekka Mechanics'
  ];
  const [selectedGroup, setSelectedGroup] = useState(ADMIN_GROUPS[0]);

  const getTabsForRole = () => {
    switch (role) {
      case 'Admin':
        return TABS;
      case 'Chairperson':
        return TABS.filter(t => ['profile', 'fines', 'members', 'notifications'].includes(t.id));
      case 'Treasurer':
        return TABS.filter(t => ['contributions', 'notifications'].includes(t.id));
      case 'Member':
      default:
        return TABS.filter(t => ['notifications'].includes(t.id));
    }
  };

  const visibleTabs = getTabsForRole();
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || 'notifications');

  const renderTab = () => {
    switch (activeTab) {
      case 'contributions': return <ContributionSettings />;
      case 'fines':         return <FinesSettings />;
      case 'members':       return <MembersSettings />;
      case 'notifications': return <NotificationsSettings />;
      default:              return <ProfileSettings groupName={role === 'Admin' ? selectedGroup : 'Katonga Traders SACCO'} />;
    }
  };

  return (
    <>
      <div className="greeting" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="hello">{role === 'Admin' ? 'Platform administration' : 'Group administration'}</p>
          <p className="name">Settings</p>
        </div>
        
        {role === 'Admin' && (
          <div style={{ marginTop: 10 }}>
             <select 
                value={selectedGroup} 
                onChange={(e) => setSelectedGroup(e.target.value)}
                style={{ 
                  background: 'var(--surface)', border: '1px solid var(--line)', 
                  borderRadius: 10, padding: '8px 12px', fontSize: 13, 
                  fontWeight: 600, color: 'var(--text)', cursor: 'pointer', outline: 'none'
                }}
             >
                {ADMIN_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
             </select>
          </div>
        )}
      </div>

      {/* Vertical tab list on desktop, horizontal scroll on mobile */}
      <div style={{ display: 'flex', gap: 0, flexDirection: 'column' }}>

        {/* Tab strip */}
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

        {/* Tab content */}
        <div className="section" style={{ paddingTop: 24 }}>
          {renderTab()}
        </div>
      </div>
    </>
  );
};
