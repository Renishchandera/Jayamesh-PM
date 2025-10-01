import { useState } from 'react';
import { db, seedIfEmpty } from '../db';

export default function DatabaseReset() {
  const [isVisible, setIsVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const resetDatabase = async () => {
    if (confirm('Are you sure you want to reset the entire database? This will delete ALL projects, sections, goals, and tasks.')) {
      setIsResetting(true);
      try {
        console.log('Starting database reset...');
        
        // Close the database first
        await db.close();
        
        // Delete the database
        await db.delete();
        console.log('Database deleted');
        
        // Reopen the database (this will recreate it with the latest schema)
        await db.open();
        console.log('Database reopened');
        
        // Reseed with sample data
        await seedIfEmpty();
        console.log('Database reseeded with sample data');
        
        // Reload the app
        window.location.reload();
        
      } catch (error) {
        console.error('Error resetting database:', error);
        alert('Error resetting database: ' + error.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const exportData = async () => {
    try {
      const data = {
        projects: await db.projects.toArray(),
        sections: await db.sections.toArray(),
        goals: await db.goals.toArray(),
        tasks: await db.tasks.toArray(),
        exportDate: new Date().toISOString()
      };
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jayamesh-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const importData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (confirm('This will replace ALL current data. Continue?')) {
          // Clear existing data
          await db.projects.clear();
          await db.sections.clear();
          await db.goals.clear();
          await db.tasks.clear();
          
          // Import new data
          if (data.projects) await db.projects.bulkAdd(data.projects);
          if (data.sections) await db.sections.bulkAdd(data.sections);
          if (data.goals) await db.goals.bulkAdd(data.goals);
          if (data.tasks) await db.tasks.bulkAdd(data.tasks);
          
          console.log('Data imported successfully');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data: Invalid file format');
      }
    };
    input.click();
  };

  const clearAllData = async () => {
    if (confirm('Clear ALL data but keep database structure? This cannot be undone!')) {
      try {
        await db.projects.clear();
        await db.sections.clear();
        await db.goals.clear();
        await db.tasks.clear();
        console.log('All data cleared');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg shadow-lg transition-all z-50"
        title="Developer Tools"
      >
        🔧
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 border border-red-500 text-white p-4 rounded-lg shadow-xl z-50 max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-red-400 text-sm">Developer Tools</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <button 
          onClick={resetDatabase}
          disabled={isResetting}
          className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-800 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isResetting ? '🔄 Resetting...' : '🗑️ Reset & Reseed DB'}
        </button>
        
        <button 
          onClick={clearAllData}
          className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded text-xs font-semibold transition-colors"
        >
          🧹 Clear All Data
        </button>
        
        <button 
          onClick={exportData}
          className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 rounded text-xs font-semibold transition-colors"
        >
          💾 Export Data
        </button>
        
        <button 
          onClick={importData}
          className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded text-xs font-semibold transition-colors"
        >
          📥 Import Data
        </button>
        
        <button 
          onClick={() => {
            console.log('Database Info:', db);
            console.log('Tables:', {
              projects: db.projects,
              sections: db.sections, 
              goals: db.goals,
              tasks: db.tasks
            });
          }}
          className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded text-xs font-semibold transition-colors"
        >
          ℹ️ Log DB Info
        </button>

        <button 
          onClick={async () => {
            const counts = {
              projects: await db.projects.count(),
              sections: await db.sections.count(),
              goals: await db.goals.count(),
              tasks: await db.tasks.count()
            };
            console.log('Record Counts:', counts);
            alert(`Projects: ${counts.projects}\nSections: ${counts.sections}\nGoals: ${counts.goals}\nTasks: ${counts.tasks}`);
          }}
          className="w-full px-3 py-2 bg-indigo-500 hover:bg-indigo-600 rounded text-xs font-semibold transition-colors"
        >
          📊 Show Counts
        </button>
      </div>
      
      {isResetting && (
        <div className="mt-3 text-center text-yellow-400 text-xs">
          Resetting database... Please wait
        </div>
      )}
    </div>
  );
}