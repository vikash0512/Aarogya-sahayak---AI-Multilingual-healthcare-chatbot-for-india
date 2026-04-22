import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hospital, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

export default function SignUp() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;
      if (data.session) {
        navigate('/dashboard');
      } else {
        setVerificationEmail(email);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-background-dark font-display">
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Creating your account</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please wait while we set things up securely.</p>
          </div>
        </div>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
            <Hospital className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Join Arogya Sahayak to get personalized health guidance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200/20 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800">
          {verificationEmail ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Verification link sent</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We sent a confirmation email to <span className="font-semibold text-slate-900 dark:text-white">{verificationEmail}</span>. Click the link in your inbox to activate your account, then sign in here.
              </p>
              <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 p-4 text-left">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Next step</p>
                <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-400">Open the verification email, tap the link, then return to the login page.</p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors">
                  Go to login
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setVerificationEmail('')}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Back to form
                </button>
              </div>
            </div>
          ) : (
          <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input id="name" name="name" type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                  placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input id="email" name="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                  placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input id="password" name="password" type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                  placeholder="••••••••" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Sign in
            </Link>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
