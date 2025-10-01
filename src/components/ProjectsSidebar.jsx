import { useState } from "react";
import { db } from "../db";
import { useUI } from "../store";

const PROJECT_TYPES = {
  game: { label: "🎮 Game", color: "#f59e0b" },
  web: { label: "🌐 Web", color: "#3b82f6" },
  desktop: { label: "💻 Desktop", color: "#8b5cf6" },
  mobile: { label: "📱 Mobile", color: "#10b981" }
};

export default function ProjectsSidebar({ projects, refresh, onDeleteProject }) {
  const { selectedProjectId, setSelectedProjectId } = useUI();
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectType, setNewProjectType] = useState('game');

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    
    try {
      await db.projects.add({
        title: newProjectTitle.trim(),
        type: newProjectType,
        status: 'planning',
        priority: 1,
        color: PROJECT_TYPES[newProjectType].color,
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false
      });
      
      setNewProjectTitle('');
      refresh();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }

  return (
    <aside className="w-80 bg-slate-800/30 backdrop-blur border-r border-slate-700 p-4 overflow-auto">
      {/* Add Project Form */}
      <form onSubmit={createProject} className="mb-6 p-4 bg-slate-800/50 rounded-lg">
        <input
          value={newProjectTitle}
          onChange={(e) => setNewProjectTitle(e.target.value)}
          placeholder="New project name..."
          className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none mb-2"
        />
        
        <select
          value={newProjectType}
          onChange={(e) => setNewProjectType(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none mb-3"
        >
          {Object.entries(PROJECT_TYPES).map(([key, type]) => (
            <option key={key} value={key} className="bg-slate-700">
              {type.label}
            </option>
          ))}
        </select>
        
        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
        >
          Create Project
        </button>
      </form>

      {/* Projects List */}
      <div className="space-y-2">
        {projects.length === 0 ? (
          <div className="text-slate-400 text-center py-4">
            No projects yet. Create your first project!
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              className={`group relative p-4 rounded-lg cursor-pointer transition-all ${
                selectedProjectId === project.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                  : 'bg-slate-800/30 hover:bg-slate-700/50 border border-transparent'
              }`}
            >
              <div onClick={() => setSelectedProjectId(project.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                      <div className="font-semibold text-white">{project.title}</div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <span>{PROJECT_TYPES[project.type]?.label}</span>
                      <span>•</span>
                      <span className="capitalize">{project.status}</span>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-slate-400 truncate">{project.description}</p>
                    )}
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    {new Date(project.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              {/* Delete Button */}
              <button
                onClick={() => onDeleteProject(project.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-all"
                title="Delete Project"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}