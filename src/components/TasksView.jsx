import React, { useState } from "react";
import { db } from "../db";

const TASK_TYPES = {
  'feature': { label: '✨ Feature', color: 'bg-green-500' },
  'bug': { label: '🐛 Bug', color: 'bg-red-500' },
  'content': { label: '📝 Content', color: 'bg-blue-500' },
  'research': { label: '🔍 Research', color: 'bg-purple-500' },
  'maintenance': { label: '🔧 Maintenance', color: 'bg-yellow-500' },
  'outreach': { label: '📢 Outreach', color: 'bg-pink-500' },
  'design': { label: '🎨 Design', color: 'bg-indigo-500' }
};

const TASK_STATUSES = {
  'todo': { label: 'To Do', color: 'bg-slate-500' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500' },
  'review': { label: 'Review', color: 'bg-yellow-500' },
  'done': { label: 'Done', color: 'bg-green-500' }
};

export default function TasksView({ sections, tasks, selectedSectionId, onSelectSection, refreshData }) {
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'feature',
    priority: 2,
    recurring: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 2
  });

  const createTask = async (e) => {
  e.preventDefault();
  if (!newTask.title.trim() || !selectedSectionId) return;

  try {
    // Get the current project ID from the section
    const section = sections.find(s => s.id === selectedSectionId);
    if (!section) return;

    await db.tasks.add({
      projectId: section.projectId, // Add projectId here
      sectionId: selectedSectionId,
      goalId: null,
      title: newTask.title.trim(),
      description: '',
      status: 'todo',
      type: newTask.type,
      priority: parseInt(newTask.priority),
      recurring: newTask.recurring,
      dueDate: new Date(newTask.dueDate),
      estimatedHours: parseInt(newTask.estimatedHours),
      actualHours: 0,
      tags: newTask.type,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    setNewTask({
      title: '',
      type: 'feature',
      priority: 2,
      recurring: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 2
    });
    
    refreshData();
  } catch (error) {
    console.error('Error creating task:', error);
  }
};
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await db.tasks.update(taskId, {
        status: newStatus,
        updatedAt: new Date()
      });
      refreshData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (confirm('Delete this task?')) {
      try {
        await db.tasks.delete(taskId);
        refreshData();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    review: tasks.filter(task => task.status === 'review'),
    done: tasks.filter(task => task.status === 'done')
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">✅ Project Tasks</h2>
        
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

      {/* Add Task Form */}
      {selectedSectionId && (
        <div className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Task to {selectedSection?.name}</h3>
          <form onSubmit={createTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <input
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title..."
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(TASK_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.label}</option>
                ))}
              </select>
              
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="1">🔥 High</option>
                <option value="2">⚠️ Medium</option>
                <option value="3">💤 Low</option>
              </select>
              
              <input
                type="number"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                placeholder="Hours"
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
                min="1"
              />
              
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
              
              <label className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg border border-slate-600">
                <input
                  type="checkbox"
                  checked={newTask.recurring}
                  onChange={(e) => setNewTask({...newTask, recurring: e.target.checked})}
                  className="rounded w-5 h-5"
                />
                <span className="text-white font-medium">Recurring</span>
              </label>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              + Add Task
            </button>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(TASK_STATUSES).map(([statusKey, status]) => (
          <div key={statusKey} className="bg-slate-800/30 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
              <h3 className="font-bold text-white text-lg">{status.label}</h3>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-sm font-semibold">
                {tasksByStatus[statusKey]?.length || 0}
              </span>
            </div>
            
            <div className="space-y-4">
              {tasksByStatus[statusKey].map(task => {
                const section = sections.find(s => s.id === task.sectionId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                
                return (
                  <div
                    key={task.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {section && (
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: section.color }}
                              title={section.name}
                            ></div>
                          )}
                          <span className="font-semibold text-white leading-tight">{task.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            TASK_TYPES[task.type]?.color + '/20 text-' + TASK_TYPES[task.type]?.color.split('-')[1] + '-400'
                          }`}>
                            {TASK_TYPES[task.type]?.label}
                          </span>
                          {task.recurring && <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">🔄 Recurring</span>}
                          {isOverdue && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">⚠️ Overdue</span>}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors ml-2"
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Task Details */}
                    <div className="flex justify-between items-center text-sm text-slate-400 mb-3">
                      <span className={`font-semibold ${
                        task.priority === 1 ? 'text-red-400' :
                        task.priority === 2 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        P{task.priority} Priority
                      </span>
                      <span>⏱️ {task.estimatedHours}h</span>
                    </div>

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className={`text-sm font-medium mb-4 p-2 rounded-lg ${
                        isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/50 text-slate-300'
                      }`}>
                        📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Status Controls */}
                    <div className="flex gap-1">
                      {Object.entries(TASK_STATUSES).map(([key, st]) => (
                        <button
                          key={key}
                          onClick={() => updateTaskStatus(task.id, key)}
                          disabled={task.status === key}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                            task.status === key 
                              ? st.color + ' text-white shadow-lg' 
                              : 'bg-slate-600 text-slate-300 hover:bg-slate-500 hover:text-white'
                          } disabled:opacity-100 disabled:cursor-default`}
                        >
                          {st.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {tasksByStatus[statusKey].length === 0 && (
                <div className="text-center py-8 text-slate-500 rounded-lg border-2 border-dashed border-slate-600">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm">No tasks</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-white mb-2">No Tasks Yet</h3>
          <p className="text-slate-400">
            {selectedSectionId 
              ? 'Create your first task for this section!' 
              : 'Select a section to view tasks or create new ones.'}
          </p>
        </div>
      )}
    </div>
  );
}