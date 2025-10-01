import { useEffect, useState } from 'react';
import { db } from '../db';

export default function StatsOverview({ projects, refreshTrigger }) {
  const [stats, setStats] = useState({ 
    totalTasks: 0, 
    completedTasks: 0, 
    totalGoals: 0,
    completedGoals: 0,
    overdueTasks: 0,
    totalSections: 0
  });

  useEffect(() => {
    loadStats();
  }, [projects, refreshTrigger]);

  async function loadStats() {
    try {
      const [allTasks, allGoals, allSections] = await Promise.all([
        db.tasks.toArray(),
        db.goals.toArray(),
        db.sections.toArray()
      ]);
      
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'done').length;
      const totalGoals = allGoals.length;
      const completedGoals = allGoals.filter(g => g.status === 'completed').length;
      const totalSections = allSections.length;
      const overdueTasks = allTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
      ).length;
      
      setStats({ totalTasks, completedTasks, totalGoals, completedGoals, overdueTasks, totalSections });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  const taskCompletion = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const goalCompletion = stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0;

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="text-center">
        <div className="text-white font-bold text-lg">{projects.length}</div>
        <div className="text-slate-400">Projects</div>
      </div>
      
      <div className="text-center">
        <div className="text-white font-bold text-lg">{stats.totalSections}</div>
        <div className="text-slate-400">Sections</div>
      </div>
      
      <div className="text-center">
        <div className="text-white font-bold text-lg">{stats.totalGoals}</div>
        <div className="text-slate-400">Goals</div>
        <div className="text-green-400 text-xs">{goalCompletion}%</div>
      </div>
      
      <div className="text-center">
        <div className="text-white font-bold text-lg">{stats.totalTasks}</div>
        <div className="text-slate-400">Tasks</div>
        <div className="text-blue-400 text-xs">{taskCompletion}%</div>
      </div>
      
      {stats.overdueTasks > 0 && (
        <div className="text-center">
          <div className="text-red-400 font-bold text-lg">{stats.overdueTasks}</div>
          <div className="text-slate-400">Overdue</div>
        </div>
      )}
    </div>
  );
}