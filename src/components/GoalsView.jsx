import React, { useState } from "react";
import { db } from "../db";

const GOAL_STATUSES = {
  'not-started': { label: 'Not Started', color: 'bg-slate-500' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500' },
  'completed': { label: 'Completed', color: 'bg-green-500' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-500' }
};

export default function GoalsView({ sections, goals, selectedSectionId, onSelectSection, refreshData }) {
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 2
  });
  console.log("Rendering GoalsView with goals:", goals);
  const createGoal = async (e) => {
  e.preventDefault();
  if (!newGoal.title.trim() || !selectedSectionId) return;

  try {
    // Get the current project ID from the section
    const section = sections.find(s => s.id === selectedSectionId);
    if (!section) return;

    await db.goals.add({
      projectId: section.projectId, // Add projectId here
      sectionId: selectedSectionId,
      title: newGoal.title.trim(),
      target: parseInt(newGoal.target),
      current: 0,
      deadline: new Date(newGoal.deadline),
      status: 'not-started',
      priority: parseInt(newGoal.priority),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    setNewGoal({
      title: '',
      target: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 2
    });
    
    refreshData();
  } catch (error) {
    console.error('Error creating goal:', error);
  }
};

  const updateGoalProgress = async (goalId, newCurrent) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const status = newCurrent >= goal.target ? 'completed' : 
                    newCurrent > 0 ? 'in-progress' : 'not-started';

      await db.goals.update(goalId, {
        current: Math.max(0, Math.min(newCurrent, goal.target)),
        status,
        updatedAt: new Date()
      });
      
      refreshData();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    if (confirm('Delete this goal?')) {
      try {
        await db.goals.delete(goalId);
        refreshData();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🎯 Project Goals</h2>
        
        {/* Section Selector */}
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Filter by section:</span>
          <select
            value={selectedSectionId || ''}
            onChange={(e) => onSelectSection(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Sections</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Goal Form */}
      {selectedSectionId && (
        <div className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Goal to {selectedSection?.name}</h3>
          <form onSubmit={createGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="Goal title..."
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                placeholder="Target"
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
                min="1"
              />
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="1">🔥 High Priority</option>
                <option value="2">⚠️ Medium Priority</option>
                <option value="3">💤 Low Priority</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              + Add Goal
            </button>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = (goal.current / goal.target) * 100;
          const section = sections.find(s => s.id === goal.sectionId);
          const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'completed';
          
          return (
            <div key={goal.id} className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${
              isOverdue ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800/50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {section && (
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: section.color }}
                        title={section.name}
                      ></div>
                    )}
                    <h3 className="font-bold text-white text-lg leading-tight">{goal.title}</h3>
                  </div>
                  <div className="text-sm text-slate-400 mb-2">
                    Target: <span className="text-white font-semibold">{goal.current}</span> / <span className="text-white font-semibold">{goal.target}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors ml-2"
                  title="Delete Goal"
                >
                  🗑️
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      progress >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                      'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-bold text-sm text-slate-300">Priority</div>
                  <div className={`text-lg font-bold ${
                    goal.priority === 1 ? 'text-red-400' :
                    goal.priority === 2 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {goal.priority === 1 ? '🔥 High' : goal.priority === 2 ? '⚠️ Medium' : '💤 Low'}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-bold text-sm text-slate-300">Status</div>
                  <div className={`text-lg font-bold ${
                    goal.status === 'completed' ? 'text-green-400' :
                    goal.status === 'in-progress' ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {GOAL_STATUSES[goal.status]?.label}
                  </div>
                </div>
              </div>

              {/* Progress Controls */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => updateGoalProgress(goal.id, goal.current - 1)}
                  disabled={goal.current <= 0}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -1
                </button>
                <button
                  onClick={() => updateGoalProgress(goal.id, goal.current + 1)}
                  disabled={goal.current >= goal.target}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +1
                </button>
                <button
                  onClick={() => updateGoalProgress(goal.id, goal.target)}
                  disabled={goal.current >= goal.target}
                  className="flex-1 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete
                </button>
              </div>

              {/* Deadline */}
              {goal.deadline && (
                <div className={`text-sm font-semibold text-center p-2 rounded-lg ${
                  isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-300'
                }`}>
                  ⏰ Due: {new Date(goal.deadline).toLocaleDateString()}
                  {isOverdue && ' (Overdue!)'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-white mb-2">No Goals Yet</h3>
          <p className="text-slate-400">
            {selectedSectionId 
              ? 'Create your first goal for this section!' 
              : 'Select a section to view goals or create new ones.'}
          </p>
        </div>
      )}
    </div>
  );
}