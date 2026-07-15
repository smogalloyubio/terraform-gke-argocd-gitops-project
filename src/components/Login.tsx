import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User as UserIcon, Wallet, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { User, Account } from '../types';
import { API_CONFIG } from '../apiConfig';

interface LoginProps {
  onLoginSuccess: (user: User, accounts: Account[]) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick fill handles for instant testing
  const handleQuickFill = (userType: 'sarah' | 'john') => {
    if (userType === 'sarah') {
      setEmail('sarah@simplebank.com');
      setPassword('password123');
    } else {
      setEmail('john@simplebank.com');
      setPassword('password123');
    }
    setIsRegister(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register API flow
        const response = await axios.post(`${API_CONFIG.USER_SERVICE}/api/users`, {
          firstName,
          lastName,
          email,
          password,
        });
        
        // Response contains both the created user and their default checking account
        const { user, account } = response.data;
        onLoginSuccess(user, [account]);
      } else {
        // Login API flow
        const response = await axios.post(`${API_CONFIG.USER_SERVICE}/api/users/login`, {
          email,
          password,
        });
        const { user, accounts } = response.data;
        onLoginSuccess(user, accounts);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
      <div id="login-card-wrapper" className="w-full max-w-5xl bg-white rounded-2xl border border-[#E9ECEF] shadow-sm overflow-hidden grid md:grid-cols-12 min-h-[600px]">
        
        {/* Left Side: Editorial Branding Banner */}
        <div id="login-brand-banner" className="hidden md:flex md:col-span-5 bg-zinc-950 text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Background subtle minimalist decoration */}
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full opacity-5 bg-white"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm tracking-tight">
              S
            </div>
            <span className="font-sans text-xl font-semibold tracking-tight text-white">SimpleBank</span>
          </div>

          <div className="space-y-6 relative z-10">
            <h1 className="text-3xl font-sans font-semibold tracking-tight text-white leading-tight">
              Banking designed for modern builders.
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              Open checking and high-yield savings accounts, transfer funds instantly, and scale your personal economy with modular precision.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>FDIC insured up to $250,000</span>
            </div>
            <div className="text-xs text-zinc-500 font-mono">
              © 2026 SimpleBank Inc. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Form Container */}
        <div id="login-form-container" className="col-span-12 md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-8">
            
            {/* Header Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium tracking-wider text-blue-600 uppercase">
                  {isRegister ? 'Start Journey' : 'Secure Vault Gate'}
                </span>
                
                {/* Mobile logo indicator */}
                <div className="flex md:hidden items-center gap-1.5">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    S
                  </div>
                  <span className="font-sans text-sm font-semibold text-gray-900">SimpleBank</span>
                </div>
              </div>
              <h2 className="text-2xl font-sans font-semibold text-gray-950 tracking-tight">
                {isRegister ? 'Create your banking account' : 'Welcome back to SimpleBank'}
              </h2>
              <p className="text-sm text-gray-500">
                {isRegister ? 'Fill in your details below to activate your banking suite.' : 'Sign in to access your dashboard, balances, and wire transfers.'}
              </p>
            </div>

            {/* Quick Demo Pre-fill Grid (Only on Login) */}
            {!isRegister && (
              <div id="demo-credentials-section" className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-blue-800 text-xs font-medium">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Interactive Learning Sandbox Credentials:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('sarah')}
                    className="py-1.5 px-3 bg-white hover:bg-gray-50 border border-blue-200 hover:border-blue-300 text-left rounded-lg text-xs font-sans text-gray-700 font-medium transition shadow-sm cursor-pointer"
                  >
                    <div className="text-gray-900">Sarah Connor (Rich)</div>
                    <div className="text-gray-500 font-normal">Balance: $5,420.50</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('john')}
                    className="py-1.5 px-3 bg-white hover:bg-gray-50 border border-blue-200 hover:border-blue-300 text-left rounded-lg text-xs font-sans text-gray-700 font-medium transition shadow-sm cursor-pointer"
                  >
                    <div className="text-gray-900">John Connor</div>
                    <div className="text-gray-500 font-normal">Balance: $1,250.00</div>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message banner */}
            {error && (
              <div id="auth-error-banner" className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">First Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Sarah"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Last Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Connor"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-black text-white rounded-lg text-sm font-medium transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing transaction...' : isRegister ? 'Activate Core Account' : 'Access Vault'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline focus:outline-none cursor-pointer"
              >
                {isRegister ? 'Already have an account? Sign in' : 'New to SimpleBank? Create an account (with $1000 balance!)'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
