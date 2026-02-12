
import React, { useState, useRef } from 'react';
import { EMAIL_REGEX } from '../constants';
import { firebaseService } from '../services/firebaseService';
import { User } from '../types';

interface LandingPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onAdminLogin: (user: User) => void;
  staffCount: number;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onAdminLogin, staffCount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showMemberAuth, setShowMemberAuth] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Before/After Slider State
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (isForgotPasswordMode) {
      if (!email) {
        setError('Please enter your email identity.');
        return;
      }
      setIsAuthenticating(true);
      try {
        await firebaseService.sendPasswordReset(email);
        setSuccessMsg(`We sent you a password change link to ${email}`);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsAuthenticating(false);
      }
      return;
    }

    if (isSignupMode) {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError('Please fill all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setIsAuthenticating(true);
      try {
        await firebaseService.signUp(email, password, firstName, lastName, photo || undefined);
        setShowMemberAuth(false);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      setIsAuthenticating(true);
      try {
        const success = await onLogin(email, password);
        if (success) setShowMemberAuth(false);
      } catch (err: any) {
        setError(err.message || 'Password or Email Incorrect');
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsAuthenticating(true);
    try {
      const adminUser = await firebaseService.login(email, password);
      onAdminLogin(adminUser);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const resetModals = () => {
    setShowMemberAuth(false);
    setShowAdminLogin(false);
    setIsSignupMode(false);
    setIsForgotPasswordMode(false);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-white flex flex-col relative hero-gradient">
      {/* Navigation Header */}
      <nav className="relative z-50 px-6 md:px-16 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <img 
              src="https://naseni.gov.ng/wp-content/uploads/2023/12/naseni-logo.png" 
              alt="NASENI Logo" 
              className="h-12 w-auto brightness-110"
            />
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black tracking-tighter">MAC</span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">Studio</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setShowMemberAuth(true); setIsSignupMode(false); setIsForgotPasswordMode(false); setError(''); setSuccessMsg(''); }}
            className="px-8 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 text-[11px] font-black uppercase tracking-widest transition-all"
          >
            Login
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center pt-16 px-6">
        {/* Hero Title */}
        <div className="text-center space-y-6 max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            Empower Your Creativity with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">MAC Studio</span>
          </h1>
          <p className="text-zinc-400 text-xl md:text-2xl font-medium tracking-tight">
            AI-Powered Media Enhancer & Smart Meeting Assistant
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          <button onClick={() => { setShowMemberAuth(true); setIsSignupMode(false); setIsForgotPasswordMode(false); setError(''); }} className="btn-photos btn-glow px-12 py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all active:scale-95">
            Enhance Photos
          </button>
          <button onClick={() => { setShowMemberAuth(true); setIsSignupMode(false); setIsForgotPasswordMode(false); setError(''); }} className="btn-audio btn-glow px-12 py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all active:scale-95">
            Improve Audio
          </button>
          <button onClick={() => { setShowMemberAuth(true); setIsSignupMode(false); setIsForgotPasswordMode(false); setError(''); }} className="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-black text-[13px] uppercase tracking-widest transition-all active:scale-95">
            Launch Assistant
          </button>
        </div>

        {/* Dynamic Visual Section */}
        <div className="w-full max-w-6xl mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 px-4 items-center">
          
          {/* Functional Before/After Comparison */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            className="group relative h-[500px] w-full studio-glass rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 cursor-ew-resize"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&q=80&w=1200')",
                filter: 'saturate(1.5) contrast(1.1) brightness(1.1)'
              }}
            />
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&q=80&w=1200')",
                filter: 'grayscale(1) brightness(0.7)',
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
              }}
            />
            <div className="absolute top-6 left-8 z-20 px-4 py-1.5 bg-black/50 backdrop-blur rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 pointer-events-none">Before</div>
            <div className="absolute top-6 right-8 z-20 px-4 py-1.5 bg-blue-600/80 backdrop-blur rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white pointer-events-none">After</div>
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white/50 z-30 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black text-sm font-black shadow-2xl border-4 border-white/20">
                ↔
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 items-center">
            <div className="relative group">
                <div className="absolute -inset-10 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000"></div>
                <div className="w-64 h-64 rounded-full overflow-hidden border-[6px] border-blue-500/30 relative z-10 shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Assistant" />
                </div>
                <div className="absolute -bottom-2 -right-2 z-20 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl shadow-2xl border-4 border-[#05060f] group-hover:scale-110 transition-transform duration-500">🎙️</div>
            </div>
            <div className="studio-glass p-8 rounded-[2.5rem] w-full max-w-sm border border-white/10 relative overflow-hidden group/card">
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">Live Meeting Facilitation</h4>
                    </div>
                </div>
                <div className="h-32 rounded-2xl overflow-hidden mb-6 border border-white/5 relative z-10">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNEJomjDs6xg1yypmzQqPdjN-GwGTBZ6CBWA&s" 
                      className="w-full h-full object-cover opacity-80" 
                      alt="Team Meeting" 
                    />
                </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] font-black text-white uppercase tracking-[0.6em] mb-16 opacity-70 mt-20">Transform Your Media & Manage Your Meetings Effortlessly</p>
      </main>

      {/* Auth Modals */}
      {(showMemberAuth || showAdminLogin) && (
        <div className="fixed inset-0 z-[100] bg-[#05060f]/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
          <div className="studio-glass p-10 md:p-12 rounded-[4rem] w-full max-w-lg relative animate-in zoom-in-95 border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] my-8">
            <button onClick={resetModals} className="absolute top-10 right-10 text-zinc-600 hover:text-white text-2xl transition-colors">✕</button>
            
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 border border-blue-500/20">
                {showAdminLogin ? '🛡️' : (isForgotPasswordMode ? '🔑' : (isSignupMode ? '✨' : '👤'))}
              </div>
              <h2 className="text-4xl font-black mb-3 uppercase tracking-tighter">
                {showAdminLogin ? 'Security Access' : (isForgotPasswordMode ? 'Reset Security Key' : (isSignupMode ? 'Create Identity' : 'Member Portal'))}
              </h2>
              <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.2em]">Authorized NASENI Personnel Only</p>
            </div>

            <form onSubmit={showAdminLogin ? handleAdminSubmit : handleAuthSubmit} className="space-y-5">
              {!showAdminLogin && isSignupMode && !isForgotPasswordMode && (
                <>
                  <div className="flex justify-center mb-6">
                    <label className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-blue-500 cursor-pointer group">
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      {photoPreview ? (
                        <img src={photoPreview} className="w-full h-full object-cover" alt="Profile Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📷</div>
                      )}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">First Name</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Last Name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Email Identity</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@naseni.gov.ng"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none"
                />
              </div>

              {!isForgotPasswordMode && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none"
                  />
                </div>
              )}

              {!showAdminLogin && !isForgotPasswordMode && isSignupMode && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Repeat Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none"
                  />
                </div>
              )}

              {error && (
                <div className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center px-4 bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                  {error}
                  {error === "User already exists. Sign in?" && (
                    <button type="button" onClick={() => { setIsSignupMode(false); setError(''); }} className="ml-2 underline text-blue-400">Sign in</button>
                  )}
                </div>
              )}

              {successMsg && (
                <div className="text-green-400 text-[10px] font-black uppercase tracking-widest text-center px-4 bg-green-500/10 py-3 rounded-xl border border-green-500/20">
                  {successMsg}
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-5 bg-blue-600 rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 text-[11px] mt-6"
              >
                {isAuthenticating ? 'Authorizing...' : (showAdminLogin ? 'Enter Secure Vault' : (isForgotPasswordMode ? 'Get Reset Link' : (isSignupMode ? 'Register Now' : 'Enter Studio')))}
              </button>

              {!showAdminLogin && !isForgotPasswordMode && !isSignupMode && (
                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPasswordMode(true); setError(''); setSuccessMsg(''); }}
                    className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest font-black transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {!showAdminLogin && (
                <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-6">
                  {isForgotPasswordMode ? (
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPasswordMode(false); setError(''); setSuccessMsg(''); }}
                      className="text-blue-500 hover:text-blue-400 transition-colors underline"
                    >
                      Back to Sign In
                    </button>
                  ) : (
                    <>
                      {isSignupMode ? 'Already have access?' : 'New to MAC Studio?'}
                      <button 
                        type="button"
                        onClick={() => { setIsSignupMode(!isSignupMode); setError(''); setSuccessMsg(''); }}
                        className="ml-2 text-blue-500 hover:text-blue-400 transition-colors underline"
                      >
                        {isSignupMode ? 'Sign In' : 'Join Studio'}
                      </button>
                    </>
                  )}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
