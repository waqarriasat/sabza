'use client';
import { useState } from 'react';

export default function AccountSettings({ email, onEmail, storage, notify }) {
  const [f, setF] = useState({ current: '', email, password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (f.password && f.password !== f.confirm) return setErr('New passwords do not match.');
    const emailChanged = f.email.trim().toLowerCase() !== email.toLowerCase();
    if (!f.password && !emailChanged) return setErr('Nothing to change.');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: f.current, email: emailChanged ? f.email : '', password: f.password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Could not update.');
      onEmail(j.email);
      setF({ current: '', email: j.email, password: '', confirm: '' });
      notify('Login details updated. Other devices have been signed out.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings-grid">
      <form className="pnl" onSubmit={submit}>
        <div className="ph"><h3>Login &amp; password</h3></div>
        <p className="hint">Change the email or password used to sign in to this admin panel. You must enter your current password.</p>
        {err && <div className="err">{err}</div>}
        <div className="mrow"><div className="field"><label>Login email</label><input type="email" required autoComplete="username" value={f.email} onChange={set('email')} /></div></div>
        <div className="mrow two">
          <div className="field"><label>New password</label><input type="password" autoComplete="new-password" minLength={8} value={f.password} onChange={set('password')} placeholder="At least 8 characters" /></div>
          <div className="field"><label>Confirm new password</label><input type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></div>
        </div>
        <div className="mrow"><div className="field"><label>Current password</label><input type="password" required autoComplete="current-password" value={f.current} onChange={set('current')} /></div></div>
        <button className="btn btn-pri" disabled={busy}>{busy ? 'Updating…' : 'Update login details'}</button>
      </form>

      <div className="pnl">
        <div className="ph"><h3>Data storage</h3></div>
        {storage.persistent ? (
          <p className="hint ok">Connected — changes are saved permanently ({storage.backend === 'redis' ? 'Redis database' : 'server file'}).</p>
        ) : (
          <p className="hint bad">
            Not connected to a database. On Vercel, changes to payment methods and your password can be lost after a
            redeploy. Connect <b>Upstash for Redis</b> (free) from the Vercel dashboard → Storage, then redeploy.
          </p>
        )}
      </div>
    </div>
  );
}
