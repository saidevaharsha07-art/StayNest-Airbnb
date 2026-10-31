import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, User, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const redirectUrl = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('guest'); // 'guest' | 'host'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      showToast('Welcome to StayNest! Your account has been created.', 'success');
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          Create your StayNest account
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-brand-600 hover:text-brand-500 underline"
          >
            Log in instead
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
                Full Name
              </label>
              <div className="flex items-center border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <User className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Varma"
                  className="w-full text-sm font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  className="w-full text-sm font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Confirm Password
              </label>
              <div className="flex items-center border border-neutral-300 rounded-2xl p-3 focus-within:border-neutral-900">
                <Lock className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full text-sm font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Account Intended Role */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                I primarily want to
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('guest')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'guest'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  Book Stays (Guest)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'host'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  List Stays (Host)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Agree and Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
