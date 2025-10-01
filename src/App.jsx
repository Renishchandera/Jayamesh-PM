import { useEffect, useState } from "react";
import { db, seedIfEmpty, migrateDatabase } from "./db";
import { useUI } from "./store";
import ProjectsSidebar from "./components/ProjectsSidebar";
import ProjectWorkspace from "./components/ProjectWorkspace";
import StatsOverview from "./components/StatsOverview";
import DebugInfo from "./components/DebugInfo";
import DatabaseReset from "./components/DatabaseReset";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { 
    selectedProjectId, 
    setSelectedProjectId
  } = useUI();

  useEffect(() => { 
    initializeApp();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [refreshTrigger]);

  async function initializeApp() {
    try {
      // Run migration first
      await migrateDatabase();
      await seedIfEmpty();
      await loadProjects();
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setLoading(false);
    }
  }

  const loadProjects = async () => {
    try {
      const allProjects = await db.projects.toArray();
      console.log("Loaded projects:", allProjects.length);
      setProjects(allProjects);
      
      if (!selectedProjectId && allProjects.length > 0) {
        setSelectedProjectId(allProjects[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const deleteProject = async (projectId) => {
    if (confirm('Are you sure you want to delete this project? This will delete all sections, goals, and tasks.')) {
      try {
        // Get all sections for this project
        const sections = await db.sections.where('projectId').equals(projectId).toArray();
        
        // Delete all tasks and goals for each section
        for (const section of sections) {
          await db.tasks.where('sectionId').equals(section.id).delete();
          await db.goals.where('sectionId').equals(section.id).delete();
        }
        
        // Delete all sections
        await db.sections.where('projectId').equals(projectId).delete();
        
        // Finally delete the project
        await db.projects.delete(projectId);
        
        // Refresh and reset selection if needed
        refreshData();
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
        
        console.log('Project deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white font-semibold">Loading Jayamesh Commander...</h2>
          <p className="text-slate-400 mt-2">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <ProjectsSidebar 
        projects={projects} 
        refresh={refreshData}
        onDeleteProject={deleteProject}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-slate-700 p-4 bg-slate-800/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Jayamesh Commander
              </h1>
              <p className="text-slate-400 text-sm">Structured Project Management</p>
            </div>
            
            <div className="flex items-center gap-4">
              <StatsOverview projects={projects} refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {selectedProjectId ? (
            <ProjectWorkspace 
              projectId={selectedProjectId} 
              refreshProjects={refreshData}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl mb-2">Select a Project Mission</h3>
              <p className="text-slate-400">Choose a project from the sidebar to begin</p>
            </div>
          )}
        </div>
      </main>

      <DebugInfo />
      <DatabaseReset/>
    </div>
  );
}