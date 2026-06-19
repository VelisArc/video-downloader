import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import LoadingIndicator from '../components/LoadingIndicator';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
      <Helmet>
        <title>Login - SwiftDL</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://swiftdownlod.online/login" />
      </Helmet>
      <div className="w-full max-w-xs card p-5">
        <h2 className="text-base font-bold text-center mb-4" style={{ color: 'var(--ink-900)' }}>Login to SwiftDL</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] mb-1" style={{ color: 'var(--ink-600)' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[11px] mb-1" style={{ color: 'var(--ink-600)' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full"
          >
            {loading ? <LoadingIndicator label="Logging in..." compact tone="light" /> : 'Login'}
          </button>
        </form>
        <div className="mt-3 text-center text-[11px]" style={{ color: 'var(--ink-500)' }}>
          Don't have an account? <Link to="/register" className="hover:underline" style={{ color: 'var(--brand-700)' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
