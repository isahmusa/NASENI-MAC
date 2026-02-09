
import React, { useState, useRef } from 'react';
import { EMAIL_REGEX } from '../constants';
import { firebaseService } from '../services/firebaseService';
import { User } from '../types';

interface LandingPageProps {
  onLogin: (email: string) => Promise<boolean>;
  onAdminLogin: (user: User) => void;
  staffCount: number;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onAdminLogin, staffCount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showMemberLogin, setShowMemberLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
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

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Format: lastname.FirstName@naseni.gov.ng');
      return;
    }
    setIsAuthenticating(true);
    const success = await onLogin(cleanEmail);
    if (!success) setError('User not found in the official directory.');
    setIsAuthenticating(false);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);
    try {
      const adminUser = await firebaseService.loginAdmin(email.trim(), password);
      onAdminLogin(adminUser);
    } catch (err: any) {
      setError('Invalid administrator credentials.');
    } finally {
      setIsAuthenticating(false);
    }
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
          <div className="hidden xl:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Photo Enhancer</a>
            <a href="#" className="hover:text-white transition-colors">Audio Enhancer</a>
            <a href="#" className="hover:text-white transition-colors">Script Writer</a>
            <a href="#" className="hover:text-white transition-colors">Meeting Assistant</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMemberLogin(true)}
            className="px-8 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 text-[11px] font-black uppercase tracking-widest transition-all"
          >
            Login
          </button>
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="px-8 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest transition-all"
          >
            Admin
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
          <button onClick={() => setShowMemberLogin(true)} className="btn-photos btn-glow px-12 py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all active:scale-95">
            Enhance Photos
          </button>
          <button onClick={() => setShowMemberLogin(true)} className="btn-audio btn-glow px-12 py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all active:scale-95">
            Improve Audio
          </button>
          <button onClick={() => setShowMemberLogin(true)} className="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-black text-[13px] uppercase tracking-widest transition-all active:scale-95">
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
            {/* After Image (Full Color) */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&q=80&w=1200')",
                filter: 'saturate(1.5) contrast(1.1) brightness(1.1)'
              }}
            />
            
            {/* Before Image (Grayscale - Clipped) */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&q=80&w=1200')",
                filter: 'grayscale(1) brightness(0.7)',
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
              }}
            />

            {/* Labels */}
            <div className="absolute top-6 left-8 z-20 px-4 py-1.5 bg-black/50 backdrop-blur rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 pointer-events-none">Before</div>
            <div className="absolute top-6 right-8 z-20 px-4 py-1.5 bg-blue-600/80 backdrop-blur rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white pointer-events-none">After</div>

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white/50 z-30 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black text-sm font-black shadow-2xl border-4 border-white/20">
                ↔
              </div>
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white/80 transition-colors pointer-events-none">
              Slide to Compare
            </div>
          </div>

          {/* AI Assistant Preview Side - Featuring African Professionals */}
          <div className="flex flex-col gap-8 items-center">
            <div className="relative group">
                <div className="absolute -inset-10 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000"></div>
                {/* AI Avatar - Black Woman Professional */}
                <div className="w-64 h-64 rounded-full overflow-hidden border-[6px] border-blue-500/30 relative z-10 shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Assistant" />
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-color"></div>
                </div>
                {/* Mic Indicator Icon */}
                <div className="absolute -bottom-2 -right-2 z-20 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl shadow-2xl border-4 border-[#05060f] group-hover:scale-110 transition-transform duration-500">🎙️</div>
            </div>

            {/* Meeting Visualization Card */}
            <div className="studio-glass p-8 rounded-[2.5rem] w-full max-w-sm border border-white/10 relative overflow-hidden group/card">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">Live Meeting Facilitation</h4>
                        <p className="text-[10px] font-bold text-zinc-500">2026 Strategy Sync</p>
                    </div>
                </div>
                
                {/* Meeting Image - African Professionals in a corporate setting (Updated per user request) */}
                <div className="h-32 rounded-2xl overflow-hidden mb-6 border border-white/5 relative z-10">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNEJomjDs6xg1yypmzQqPdjN-GwGTBZ6CBWA&s" 
                      className="w-full h-full object-cover opacity-80 group-hover/card:scale-105 transition-transform duration-700" 
                      alt="African Professional Team Meeting" 
                    />
                </div>

                <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md border border-blue-500/40 flex items-center justify-center text-[8px] text-blue-400">✓</div>
                        <div className="h-1.5 flex-1 bg-blue-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-md border border-white/10 flex items-center justify-center"></div>
                        <div className="h-1.5 w-3/4 bg-white/5 rounded-full"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Bottom */}
        <div className="w-full max-w-5xl mt-24 mb-40 grid grid-cols-1 sm:grid-cols-3 gap-8 px-4">
           {[
             { label: 'Photo Enhancer', icon: '🖼️' },
             { label: 'Audio Enhancer', icon: '🔊' },
             { label: 'Script Writing', icon: '📝' },
           ].map((item, i) => (
             <div key={i} className="feature-icon-box p-10 rounded-[3rem] flex flex-col items-center gap-6 text-center cursor-pointer group hover:translate-y-[-10px] transition-all">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-5xl group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner">
                    {item.icon}
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">{item.label}</p>
             </div>
           ))}
        </div>

        <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.6em] mb-16 opacity-50">Transform Your Media & Manage Your Meetings Effortlessly</p>
      </main>

      {/* Shared Login Modal logic */}
      {(showMemberLogin || showAdminLogin) && (
        <div className="fixed inset-0 z-[100] bg-[#05060f]/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="studio-glass p-10 md:p-14 rounded-[4rem] w-full max-w-md relative animate-in zoom-in-95 border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            <button onClick={() => { setShowMemberLogin(false); setShowAdminLogin(false); }} className="absolute top-10 right-10 text-zinc-600 hover:text-white text-2xl transition-colors">✕</button>
            <div className="mb-12 text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 border border-blue-500/20">
                {showAdminLogin ? '🛡️' : '👤'}
              </div>
              <h2 className="text-4xl font-black mb-3 uppercase tracking-tighter">{showAdminLogin ? 'Security Access' : 'Member Portal'}</h2>
              <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.2em]">Authorized NASENI Personnel Only</p>
            </div>
            <form onSubmit={showAdminLogin ? handleAdminSubmit : handleMemberSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 pl-2">Email Identity</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lastname.FirstName@naseni.gov.ng"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-800 font-medium"
                />
              </div>
              {showAdminLogin && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 pl-2">Security Key</label>
                    <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-zinc-800"
                    />
                </div>
              )}
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center px-4 bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-5 bg-blue-600 rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 text-[11px] mt-8"
              >
                {isAuthenticating ? 'Authorizing...' : 'Enter Studio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
