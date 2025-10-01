import { useEffect, useState } from 'react';
import { db } from '../db';

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const [projects, sections, goals, tasks] = await Promise.all([
        db.projects.toArray(),
        db.sections.toArray(),
        db.goals.toArray(),
        db.tasks.toArray()
      ]);
      
      setDebugInfo({
        projects: projects.length,
        sections: sections.length,
        goals: goals.length,
        tasks: tasks.length,
        databaseName: db.name,
        databaseVersion: db.verno
      });
    } catch (error) {
      console.error('Error loading debug info:', error);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-lg text-xs"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm border border-slate-600">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div>DB: {debugInfo.databaseName} (v{debugInfo.databaseVersion})</div>
        <div>Projects: {debugInfo.projects}</div>
        <div>Sections: {debugInfo.sections}</div>
        <div>Goals: {debugInfo.goals}</div>
        <div>Tasks: {debugInfo.tasks}</div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button 
          onClick={loadDebugInfo}
          className="flex-1 px-2 py-1 bg-blue-500 rounded text-xs"
        >
          Refresh
        </button>
        <button 
          onClick={() => console.log('Debug Info:', debugInfo)}
          className="flex-1 px-2 py-1 bg-green-500 rounded text-xs"
        >
          Log
        </button>
      </div>
    </div>
  );
}