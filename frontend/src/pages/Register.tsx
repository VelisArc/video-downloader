import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import LoadingIndicator from '../components/LoadingIndicator';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to register: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4 py-8">
      <Helmet>
        <title>Register - SwiftDL</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://swiftdownlod.online/register" />
      </Helmet>
      <div className="w-full max-w-xs card p-5">
        <h2 className="text-base font-bold text-center mb-4" style={{ color: 'var(--ink-900)' }}>Register for SwiftDL</h2>
        <form onSubmit={handleRegister} className="space-y-3">
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
          <div>
            <label className="block text-[11px] mb-1" style={{ color: 'var(--ink-600)' }}>Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full"
          >
            {loading ? <LoadingIndicator label="Creating account..." compact tone="light" /> : 'Register'}
          </button>
        </form>
        <div className="mt-3 text-center text-[11px]" style={{ color: 'var(--ink-500)' }}>
          Already have an account? <Link to="/login" className="hover:underline" style={{ color: 'var(--brand-700)' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
