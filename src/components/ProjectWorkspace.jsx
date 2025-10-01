import React, { useEffect, useState } from "react";
import { db } from "../db";
import { useUI } from "../store";
import SectionsView from "./SectionsView";
import GoalsView from "./GoalsView";
import TasksView from "./TasksView";

export default function ProjectWorkspace({ projectId, refreshProjects }) {
  const [project, setProject] = useState(null);
  const [sections, setSections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const { viewMode, setViewMode, selectedSectionId, setSelectedSectionId } = useUI();

  useEffect(() => {
    loadProjectData();
  }, [projectId, dataVersion]);

  const loadProjectData = async () => {
    try {
      console.log("Loading project data for project:", projectId);
      
      const [projectData, sectionsData] = await Promise.all([
        db.projects.get(projectId),
        db.sections.where('projectId').equals(projectId).sortBy('order')
      ]);

      setProject(projectData);
      setSections(sectionsData);

      // Load goals and tasks for the project
      const allGoals = await db.goals.where('projectId').equals(projectId).toArray();
      const allTasks = await db.tasks.where('projectId').equals(projectId).toArray();
      
      console.log("Loaded goals:", allGoals.length);
      console.log("Loaded tasks:", allTasks.length);
      
      setGoals(allGoals);
      setTasks(allTasks);

      // Auto-select first section if none selected
      if (sectionsData.length > 0 && !selectedSectionId) {
        setSelectedSectionId(sectionsData[0].id);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  };

  const refreshData = () => {
    setDataVersion(prev => prev + 1);
  };

  const createSection = async (name, type = 'custom') => {
    try {
      await db.sections.add({
        projectId,
        name,
        type,
        color: '#6b7280',
        order: sections.length + 1,
        createdAt: new Date()
      });
      refreshData();
      refreshProjects();
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const deleteSection = async (sectionId) => {
    if (confirm('Delete this section and all its goals and tasks?')) {
      try {
        await db.tasks.where('sectionId').equals(sectionId).delete();
        await db.goals.where('sectionId').equals(sectionId).delete();
        await db.sections.delete(sectionId);
        refreshData();
        refreshProjects();
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  // Filter goals and tasks by selected section
  const filteredGoals = selectedSectionId 
    ? goals.filter(goal => goal.sectionId === selectedSectionId)
    : goals;

  const filteredTasks = selectedSectionId 
    ? tasks.filter(task => task.sectionId === selectedSectionId)
    : tasks;

  console.log("Filtered Goals:", filteredGoals.length);
  console.log("Filtered Tasks:", filteredTasks.length);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-400">Loading project...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project Header */}
      <div className="border-b border-slate-700 p-6 bg-slate-800/30 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }}></div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              <p className="text-slate-400">{project.description}</p>
            </div>
          </div>
          
          <div className="flex gap-2 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('sections')}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === 'sections' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              📁 Sections
            </button>
            <button
              onClick={() => setViewMode('goals')}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === 'goals' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              🎯 Goals
            </button>
            <button
              onClick={() => setViewMode('tasks')}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === 'tasks' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              ✅ Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-900/50">
        {viewMode === 'sections' && (
          <SectionsView
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onCreateSection={createSection}
            onDeleteSection={deleteSection}
            refreshData={refreshData}
          />
        )}
        
        {viewMode === 'goals' && (
          <GoalsView
            sections={sections}
            goals={filteredGoals}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            refreshData={refreshData}
          />
        )}
        
        {viewMode === 'tasks' && (
          <TasksView
            sections={sections}
            tasks={filteredTasks}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            refreshData={refreshData}
          />
        )}
      </div>
    </div>
  );
}