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
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Helmet>
        <title>Login - SwiftDL</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://swiftdownlod.online/login" />
      </Helmet>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-center mb-5 text-gray-900">Login to SwiftDL</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-xs mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-xs mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-pink-500 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
          >
            {loading ? <LoadingIndicator label="Logging in..." compact tone="light" /> : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-gray-500">
          Don't have an account? <Link to="/register" className="text-pink-500 hover:underline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
