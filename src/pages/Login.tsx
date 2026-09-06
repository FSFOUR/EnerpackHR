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
  Building2,
  Copy,
  Check
} from 'lucide-react';

export const Login: React.FC = () => {
  const { user, userProfile, loading, loginWithGoogle, loginWithEmail, signUpWithEmail, resetPassword } = useAuth();
  
  const [viewMode, setViewMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorDetails, setErrorDetails] = useState<{ text: string; isDomainError: boolean; code: string } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Loading state while auth session is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Verifying session...</span>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to home / app
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Comprehensive Firebase error message mapper conforming to Tasks 5 & 8
  const getFriendlyErrorMessage = (error: any): { text: string; isDomainError: boolean; code: string } => {
    const code = error?.code || '';
    
    // Log the exact Firebase error code to console for debugging (Task 8 & 9)
    console.warn(`[ENERPACK HR Auth Error] Code: "${code}", Message:`, error?.message || error);

    switch (code) {
      case 'auth/unauthorized-domain':
        return {
          code,
          isDomainError: true,
          text: 'This ENERPACK HR domain is not authorized for Firebase Authentication. Add the current production domain to Firebase Authentication → Settings → Authorized domains.'
        };
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return {
          code,
          isDomainError: false,
          text: 'Invalid email or password.'
        };
      case 'auth/user-not-found':
        return {
          code,
          isDomainError: false,
          text: 'No account was found with this email address.'
        };
      case 'auth/wrong-password':
        return {
          code,
          isDomainError: false,
          text: 'Incorrect email or password.'
        };
      case 'auth/invalid-api-key':
        return {
          code,
          isDomainError: false,
          text: 'Invalid Firebase API key configuration. Please verify your environment settings.'
        };
      case 'auth/network-request-failed':
        return {
          code,
          isDomainError: false,
          text: 'Network connection failed. Please check your internet connection and try again.'
        };
      case 'auth/too-many-requests':
        return {
          code,
          isDomainError: false,
          text: 'Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.'
        };
      case 'auth/user-disabled':
        return {
          code,
          isDomainError: false,
          text: 'This account has been disabled by an administrator.'
        };
      case 'auth/popup-closed-by-user':
        return {
          code,
          isDomainError: false,
          text: 'Google sign-in was cancelled before completing.'
        };
      case 'auth/popup-blocked':
        return {
          code,
          isDomainError: false,
          text: 'Your browser blocked the Google sign-in window. Please allow pop-ups for this site and try again.'
        };
      case 'auth/account-exists-with-different-credential':
        return {
          code,
          isDomainError: false,
          text: 'An account already exists with this email address using a different sign-in method. Please sign in using your original method.'
        };
      case 'auth/email-already-in-use':
        return {
          code,
          isDomainError: false,
          text: 'An account with this email already exists. Please sign in instead.'
        };
      case 'auth/operation-not-allowed':
        return {
          code,
          isDomainError: false,
          text: 'This sign-in method is currently disabled in Firebase Console. Please contact the administrator.'
        };
      case 'auth/weak-password':
        return {
          code,
          isDomainError: false,
          text: 'Password must be at least 6 characters long.'
        };
      case 'auth/invalid-email':
        return {
          code,
          isDomainError: false,
          text: 'Please enter a valid email address.'
        };
      default:
        return {
          code,
          isDomainError: false,
          text: code ? `Unable to sign in. (Error: ${code})` : 'Unable to sign in. Please try again.'
        };
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorDetails(null);
    setSuccessMessage('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorDetails(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setSuccessMessage('');
    if (!email.trim() || !password) {
      setErrorDetails({
        code: 'validation/missing-fields',
        isDomainError: false,
        text: 'Please provide both your email and password.'
      });
      return;
    }
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setErrorDetails(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setSuccessMessage('');
    if (!email.trim() || !password || !displayName.trim()) {
      setErrorDetails({
        code: 'validation/missing-fields',
        isDomainError: false,
        text: 'Please fill in your name, email, and password.'
      });
      return;
    }
    if (password.length < 6) {
      setErrorDetails({
        code: 'auth/weak-password',
        isDomainError: false,
        text: 'Password must be at least 6 characters long.'
      });
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(email, password, displayName, employeeId);
      setSuccessMessage('Account created successfully! Your account is pending administrator approval.');
      setViewMode('signin');
    } catch (err: any) {
      setErrorDetails(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setSuccessMessage('');
    if (!email.trim()) {
      setErrorDetails({
        code: 'validation/missing-email',
        isDomainError: false,
        text: 'Please enter your email address to receive a password reset link.'
      });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent! Check your inbox for instructions.');
      setViewMode('signin');
    } catch (err: any) {
      setErrorDetails(getFriendlyErrorMessage(err));
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
        {errorDetails && errorDetails.isDomainError && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs animate-in fade-in space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950 text-xs">Domain Authorization Required</p>
                <p className="text-amber-900 leading-relaxed font-medium">{errorDetails.text}</p>
              </div>
            </div>
            
            <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Current Production Domain:</span>
                <button
                  type="button"
                  onClick={() => {
                    const host = typeof window !== 'undefined' ? window.location.hostname : '';
                    if (host && navigator?.clipboard) {
                      navigator.clipboard.writeText(host);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2000);
                    }
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedDomain ? 'Copied!' : 'Copy Hostname'}
                </button>
              </div>
              <div className="font-mono text-xs font-bold text-slate-800 break-all select-all bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                {typeof window !== 'undefined' ? window.location.hostname : 'current-domain'}
              </div>
            </div>

            <div className="text-[11px] text-amber-900/90 leading-normal bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/60">
              <span className="font-bold">Administrator Instructions:</span>
              <ol className="list-decimal list-inside mt-1 space-y-0.5 text-[10.5px]">
                <li>Open <strong>Firebase Console</strong> for your project</li>
                <li>Go to <strong>Authentication &rarr; Settings &rarr; Authorized domains</strong></li>
                <li>Click <strong>Add domain</strong>, paste the hostname above, and click <strong>Save</strong></li>
              </ol>
            </div>
          </div>
        )}

        {errorDetails && !errorDetails.isDomainError && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1">
              <span className="font-medium leading-relaxed">{errorDetails.text}</span>
            </div>
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
                      setErrorDetails(null);
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
                    setErrorDetails(null);
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
                  setErrorDetails(null);
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
                  setErrorDetails(null);
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
