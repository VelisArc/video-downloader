import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import LoadingIndicator from '../components/LoadingIndicator';
import { siteUrl } from '../lib/site';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error('Enter email and password');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Logged in');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') toast.error('No account found with this email');
      else if (err.code === 'auth/wrong-password') toast.error('Incorrect password');
      else if (err.code === 'auth/invalid-credential') toast.error('Invalid email or password');
      else toast.error('Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="shell" style={{ maxWidth: 400, padding: '4rem 1rem' }}>
      <Helmet><meta name="robots" content="noindex, nofollow" /><title>Login | SwiftDL</title></Helmet>
      <div className="card" style={{ padding: '2rem' }}>
        <div className="mx-auto w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}><LogIn size={20} /></div>
        <h1 className="mt-4 text-center text-xl font-bold" style={{ color: 'var(--ink-900)' }}>Sign in</h1>
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
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
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <LoadingIndicator label="Signing in..." compact tone="light" /> : 'Sign in'}</button>
        </form>
        <p className="mt-4 text-center text-xs" style={{ color: 'var(--ink-600)' }}>No account? <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--brand-600)' }}>Create one</Link></p>
      </div>
    </div>
  );
}