'use client';
import { useState } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import { ICONS } from '@/lib/icons';
import Logo from '@/components/Logo';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Login failed.');
      window.location.href = '/admin';
    } catch (e) {
      setErr(e.message); setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="card" onSubmit={submit}>
        <div className="brandrow"><Logo /></div>
        <h1 className="q">Admin login</h1>
        <p className="sub">Sign in to manage your store.</p>
        {err && <div className="err">{err}</div>}
        <label>Email
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label>Password
          <span className="pw">
            <input type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        <button className="go" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link className="back" href="/">← Back to store</Link>
      </form>
    </div>
  );
}
