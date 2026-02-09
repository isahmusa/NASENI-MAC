
import React from 'react';
import { User } from '../types';
import { PROJECT_TEMPLATES } from '../constants';

interface DashboardProps {
  user: User;
  onNavigate: (view: string) => void;
  staffList?: User[];
  onStaffUpdate?: (newStaff: User[]) => void;
  onUseTemplate?: (content: string, tone: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, staffList, onUseTemplate }) => {
  const creativeEngines = [
    { id: 'photo', title: 'Photo Enhancer', icon: '🖼️', color: 'blue', desc: 'Neural upscaling for visual assets', load: '12%', status: 'Nominal' },
    { id: 'audio', title: 'Audio Mastering', icon: '🎙️', color: 'indigo', desc: 'Studio-grade noise suppression', load: '4%', status: 'Nominal' },
    { id: 'scripts', title: 'Script Writer', icon: '📝', color: 'purple', desc: 'Narrative transformation engine', load: '28%', status: 'Optimizing' },
    { id: 'meetings', title: 'Meeting Hub', icon: '🤝', color: 'blue', desc: 'Facilitated agenda analysis', load: 'Active', status: 'Live' },
  ];

  return (
    <div className="space-y-12 pb-24 overflow-x-hidden">
      
      {/* --- Global Performance Status --- */}
      <div className="animate-reveal delay-1 flex items-center justify-between px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl group">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.2em]">MAC System Online</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em]">Active Strategy:</span>
            <span className="text-[11px] font-black text-white uppercase tracking-widest bg-blue-500/20 px-3 py-1 rounded border border-blue-500/30">2026 IMPACT PHASE</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">CPU</span>
            <span className="text-blue-400">14%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">MEM</span>
            <span className="text-blue-400">0.8GB</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <span className="hidden sm:inline">Uplink: Secure 256-bit</span>
        </div>
      </div>

      {/* --- Cinematic Hero Command Hub (Static) --- */}
      <div className="animate-reveal delay-2 relative group overflow-hidden studio-glass min-h-[520px] rounded-[5rem] border border-white/10 flex items-center">
        {/* Static Background Image - Professional Team */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBl26P5Z21s49ZkUfrKqSBNg2s3bvEnIqIBw&s" 
            alt="NASENI MAC Workspace" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          {/* Layered Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/70 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-5"></div>
          <div className="absolute inset-0 shimmer opacity-20 z-15"></div>
        </div>

        <div className="relative z-20 w-full p-16 lg:p-24 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16">
          <div className="space-y-8 max-w-3xl">
            <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold uppercase tracking-[0.3em] border border-blue-500/30 backdrop-blur-2xl">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Strategic Uplink Verified
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] drop-shadow-2xl">
              Welcome Back,<br />
              <span className="bg-gradient-to-r from-blue-400 via-white to-indigo-400 text-transparent bg-clip-text">
                {user.firstName}
              </span>
            </h1>
            <p className="text-zinc-300 text-2xl leading-relaxed max-w-xl font-medium drop-shadow-md">
              MAC Studio is currently processing <span className="text-white font-bold">{staffList?.length || 0} secure nodes</span>. Your workspace is optimized for the 2026 roadmap.
            </p>
            <div className="flex gap-4 pt-4">
               <button onClick={() => onNavigate('projects')} className="px-10 py-5 bg-white text-black font-black rounded-3xl hover:bg-zinc-200 transition-all active:scale-95 text-sm uppercase tracking-widest shadow-[0_20px_40px_rgba(255,255,255,0.1)]">View Repository</button>
               <button onClick={() => onNavigate('meetings')} className="px-10 py-5 bg-white/10 border border-white/20 text-white font-black rounded-3xl hover:bg-white/20 transition-all active:scale-95 text-sm uppercase tracking-widest backdrop-blur-xl">Launch Hub</button>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col gap-6 min-w-[360px] animate-in slide-in-from-right-12 duration-1000">
            <div className="studio-glass p-8 rounded-[3.5rem] bg-white/2 border border-white/5 flex items-center gap-6 group/item hover:bg-blue-600/10 transition-colors">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-blue-500/20 group-hover/item:scale-110 transition-transform">🧠</div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Agent Priority</p>
                <p className="text-lg font-black text-blue-400 uppercase tracking-wide">Strategy Engine</p>
              </div>
            </div>
            <div className="studio-glass p-8 rounded-[3.5rem] bg-white/2 border border-white/5 flex items-center gap-6 group/item hover:bg-indigo-600/10 transition-colors">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-indigo-500/20 group-hover/item:scale-110 transition-transform">⚡</div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">Response Time</p>
                <p className="text-lg font-black text-indigo-400 uppercase tracking-wide">42ms Ultra Low</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Operational Grid --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Creative Engines Section */}
        <div className="xl:col-span-8 space-y-10 animate-reveal delay-3">
          <div className="flex items-center justify-between px-8">
            <div className="space-y-1">
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">Neural Engines</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.3em]">AI Processing Architecture</p>
            </div>
            <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {creativeEngines.map((action, i) => (
              <button 
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="studio-glass p-12 rounded-[4rem] border border-white/5 text-left group relative overflow-hidden flex flex-col justify-between h-80 transition-all hover:bg-gradient-to-br hover:from-white/[0.03] hover:to-transparent"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className={`absolute top-0 right-0 w-48 h-48 bg-${action.color}-500/5 rounded-full blur-[100px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000`}></div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-6xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 drop-shadow-xl">
                      {action.icon}
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Unit Load</span>
                       <span className={`text-sm font-black ${action.load === 'Active' ? 'text-green-500' : 'text-blue-500'}`}>{action.load}</span>
                    </div>
                  </div>
                  <h4 className="text-3xl font-black tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{action.title}</h4>
                  <p className="text-base text-zinc-400 leading-relaxed max-w-[85%]">{action.desc}</p>
                </div>
                
                <div className="relative z-10 flex items-center justify-between mt-10">
                   <div className="flex items-center gap-4 text-[11px] font-black text-zinc-600 group-hover:text-white transition-colors uppercase tracking-[0.3em]">
                    Deploy Module <span className="group-hover:translate-x-3 transition-transform duration-500">→</span>
                  </div>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                    Status: {action.status}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Blueprint Collection */}
          <div className="pt-8 space-y-8">
            <div className="flex items-center justify-between px-8">
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tighter uppercase italic">Strategic Blueprints</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.3em]">Pre-defined execution templates</p>
              </div>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide px-4">
              {PROJECT_TEMPLATES.map((tpl, i) => (
                <button
                  key={tpl.id}
                  onClick={() => onUseTemplate?.(tpl.content, tpl.tone)}
                  className="flex-shrink-0 w-96 studio-glass p-10 rounded-[4rem] border border-white/5 text-left group hover:border-blue-500/30 transition-all hover:translate-y-[-12px] blueprint-bg overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="flex items-start justify-between mb-10 relative z-10">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-2xl border border-blue-500/20">
                      {tpl.icon}
                    </div>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-5 py-2 rounded-full uppercase tracking-[0.2em] border border-blue-500/20">Verified</span>
                  </div>
                  <h4 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors relative z-10 uppercase italic">{tpl.title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-10 h-16 overflow-hidden relative z-10">{tpl.desc}</p>
                  <div className="text-[12px] font-black text-zinc-400 group-hover:text-white transition-colors flex items-center gap-4 relative z-10 uppercase tracking-[0.3em]">
                    Architect <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence Hub */}
        <div className="xl:col-span-4 space-y-10 animate-reveal delay-4">
          <div className="flex justify-between items-center px-8">
             <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tighter uppercase italic">Radar</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.3em]">Communication Net</p>
              </div>
          </div>
          
          <div className="studio-glass p-12 rounded-[5rem] border border-white/5 space-y-10 relative overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
            
            <div className="space-y-8">
              {[
                { title: 'MAC 2026 Strategy Kickoff', time: 'Tomorrow, 09:00 AM', status: 'Priority', icon: '🎯' },
                { title: 'NASENI Keke Media Tour', time: 'Thu, 11:30 AM', status: 'Live', icon: '🛺' },
                { title: 'Solar Hub Content Review', time: 'Fri, 04:00 PM', status: 'Upcoming', icon: '☀️' },
              ].map((meeting, i) => (
                <div 
                  key={i} 
                  className="p-8 bg-white/5 rounded-[3.5rem] border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer group flex items-start gap-6"
                >
                  <div className={`w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform ${meeting.status === 'Live' ? 'radar-pulse shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''}`}>
                    {meeting.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-black text-lg mb-2 truncate group-hover:text-blue-400 transition-colors uppercase italic">{meeting.title}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">{meeting.time}</span>
                      <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border ${
                        meeting.status === 'Priority' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                        meeting.status === 'Live' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/10 text-zinc-500 border-white/10'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => onNavigate('meetings')}
              className="w-full py-7 bg-gradient-to-r from-blue-600 to-indigo-700 hover:brightness-125 text-white font-black rounded-[3rem] shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-6 text-sm group uppercase tracking-[0.4em]"
            >
              Uplink Hub
              <span className="group-hover:translate-x-3 transition-transform duration-500">→</span>
            </button>
          </div>

          {/* Persona Capacity Matrix */}
          <div className="studio-glass p-12 rounded-[5rem] border border-white/5 bg-gradient-to-tr from-zinc-900/60 to-transparent relative overflow-hidden group">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
             
             <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full border-4 border-white/10 flex items-center justify-center text-2xl font-black shadow-2xl relative group-hover:scale-110 transition-transform duration-700">
                  <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-30"></div>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                   <h4 className="font-black text-2xl uppercase italic tracking-tighter">{user.firstName} {user.lastName}</h4>
                   <p className="text-[11px] text-zinc-500 uppercase tracking-[0.4em] font-black">{user.role}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="p-7 bg-white/5 border border-white/5 rounded-[3rem] group/card hover:border-blue-500/40 transition-all">
                   <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Optimized</p>
                   <p className="text-4xl font-black group-hover/card:text-blue-400 transition-colors">128</p>
                </div>
                <div className="p-7 bg-white/5 border border-white/5 rounded-[3rem] group/card hover:border-indigo-500/40 transition-all">
                   <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Roadmap</p>
                   <p className="text-4xl font-black text-indigo-400 group-hover/card:text-indigo-300 transition-colors">94<span className="text-lg text-zinc-600 ml-1 font-bold">%</span></p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
