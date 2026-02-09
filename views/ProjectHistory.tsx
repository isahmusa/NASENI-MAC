import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectHistoryProps {
  projects: Project[];
  onDelete: (id: string) => void;
}

const ProjectHistory: React.FC<ProjectHistoryProps> = ({ projects, onDelete }) => {
  const [filter, setFilter] = useState<'all' | 'photo' | 'audio' | 'script'>('all');
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.type === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'photo': return '🖼️';
      case 'audio': return '🎙️';
      case 'script': return '📝';
      default: return '📁';
    }
  };

  const handleDownload = (project: Project) => {
    const link = document.createElement('a');
    if (project.type === 'script') {
      const blob = new Blob([project.data], { type: 'text/plain' });
      link.href = URL.createObjectURL(blob);
      link.download = `${project.name}.txt`;
    } else {
      link.href = project.data;
      link.download = `${project.name}.${project.type === 'audio' ? 'wav' : 'png'}`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project History</h2>
          <p className="text-zinc-500 text-sm mt-1">Manage all your previously generated MAC assets.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 flex-1 md:w-64"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'photo', 'audio', 'script'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
              filter === t 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="studio-glass p-20 rounded-[2.5rem] border border-white/5 text-center flex flex-col items-center justify-center gap-4">
          <div className="text-5xl opacity-20">📂</div>
          <p className="text-zinc-500">No projects found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="studio-glass rounded-3xl border border-white/5 overflow-hidden group flex flex-col h-full hover:scale-[1.02] transition-transform">
              <div className="h-40 bg-black/40 relative flex items-center justify-center overflow-hidden border-b border-white/5">
                {project.type === 'photo' ? (
                  <img src={project.data} alt={project.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                ) : (
                  <div className="text-5xl">{getIcon(project.type)}</div>
                )}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] font-bold text-zinc-400 uppercase tracking-widest border border-white/10">
                  {project.type}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm mb-1 truncate">{project.name}</h4>
                  <p className="text-[10px] text-zinc-600 font-medium">
                    {new Date(project.createdAt).toLocaleDateString()} at {new Date(project.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => handleDownload(project)}
                    className="flex-1 py-2.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    DOWNLOAD
                  </button>
                  <button 
                    onClick={() => { if(confirm('Delete project permanently?')) onDelete(project.id); }}
                    className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectHistory;
