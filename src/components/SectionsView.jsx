import React, { useState, useEffect } from "react";
import { db } from "../db";

export default function SectionsView({ 
  sections, 
  selectedSectionId, 
  onSelectSection, 
  onCreateSection, 
  onDeleteSection,
  onSectionDataLoad 
}) {
  const [newSectionName, setNewSectionName] = useState('');
  const [sectionGoals, setSectionGoals] = useState({});
  const [sectionTasks, setSectionTasks] = useState({});

  useEffect(() => {
    loadSectionDetails();
  }, [sections]);

  const loadSectionDetails = async () => {
    const goalsMap = {};
    const tasksMap = {};

    for (const section of sections) {
      const [goals, tasks] = await Promise.all([
        db.goals.where('sectionId').equals(section.id).toArray(),
        db.tasks.where('sectionId').equals(section.id).toArray()
      ]);
      
      goalsMap[section.id] = goals;
      tasksMap[section.id] = tasks;
    }

    setSectionGoals(goalsMap);
    setSectionTasks(tasksMap);
  };

  const handleCreateSection = (e) => {
    e.preventDefault();
    if (newSectionName.trim()) {
      onCreateSection(newSectionName.trim());
      setNewSectionName('');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Project Sections</h2>
        
        {/* Add Section Form */}
        <form onSubmit={handleCreateSection} className="flex gap-2">
          <input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="New section name..."
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Add Section
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(section => (
          <div
            key={section.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedSectionId === section.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'
            }`}
            onClick={() => onSelectSection(section.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: section.color }}
                ></div>
                <h3 className="font-semibold text-white">{section.name}</h3>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs"
                  title="Delete Section"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Section Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-slate-700/50 rounded">
                <div className="text-green-400 font-bold">
                  {sectionGoals[section.id]?.length || 0}
                </div>
                <div className="text-slate-400">Goals</div>
              </div>
              <div className="text-center p-2 bg-slate-700/50 rounded">
                <div className="text-blue-400 font-bold">
                  {sectionTasks[section.id]?.length || 0}
                </div>
                <div className="text-slate-400">Tasks</div>
              </div>
            </div>

            {/* Recent Goals Preview */}
            <div className="mt-3 space-y-1">
              {(sectionGoals[section.id] || []).slice(0, 3).map(goal => (
                <div key={goal.id} className="text-xs p-2 bg-slate-700/30 rounded">
                  <div className="font-medium truncate">{goal.title}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-slate-400">
                      {goal.current}/{goal.target}
                    </div>
                    <div className={`px-1 rounded text-xs ${
                      goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      goal.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {goal.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}