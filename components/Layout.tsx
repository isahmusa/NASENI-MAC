
import React, { useState } from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeView, setActiveView }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'photo', label: 'Photo Enhancer', icon: '🖼️' },
    { id: 'audio', label: 'Audio Enhancer', icon: '🎙️' },
    { id: 'scripts', label: 'Script Writer', icon: '📝' },
    { id: 'meetings', label: 'Meeting Assistant', icon: '🤝' },
    { id: 'projects', label: 'Project History', icon: '📁' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: '⚙️' });
  }

  const currentLabel = menuItems.find(m => m.id === activeView)?.label || 'Overview';

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-white font-['Inter']">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-white/10 flex flex-col z-20 bg-[#0a0a0b]`}>
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center shrink-0">
              <img 
                src="https://naseni.gov.ng/wp-content/uploads/2023/12/naseni-logo.png" 
                alt="NASENI Logo" 
                className="h-10 w-auto object-contain brightness-110"
              />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight ml-1">MAC STUDIO</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <span>🚪</span>
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0b]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
              ☰
            </button>
            <h1 className="text-lg font-semibold tracking-tight">{currentLabel}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold border border-white/10">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#0e0e11] to-[#0a0a0b]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
