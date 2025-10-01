import Dexie from 'dexie';

class JayameshDB extends Dexie {
  constructor() {
    super('JayameshCommander');
    
    // Version 4 - Fixed schema with proper indexes
    this.version(4).stores({
      projects: '++id, title, type, status, priority, color, description, createdAt, updatedAt, archived',
      sections: '++id, projectId, name, type, color, order, createdAt',
      goals: '++id, projectId, sectionId, title, target, current, deadline, status, priority, createdAt, updatedAt',
      tasks: '++id, projectId, sectionId, goalId, title, description, status, priority, type, recurring, dueDate, estimatedHours, actualHours, tags, createdAt, updatedAt'
    });
  }
}

export const db = new JayameshDB();

export const seedIfEmpty = async () => {
  try {
    const count = await db.projects.count();
    console.log("Current projects count:", count);
    
    if (count === 0) {
      console.log("Seeding database with initial structure...");
      
      // Create sample project
      const projectId = await db.projects.add({
        title: "Mobile Game - Boom Ball",
        type: "game",
        status: "active",
        priority: 1,
        color: "#f59e0b",
        description: "Hyper-casual mobile game development",
        createdAt: new Date(),
        updatedAt: new Date(),
        archived: false
      });

      // Create default sections for the project
      const sections = [
        { projectId, name: "🎯 Planning", type: "planning", color: "#3b82f6", order: 1, createdAt: new Date() },
        { projectId, name: "💻 Development", type: "development", color: "#10b981", order: 2, createdAt: new Date() },
        { projectId, name: "🎨 Design", type: "design", color: "#8b5cf6", order: 3, createdAt: new Date() },
        { projectId, name: "📱 Marketing", type: "marketing", color: "#ef4444", order: 4, createdAt: new Date() },
        { projectId, name: "📊 Analytics", type: "analytics", color: "#f59e0b", order: 5, createdAt: new Date() }
      ];

      for (const section of sections) {
        const sectionId = await db.sections.add(section);
        
        // Add sample goals and tasks for each section
        await addSampleData(projectId, sectionId, section.name);
      }
      
      console.log('Database seeded with sample structure');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

async function addSampleData(projectId, sectionId, sectionName) {
  const goalsData = {
    "Planning": [
      { title: "Complete Game Design Document", target: 1, current: 0.5, deadline: new Date(Date.now() + 7*24*60*60*1000), status: "in-progress", priority: 1 },
      { title: "Finalize Monetization Strategy", target: 1, current: 0.2, deadline: new Date(Date.now() + 5*24*60*60*1000), status: "not-started", priority: 2 }
    ],
    "Development": [
      { title: "Release MVP Version", target: 1, current: 0.8, deadline: new Date(Date.now() + 14*24*60*60*1000), status: "in-progress", priority: 1 },
      { title: "Fix Critical Bugs", target: 10, current: 3, deadline: new Date(Date.now() + 3*24*60*60*1000), status: "in-progress", priority: 1 }
    ],
    "Marketing": [
      { title: "Reach 1K Followers", target: 1000, current: 250, deadline: new Date(Date.now() + 30*24*60*60*1000), status: "in-progress", priority: 2 },
      { title: "Get 500 Downloads", target: 500, current: 75, deadline: new Date(Date.now() + 45*24*60*60*1000), status: "not-started", priority: 1 }
    ]
  };

  const tasksData = {
    "Planning": [
      { title: "Research competitor games", type: "research", recurring: false, priority: 2 },
      { title: "Define core gameplay loop", type: "design", recurring: false, priority: 1 }
    ],
    "Development": [
      { title: "Fix ball movement physics", type: "bug", recurring: false, priority: 1 },
      { title: "Add particle effects", type: "feature", recurring: false, priority: 2 },
      { title: "Weekly code review", type: "maintenance", recurring: true, priority: 3 }
    ],
    "Marketing": [
      { title: "Post daily Instagram reel", type: "content", recurring: true, priority: 2 },
      { title: "Engage with 15 comments", type: "engagement", recurring: true, priority: 3 },
      { title: "Reach out to 5 influencers", type: "outreach", recurring: false, priority: 1 }
    ]
  };

  // Add goals
  const goals = goalsData[sectionName] || [];
  for (const goal of goals) {
    const goalId = await db.goals.add({
      projectId,
      sectionId,
      ...goal,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add tasks for this goal
    const tasks = tasksData[sectionName] || [];
    for (const task of tasks) {
      await db.tasks.add({
        projectId,
        sectionId,
        goalId,
        ...task,
        status: "todo",
        dueDate: new Date(Date.now() + 2*24*60*60*1000),
        estimatedHours: 2,
        actualHours: 0,
        tags: task.type,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
}

// Database migration helper
export const migrateDatabase = async () => {
  try {
    // Check if we need to migrate from older versions
    const dbVersion = await db.verno;
    console.log("Current DB version:", dbVersion);
    
    if (dbVersion < 4) {
      console.log("Migrating database to version 4...");
      
      // Clear existing data and reseed
      await db.delete();
      await seedIfEmpty();
    }
  } catch (error) {
    console.error("Migration error:", error);
  }
};