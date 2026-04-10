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
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Helmet>
        <title>Register - SwiftDL</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://swiftdownlod.online/register" />
      </Helmet>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-center mb-5 text-gray-900">Register for SwiftDL</h2>
        <form onSubmit={handleRegister} className="space-y-4">
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
          <div>
            <label className="block text-gray-600 text-xs mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-pink-500 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
          >
            {loading ? <LoadingIndicator label="Creating account..." compact tone="light" /> : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-gray-500">
          Already have an account? <Link to="/login" className="text-pink-500 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
