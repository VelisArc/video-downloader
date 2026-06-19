import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import LoadingIndicator from '../components/LoadingIndicator';
import { siteUrl } from '../lib/site';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Account created');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') toast.error('Email already in use');
      else toast.error('Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="shell" style={{ maxWidth: 400, padding: '4rem 1rem' }}>
      <Helmet><meta name="robots" content="noindex, nofollow" /><title>Register | SwiftDL</title></Helmet>
      <div className="card" style={{ padding: '2rem' }}>
        <div className="mx-auto w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><UserPlus size={20} /></div>
        <h1 className="mt-4 text-center text-xl font-bold" style={{ color: 'var(--ink-900)' }}>Create account</h1>
        <form onSubmit={handleRegister} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium" style={{ color: 'var(--ink-700)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm mt-1 outline-none transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)' }} onFocus={e => e.target.style.borderColor = 'var(--border-strong)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: 'var(--ink-700)' }}>Password</label>
            <div className="relative mt-1">
              <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm pr-9 outline-none transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)' }} onFocus={e => e.target.style.borderColor = 'var(--border-strong)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <button type="button" onClick={() => setShow(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 border-0 bg-transparent cursor-pointer" style={{ color: 'var(--ink-400)' }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: 'var(--ink-700)' }}>Confirm password</label>
            <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm mt-1 outline-none transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)' }} onFocus={e => e.target.style.borderColor = 'var(--border-strong)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <LoadingIndicator label="Creating account..." compact tone="light" /> : 'Create account'}</button>
        </form>
        <p className="mt-4 text-center text-xs" style={{ color: 'var(--ink-600)' }}>Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--brand-600)' }}>Sign in</Link></p>
      </div>
    </div>
  );
}