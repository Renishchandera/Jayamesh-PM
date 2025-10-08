# 🚀 Jayamesh Commander - Personal Project Management Tool

> *"At Jayamesh, we believe great tools should work for you, not the other way around. That's why we build software that respects your privacy, your workflow, and your freedom."*

---

## 🏢 About Jayamesh

**Jayamesh** is a creative studio dedicated to building exceptional software experiences. We specialize in:

- 🎮 **Game Development** - Immersive gaming experiences
- 🛠️ **Developer Tools** - Software that makes creation easier  
- 🌐 **Web Platforms** - Scalable, user-focused applications

**Jayamesh Commander** represents our philosophy: tools should be powerful yet simple, feature-rich yet intuitive, and always put the user in control.

### Our Promise:
- 🔒 **Privacy by Design** - Your data belongs to you
- 🚀 **Performance First** - Software that feels instant
- 🎯 **User-Focused** - Features that solve real problems
- 💝 **No Lock-in** - Always export your data, anytime

---

*Jayamesh Commander is part of our commitment to building tools that help creators focus on what matters most - creating.*

---

# 🚀 Jayamesh Commander - Personal Project Management Tool

**Your own structured project management system that lives on your machine**

Jayamesh Commander is a powerful, offline-first project management application built specifically for solo developers, creators, and entrepreneurs who want complete control over their project data without relying on cloud services or subscriptions.

## ✨ Why Jayamesh Commander?

### 🎯 **Built for Real Project Management**
- **Structured Sections**: Organize work into Planning, Development, Marketing, Design, Analytics
- **Goal Tracking**: Set measurable targets with progress tracking (e.g., "Reach 1K followers")
- **Task Organization**: Categorized tasks (Features, Bugs, Content, Research) with priorities
- **Rich Notes System**: Full-featured note-taking with formatting and organization
- **Focus Timer**: Built-in Pomodoro timer for productivity sessions
- **No Subscription Fees**: Your data, your rules, forever free

### 🔒 **Privacy-First & Offline**
- **100% Local Storage**: All data stays on your machine using IndexedDB
- **Zero Cloud Dependency**: Works completely offline
- **No Account Required**: Start managing projects immediately
- **Export/Import**: Full control over your data with JSON backups

### 🎨 **Developer-Focused Features**
- **Technical Task Types**: Bug fixes, features, maintenance, research
- **Recurring Tasks**: Perfect for daily/weekly routines
- **Priority System**: Visual priority indicators (High/Medium/Low)
- **Kanban Boards**: Drag & drop task management
- **Progress Tracking**: Visual goal progress with deadlines
- **Rich Text Notes**: Markdown-style formatting with URL detection
- **Focus Sessions**: Pomodoro timer with session tracking

## 🛠️ Perfect For
- **Solo Developers** managing multiple projects
- **Startup Founders** tracking business goals
- **Content Creators** managing publishing schedules
- **Students** organizing projects and deadlines
- **Freelancers** tracking client work and notes
- **Anyone** tired of complex, subscription-based project tools

## 🚀 Quick Start

```bash
# Clone and run locally
git clone https://github.com/Renishchandera/Jayamesh-PM
cd jayamesh-pm
npm install
npm run dev
```

Open http://localhost:5173 or according to your machine, and start managing projects immediately!

## 💡 Core Philosophy

Most project management tools are either:
- ❌ **Too simple** (basic todo lists)
- ❌ **Too complex** (enterprise bloatware)  
- ❌ **Too expensive** (monthly subscriptions)
- ❌ **Privacy concerns** (cloud-only storage)

**Jayamesh Commander** strikes the perfect balance: powerful enough for serious project management, simple enough to start using immediately, and private enough that your data never leaves your machine.

## 🎯 What Makes It Different

| Feature | Typical Tools | Jayamesh Commander |
|---------|---------------|-------------------|
| **Data Storage** | Cloud servers | Your machine only |
| **Cost** | Monthly fees | Free forever |
| **Offline** | Limited | Fully functional |
| **Setup Time** | Accounts & onboarding | Instant start |
| **Customization** | Limited | Your rules |
| **Notes System** | Basic text | Rich formatting |
| **Focus Timer** | Separate apps | Built-in |

## 🔧 Tech Stack
- **Frontend**: React + Vite
- **Database**: Dexie.js (IndexedDB)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Emoji-based (no external dependencies)

## 📁 Project Structure
```
jayamesh-commander/
├── src/
│   ├── components/     # React components
│   │   ├── ProjectsSidebar.jsx
│   │   ├── ProjectWorkspace.jsx
│   │   ├── SectionsView.jsx
│   │   ├── GoalsView.jsx
│   │   ├── TasksView.jsx
│   │   ├── NotesView.jsx      # ✨ New!
│   │   └── PomodoroTimer.jsx  # ✨ New!
│   ├── db/            # Database schema & operations
│   ├── store/         # State management
│   └── App.jsx        # Main application
├── public/            # Static assets
└── package.json       # Dependencies
```

## 🌟 Features Overview

### 🎯 Projects & Sections
- Create unlimited projects with custom types (Game, Web, Mobile, Desktop)
- Organize work into logical sections (Planning, Development, Marketing, etc.)
- Color-coded visual organization

### 📊 Goals & Progress
- Set measurable goals with targets (e.g., "500 downloads")
- Track progress with visual indicators
- Deadline tracking with overdue alerts
- Progress controls with +1/-1 buttons

### ✅ Task Management
- Multiple task types (Feature, Bug, Content, Research, etc.)
- Priority levels with visual indicators
- Recurring task support
- Kanban-style status boards (To Do, In Progress, Review, Done)
- Drag & drop organization

### 📝 **Rich Notes System** ✨ NEW!
- **Section-based organization**: Notes belong to specific project sections
- **Rich text formatting**: 
  - **Bold text**: `**bold**`
  - **Italic text**: `_italic_`
  - **Bullet points**: `- item`
  - **Blockquotes**: `> quote`
  - **Automatic URL detection** with clickable links
- **Tag organization**: Add multiple tags for better categorization
- **Pinning system**: Pin important notes for quick access
- **Full-text search**: Search across all notes by title, content, and tags
- **Preview mode**: See formatted content with proper styling
- **Edit mode**: Clean writing interface with formatting tips

### 🍅 **Focus Timer** ✨ NEW!
- **Multiple timer modes**:
  - 🍅 Pomodoro (25min work + 5min break)
  - ☕ Short Break (5 minutes)
  - 🌴 Long Break (15 minutes) 
  - 🚀 Deep Work (90 minutes)
- **Background operation**: Timer continues running even when minimized
- **Task association**: Link timer sessions to specific tasks
- **Session tracking**: Save completed sessions with focus levels
- **Visual progress**: Circular progress indicator with gradient colors
- **Notifications**: Browser notifications when timer completes
- **Daily statistics**: Track completed sessions per day
- **Focus level rating**: Rate your concentration after each session

### 💾 Data Management
- Full local storage with IndexedDB
- Export/import all data as JSON
- Database reset and management tools
- No data limits or restrictions

## 🎯 Productivity Workflow

### 1. **Plan with Notes**
```markdown
Use the notes system to:
- Brainstorm project ideas
- Write meeting notes  
- Create documentation
- Track research findings
- Format with **bold**, _italic_, and links
```

### 2. **Set Clear Goals**
- Define measurable targets for each section
- Track progress with visual indicators
- Set realistic deadlines

### 3. **Break Down Tasks**
- Organize tasks by type (Feature, Bug, Content, etc.)
- Set priorities and due dates
- Use recurring tasks for regular work

### 4. **Focus with Pomodoro**
- Start focus sessions directly from tasks
- Track your productive time
- Take regular breaks to maintain focus

### 5. **Review & Adjust**
- Monitor progress across all projects
- Update goals and tasks as needed
- Use notes to document learnings

## 🚨 Important Note

This is a **local-first application**. When deployed to services like Vercel, data persistence is limited to browser sessions. For full functionality with persistent data, run the application locally.

## 🆕 Latest Updates

### **Version 2.0** - Productivity Suite
- ✅ **Rich Notes System** - Full markdown-style formatting
- ✅ **Pomodoro Focus Timer** - Built-in productivity timer
- ✅ **Enhanced UI** - Better spacing and visual design
- ✅ **Background Timer** - Continues running when minimized
- ✅ **URL Detection** - Automatic link highlighting in notes
- ✅ **Session Tracking** - Save and review focus sessions

## 🤝 Contributing

While this is primarily a personal tool, suggestions and improvements are welcome! Feel free to fork and adapt to your own workflow.

## 📄 License

MIT License - feel free to use, modify, and distribute as you see fit.

---

**Start managing your projects your way - no accounts, no subscriptions, no compromises.**

Built with ❤️ for developers who want to ship great things without the tooling overhead.

---

## 🔗 Connect with Jayamesh

**Love this tool? Check out what else we're building:**

🌐 Website: https://www.jayamesh.com
📸 Instagram: https://instagram.com/jayamesh_devtech
🐙 GitHub: https://github.com/Renishchandera/Jayamesh-PM

---

**Built with ❤️ by [Jayamesh Studios](https://jayamesh.com) - Empowering creators worldwide.**

*"We don't just build software; we build the tools that help you build your dreams."*

---

**Ready to take control of your projects?** 🚀

Clone the repository and start being productive today!