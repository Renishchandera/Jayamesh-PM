import { useState, useEffect } from 'react';
import { db } from '../db';
import { useUI } from '../store';

const PROJECT_TYPES = {
  game: { label: "🎮 Game", color: "#f59e0b" },
  web: { label: "🌐 Web", color: "#3b82f6" },
  desktop: { label: "💻 Desktop", color: "#8b5cf6" },
  mobile: { label: "📱 Mobile", color: "#10b981" }
};

const STATUS_TYPES = {
  planning: "📋 Planning",
  active: "🚀 Active", 
  paused: "⏸️ Paused",
  completed: "✅ Completed"
};

export default function ProjectModal({ onClose, projectId }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'game',
    status: 'planning',
    priority: 2,
    description: '',
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  async function loadProject() {
    const project = await db.projects.get(projectId);
    if (project) {
      setFormData(project);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (projectId) {
        // Update existing project
        await db.projects.update(projectId, {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        // Create new project
        await db.projects.add({
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
          archived: false
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {projectId ? 'Edit Project' : 'Create New Project'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="Enter project name..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(PROJECT_TYPES).map(([key, type]) => (
                <option key={key} value={key} className="bg-slate-700">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(STATUS_TYPES).map(([key, label]) => (
                <option key={key} value={key} className="bg-slate-700">
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Priority (1-5, 1=Highest)
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', parseInt(e.target.value))}
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(priority => (
                <option key={priority} value={priority} className="bg-slate-700">
                  {priority} - {priority === 1 ? 'Highest' : priority === 5 ? 'Lowest' : 'Medium'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Project description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-white' : 'border-slate-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : projectId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}