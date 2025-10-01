import React, { useEffect, useState } from "react";
import { db } from "../db";

const STATUSES = {
  todo: { label: "To Do", color: "bg-slate-600" },
  progress: { label: "In Progress", color: "bg-blue-500" },
  review: { label: "Review", color: "bg-yellow-500" },
  done: { label: "Completed", color: "bg-green-500" }
};

export default function TaskBoard({ projectId, refreshData }) {
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      const [projectData, taskData] = await Promise.all([
        db.projects.get(projectId),
        db.tasks.where('projectId').equals(projectId).toArray()
      ]);
      
      setProject(projectData);
      setTasks(taskData);
    } catch (error) {
      console.error('Error loading task data:', error);
    }
  }

  async function addTask(status = 'todo') {
    if (!newTaskText.trim()) return;
    
    try {
      await db.tasks.add({
        projectId,
        title: newTaskText.trim(),
        status,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNewTaskText('');
      refreshData(); // Refresh the entire app data
      loadData(); // Refresh local task data
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function updateTaskStatus(taskId, newStatus) {
    try {
      await db.tasks.update(taskId, { 
        status: newStatus, 
        updatedAt: new Date() 
      });
      refreshData();
      loadData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function deleteTask(taskId) {
    try {
      await db.tasks.delete(taskId);
      refreshData();
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-slate-400">Loading project...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: project.color || '#3b82f6' }}
          ></div>
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <span className="px-2 py-1 text-xs rounded-full bg-slate-700 capitalize">
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="text-slate-400">{project.description}</p>
        )}
      </div>

      {/* Quick Add */}
      <div className="mb-6 flex gap-2">
        <input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button 
          onClick={() => addTask()}
          className="px-6 py-3 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(STATUSES).map(([statusKey, status]) => {
          const statusTasks = tasks.filter(task => task.status === statusKey);
          
          return (
            <div key={statusKey} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                <h3 className="font-semibold">{status.label}</h3>
                <span className="text-slate-400 text-sm">({statusTasks.length})</span>
              </div>
              
              <div 
                className="space-y-3 min-h-[100px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = parseInt(e.dataTransfer.getData('taskId'));
                  if (taskId) {
                    updateTaskStatus(taskId, statusKey);
                  }
                }}
              >
                {statusTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('taskId', task.id.toString());
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{task.title}</span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-400 hover:text-red-400 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>P{task.priority}</span>
                      <span>
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {statusTasks.length === 0 && (
                  <div className="text-slate-500 text-sm text-center py-4">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}