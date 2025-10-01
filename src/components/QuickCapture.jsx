import { useState, useEffect } from "react";
import { db } from "../db";
import { useUI } from "../store";

export default function QuickCapture({ onClose, refreshData }) {
  const [text, setText] = useState('');
  const { selectedProjectId } = useUI();

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function save() {
    if (!text.trim() || !selectedProjectId) {
      alert('Please select a project and enter task text');
      return;
    }
    
    try {
      await db.tasks.add({
        projectId: selectedProjectId,
        title: text.trim(),
        status: 'todo',
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setText('');
      refreshData();
      onClose();
    } catch (error) {
      console.error('Error saving quick capture:', error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Quick Capture</h3>
          <p className="text-slate-400 text-sm mt-1">Add a quick task to current project</p>
        </div>
        
        <div className="p-6">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
            rows="4"
            autoFocus
          />
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel (Esc)
            </button>
            <button
              onClick={save}
              disabled={!text.trim() || !selectedProjectId}
              className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all"
            >
              Save Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}