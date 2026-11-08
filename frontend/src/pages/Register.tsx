import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Zap, ArrowRight, Star, Gauge } from 'lucide-react';
import toast from 'react-hot-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import LoadingIndicator from '../components/LoadingIndicator';

function BrandMark({ size = 46, id = 'bm' }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className="shrink-0 text-white drop-shadow-lg">
      <defs>
        <linearGradient id={`${id}-grad`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-500)" />
          <stop offset="0.5" stopColor="var(--magenta-500)" />
          <stop offset="1" stopColor="var(--rose-500)" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${id}-grad)`} />
      <path d="M19.5 17.2v13.6c0 1.5 1.65 2.4 2.9 1.56l10.4-6.8a1.87 1.87 0 0 0 0-3.12l-10.4-6.8a1.87 1.87 0 0 0-2.9 1.56Z" fill="currentColor" fillOpacity="0.96" />
      <circle cx="36.5" cy="11.5" r="3.4" fill="currentColor" fillOpacity="0.85" />
    </svg>
  );
}

const inputClass =
  'w-full min-h-12 rounded-xl border px-4 py-3 pl-11 text-base outline-none transition-all placeholder:text-[var(--ink-400)]';

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

  const focusRing = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--border-strong)';
    e.target.style.boxShadow = '0 0 0 4px var(--brand-100)';
  };
  const blurRing = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="shell py-5 sm:py-10 lg:py-14">
      <Helmet><meta name="robots" content="noindex, nofollow" /><title>Register | ShareHub</title></Helmet>

      <div className="mx-auto grid max-w-5xl items-stretch gap-5 lg:grid-cols-[1.05fr_1fr] lg:gap-7">
        {/* Brand panel — desktop */}
        <aside className="hero-canvas relative hidden flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-8 lg:flex xl:p-10">
          <div className="aurora-orb aurora-orb--one" />
          <div className="aurora-orb aurora-orb--two" />
          <div className="aurora-orb aurora-orb--three" />

          <div className="relative z-10 flex items-center gap-3">
            <BrandMark size={44} id="register-panel" />
            <div>
              <p className="font-['Sora',sans-serif] text-lg font-bold leading-none text-white">ShareHub</p>
              <p className="mono mt-1.5 text-[9px] font-semibold uppercase text-white/50" style={{ letterSpacing: '0.18em' }}>Video · Audio · Hub</p>
            </div>
          </div>

          <div className="relative z-10 py-10">
            <span className="eyebrow" style={{ color: 'var(--brand-300)' }}>Free forever</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] text-white xl:text-5xl">
              Join 12,000+<br />
              <span className="gradient-text">download power users.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
              One free account triples your daily fair-use limit and unlocks premium upgrades whenever you need them.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                { icon: Gauge, text: '3 downloads per day, free — every account' },
                { icon: Zap, text: 'Video & audio in original quality' },
                { icon: ShieldCheck, text: 'No card required. Cancel premium anytime' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm font-medium text-white/80">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5" style={{ color: 'var(--brand-300)' }}>
                    <Icon size={17} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Social proof */}
          <div className="glass-panel relative z-10 flex items-center gap-4 rounded-2xl px-5 py-4">
            <div className="flex -space-x-2.5">
              {['AR', 'KM', 'JS', 'RD', '+'].map((ini, i) => (
                <div key={i} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/15 text-[10px] font-bold text-white" style={{ background: i % 2 === 0 ? 'var(--brand-600)' : 'var(--magenta-500)' }}>
                  {ini}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map(i => <Star key={i} size={12} fill="currentColor" style={{ color: 'var(--warning-500)' }} />)}
                <span className="mono ml-1.5 text-[10px] font-semibold text-white/70">4.9/5</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-white/55">“Set up in under a minute.” — top review</p>
            </div>
          </div>
        </aside>

        {/* Form card */}
        <div className="card flex flex-col justify-center !p-6 sm:!p-10">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandMark size={40} id="register-mobile" />
            <span className="font-['Sora',sans-serif] text-base font-bold" style={{ color: 'var(--ink-900)' }}>ShareHub</span>
          </div>

          <div className="mt-6 lg:mt-0">
            <span className="eyebrow">Get started</span>
            <h2 className="section-heading !mt-3 text-2xl sm:text-3xl" style={{ color: 'var(--ink-900)' }}>Create your <span className="gradient-text">free account</span></h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-600)' }}>Three downloads a day, on us. Upgrade anytime.</p>
          </div>

          <form onSubmit={handleRegister} className="mt-6 space-y-4 sm:mt-7">
            <div>
              <label htmlFor="register-email" className="mono text-[10px] font-semibold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--ink-600)' }}>Email</label>
              <div className="relative mt-1.5">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-400)' }} />
                <input id="register-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)' }} onFocus={focusRing} onBlur={blurRing} />
              </div>
            </div>
            <div>
              <label htmlFor="register-password" className="mono text-[10px] font-semibold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--ink-600)' }}>Password</label>
              <div className="relative mt-1.5">
                <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-400)' }} />
                <input id="register-password" type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className={`${inputClass} pr-14`} style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)' }} onFocus={focusRing} onBlur={blurRing} />
                <button type="button" onClick={() => setShow(v => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border-0 bg-transparent transition-colors hover:bg-[var(--surface-soft)]" style={{ color: 'var(--ink-400)' }}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="register-confirm" className="mono text-[10px] font-semibold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--ink-600)' }}>Confirm password</label>
              <div className="relative mt-1.5">
                <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-400)' }} />
                <input id="register-confirm" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" className={inputClass} style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink-900)' }} onFocus={focusRing} onBlur={blurRing} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary min-h-12 w-full text-base">
              {loading ? <LoadingIndicator label="Creating account..." compact tone="light" /> : <>Create account <ArrowRight size={17} /></>}
            </button>
            <p className="text-center text-[11px] leading-5" style={{ color: 'var(--ink-500)' }}>By creating an account you agree to our fair-use policy. No spam, ever.</p>
          </form>

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="mono text-[9px] font-semibold uppercase" style={{ letterSpacing: '0.18em', color: 'var(--ink-400)' }}>or</span>
            <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--ink-600)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold transition-colors hover:underline" style={{ color: 'var(--brand-700)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
