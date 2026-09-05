import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  BadgeCheck,
  Building2
} from 'lucide-react';

export const Login: React.FC = () => {
  const { user, userProfile, loginWithGoogle, loginWithEmail, signUpWithEmail, resetPassword } = useAuth();
  
  const [viewMode, setViewMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated and active, redirect to home
  if (user && userProfile && userProfile.status === 'active') {
    return <Navigate to="/" replace />;
  }

  // Friendly error message mapper (Requirement 12)
  const getFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    console.error('Firebase Auth Error:', error);

    switch (code) {
      case 'auth/unauthorized-domain':
        return 'Authentication is not available from this domain. Please contact the administrator.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is currently disabled. Please contact the administrator.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/user-not-found':
        return 'No account was found with this email address.';
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password does not meet the required security requirements.';
      case 'auth/popup-blocked':
        return 'Your browser blocked the Google sign-in window. Please allow pop-ups and try again.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled before completing.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact the administrator.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful sign-in attempts. Please try again later.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return `Unable to sign in. Please try again. ${code ? `(Code: ${code})` : ''}`;
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim() || !password || !displayName.trim()) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(email, password, displayName, employeeId);
      setSuccessMessage('Account created successfully! Your account is pending administrator approval.');
      setViewMode('signin');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address to receive a password reset link.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent! Check your inbox for instructions.');
      setViewMode('signin');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-900">
      {/* Brand Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 relative">
        
        {/* Header (Requirement 2) */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            ENERPACK
          </h1>
          <p className="text-xs font-semibold text-slate-500 tracking-wide mt-0.5">
            Human Resource Management System
          </p>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-700 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* SIGN IN VIEW */}
        {viewMode === 'signin' && (
          <div className="space-y-4">
            {/* Primary Google Auth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:border-slate-400 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Visual Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                or with email
              </span>
              <div className="border-t border-slate-200 w-full"></div>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enerpack.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setErrorMessage('');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-button"
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs shadow-blue-300 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                {submitting ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            {/* Switch to Create Account */}
            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don't have an Enerpack account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('signup');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer ml-1"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* CREATE ACCOUNT VIEW */}
        {viewMode === 'signup' && (
          <form onSubmit={handleEmailSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enerpack.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Employee ID <span className="text-[10px] font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. ENP-EMP-00125"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 leading-snug">
              Newly created accounts require administrator approval before accessing protected Enerpack HR modules.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs shadow-blue-300 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              {submitting ? 'Creating Account...' : 'Register Account'}
            </button>

            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setViewMode('signin');
                  setErrorMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your registered Enerpack email address to receive a password reset link.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enerpack.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs shadow-blue-300 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 min-h-[44px]"
            >
              {submitting ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setViewMode('signin');
                  setErrorMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Security note */}
      <div className="mt-6 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
        <BadgeCheck className="w-4 h-4 text-emerald-600" />
        <span>Secured with Firebase Enterprise Authentication & AES-256</span>
      </div>
    </div>
  );
};
