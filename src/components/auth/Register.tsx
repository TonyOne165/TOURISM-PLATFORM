import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(formData.email, formData.password, formData.displayName.trim());
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/password accounts are not enabled. Please contact support.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please allow pop-ups for this site.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4 py-12">
      <div className="card w-full max-w-md bg-white shadow-2xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Create Your Account</h2>
            <p className="text-gray-600 mt-2">Join us and start exploring amazing tours</p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="alert alert-error shadow-lg mb-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <input
                type="text"
                name="displayName"
                placeholder="John Doe"
                className="input input-bordered w-full"
                value={formData.displayName}
                onChange={handleChange}
                required
                autoComplete="name"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                minLength={6}
                disabled={loading}
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">Must be at least 6 characters</span>
              </label>
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3 items-start">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm mt-1"
                  required
                  disabled={loading}
                  aria-describedby="register-legal-disclaimer"
                />
                <span id="register-legal-disclaimer" className="label-text text-sm">
                  Al continuar, acepto los{' '}
                  <a
                    href="/terminos-y-condiciones"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary font-semibold"
                  >
                    Términos y Condiciones
                  </a>
                  {' '}y la{' '}
                  <a
                    href="/politica-de-privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary font-semibold"
                  >
                    Política de Privacidad
                  </a>
                  , incluyendo el uso opcional de mi ubicación para sugerirme destinos cercanos. No se realiza rastreo continuo.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider my-6">OR</div>

          {/* Google Sign-In Button */}
          <button 
            onClick={handleGoogleSignIn}
            className="btn btn-outline w-full gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};