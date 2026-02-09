
import React, { useState, useEffect } from 'react';
import LandingPage from './views/LandingPage';
import Dashboard from './views/Dashboard';
import MeetingAssistant from './views/MeetingAssistant';
import PhotoEnhancer from './views/PhotoEnhancer';
import AudioEnhancer from './views/AudioEnhancer';
import ScriptWriter from './views/ScriptWriter';
import ProjectHistory from './views/ProjectHistory';
import AdminDashboard from './views/AdminDashboard';
import Layout from './components/Layout';
import VoiceAssistant from './components/VoiceAssistant';
import { User, UserRole, Project } from './types';
import { firebaseService } from './services/firebaseService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [staffList, setStaffList] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templateContent, setTemplateContent] = useState<{content: string, tone: string} | null>(null);
  const [meetingContext, setMeetingContext] = useState<string>('');
  const [activeDocumentName, setActiveDocumentName] = useState<string | null>(null);

  // Load staff directory in real-time from Firebase
  useEffect(() => {
    const unsubscribeStaff = firebaseService.listenToStaff((staff) => {
      setStaffList(staff);
      
      const sessionEmail = localStorage.getItem('mac_studio_user_email');
      const sessionRole = localStorage.getItem('mac_studio_user_role');

      if (sessionEmail && !user) {
        if (sessionRole === UserRole.ADMIN) {
          setUser({
            firstName: 'Admin',
            lastName: 'System',
            email: sessionEmail,
            role: UserRole.ADMIN
          });
        } else {
          const found = staff.find(s => s.email.toLowerCase() === sessionEmail.toLowerCase());
          if (found) {
            setUser(found);
          }
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribeStaff();
  }, [user]);

  // Load user-specific projects
  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }

    const unsubscribeProjects = firebaseService.listenToUserProjects(user.email, (userProjects) => {
      setProjects(userProjects);
    });

    return () => unsubscribeProjects();
  }, [user]);

  const handleLogin = async (email: string) => {
    if (staffList.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const foundStaff = staffList.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (!foundStaff) {
      return false;
    }
    setUser(foundStaff);
    localStorage.setItem('mac_studio_user_email', foundStaff.email);
    localStorage.setItem('mac_studio_user_role', foundStaff.role);
    return true;
  };

  const handleAdminLogin = (adminUser: User) => {
    setUser(adminUser);
    localStorage.setItem('mac_studio_user_email', adminUser.email);
    localStorage.setItem('mac_studio_user_role', adminUser.role);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mac_studio_user_email');
    localStorage.removeItem('mac_studio_user_role');
    setActiveView('dashboard');
  };

  const addProject = async (project: Omit<Project, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    try {
      await firebaseService.saveProject(project, user.email);
    } catch (e) {
      console.error(e);
      alert('Failed to sync to Firebase.');
    }
  };

  const deleteProject = async (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete) {
      await firebaseService.deleteProject(id, projectToDelete.data);
    }
  };

  const handleStaffUpdate = async (newStaff: User[]) => {
    for (const member of newStaff) {
      await firebaseService.addStaffMember(member);
    }
  };

  const handleUseTemplate = (content: string, tone: string) => {
    setTemplateContent({ content, tone });
    setActiveView('scripts');
  };

  const handleVoiceCommand = (command: string) => {
    const cmd = command.toLowerCase();
    if (cmd.includes('photo')) setActiveView('photo');
    else if (cmd.includes('audio')) setActiveView('audio');
    else if (cmd.includes('meeting')) setActiveView('meetings');
    else if (cmd.includes('script')) setActiveView('scripts');
    else if (cmd.includes('dashboard')) setActiveView('dashboard');
    else if (cmd.includes('history')) setActiveView('projects');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <LandingPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} staffCount={staffList.length} />
      ) : (
        <Layout user={user} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
          {activeView === 'dashboard' && <Dashboard user={user} onNavigate={setActiveView} staffList={staffList} onStaffUpdate={handleStaffUpdate} onUseTemplate={handleUseTemplate} />}
          {activeView === 'photo' && <PhotoEnhancer onSave={addProject} />}
          {activeView === 'audio' && <AudioEnhancer onSave={addProject} />}
          {activeView === 'scripts' && (
            <ScriptWriter 
              onSave={addProject} 
              initialContent={templateContent?.content} 
              initialTone={templateContent?.tone} 
              onClearTemplate={() => setTemplateContent(null)}
            />
          )}
          {activeView === 'meetings' && (
            <MeetingAssistant 
              onSyncContext={(text, name) => {
                setMeetingContext(text);
                setActiveDocumentName(name);
              }} 
            />
          )}
          {activeView === 'projects' && <ProjectHistory projects={projects} onDelete={deleteProject} />}
          {activeView === 'admin' && user.role === UserRole.ADMIN && <AdminDashboard staffList={staffList} onStaffUpdate={handleStaffUpdate} />}
        </Layout>
      )}
      <VoiceAssistant 
        onCommand={handleVoiceCommand} 
        isLoggedIn={!!user} 
        userName={user?.firstName} 
        externalContext={meetingContext}
        activeDocumentName={activeDocumentName}
      />
    </>
  );
};

export default App;
