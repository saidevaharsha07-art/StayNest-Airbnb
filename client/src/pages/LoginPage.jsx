import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      showToast('Welcome back to StayNest!', 'success');
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Quick-Fill Handlers
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    try {
      setLoading(true);
      setError(null);
      setEmail(demoEmail);
      setPassword(demoPassword);
      await login(demoEmail, demoPassword);
      showToast(`Logged in successfully as ${demoEmail}`, 'success');
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Please ensure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:bg-brand-600 transition-colors">
            <Compass className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-brand-500">StayNest</span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-neutral-900 tracking-tight">
          Log in to your account
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Or{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-brand-600 hover:text-brand-500 underline"
          >
            create a new account for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-neutral-200/80 rounded-3xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs font-semibold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <Mail className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Password
              </label>
              <div className="flex items-center border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <Lock className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Instant Capstone Demo Access</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('host@staynest.com', 'password123')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-neutral-50 hover:bg-white text-xs font-bold text-neutral-800 transition-all text-center"
              >
                Demo Host
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('guest@staynest.com', 'password123')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-neutral-50 hover:bg-white text-xs font-bold text-neutral-800 transition-all text-center"
              >
                Demo Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
