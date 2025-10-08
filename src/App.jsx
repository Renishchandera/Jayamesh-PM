import { useEffect, useState } from "react";
import { db, seedIfEmpty, migrateDatabase } from "./db";
import { useUI } from "./store";
import ProjectsSidebar from "./components/ProjectsSidebar";
import ProjectWorkspace from "./components/ProjectWorkspace";
import StatsOverview from "./components/StatsOverview";
import DebugInfo from "./components/DebugInfo";
import DatabaseReset from "./components/DatabaseReset";
import PomodoroTimer from "./components/PomodoroTimer";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroState, setPomodoroState] = useState({
    isActive: false,
    timeLeft: 25 * 60,
    mode: 'pomodoro',
    sessionsCompleted: 0
  });
  
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

  // Update timer even when component is hidden
  useEffect(() => {
    let interval = null;
    
    if (pomodoroState.isActive && pomodoroState.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (pomodoroState.isActive && pomodoroState.timeLeft === 0) {
      // Timer completed - handle completion
      handleTimerCompletion();
    }
    
    return () => clearInterval(interval);
  }, [pomodoroState.isActive, pomodoroState.timeLeft]);

  const handleTimerCompletion = () => {
    setPomodoroState(prev => ({
      ...prev,
      isActive: false,
      sessionsCompleted: prev.sessionsCompleted + 1
    }));
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: 'Focus session finished!',
        icon: '/favicon.ico'
      });
    }
  };

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

  const updatePomodoroState = (updates) => {
    setPomodoroState(prev => ({ ...prev, ...updates }));
  };

  const resetTimer = () => {
    const POMODORO_PRESETS = {
      pomodoro: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
      deepWork: 90 * 60
    };
    
    setPomodoroState(prev => ({
      ...prev,
      isActive: false,
      timeLeft: POMODORO_PRESETS[prev.mode]
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
              
              {/* Pomodoro Toggle Button */}
              <div className="relative">
                <button
                  onClick={() => setShowPomodoro(!showPomodoro)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    pomodoroState.isActive 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-600/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${pomodoroState.isActive ? 'bg-red-400 animate-pulse' : 'bg-slate-400'}`} />
                  🍅 {pomodoroState.isActive ? formatTime(pomodoroState.timeLeft) : 'Focus Timer'}
                  {pomodoroState.isActive && (
                    <span className="text-xs bg-red-500/30 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>
                
                {/* Mini timer indicator when hidden */}
                {pomodoroState.isActive && !showPomodoro && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                )}
              </div>
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

      {/* Pomodoro Timer - Conditionally Rendered */}
      {showPomodoro && (
        <PomodoroTimer 
          pomodoroState={pomodoroState}
          onStateChange={updatePomodoroState}
          onReset={resetTimer}
          onClose={() => setShowPomodoro(false)}
        />
      )}

      <DebugInfo />
      <DatabaseReset/>
    </div>
  );
}