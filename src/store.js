import { create } from 'zustand';

export const useUI = create((set, get) => ({
  // Navigation
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  
  selectedSectionId: null,
  setSelectedSectionId: (id) => set({ selectedSectionId: id }),
  
  // Modals
  quickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),
  
  projectModalOpen: false,
  setProjectModalOpen: (open) => set({ projectModalOpen: open }),
  
  sectionModalOpen: false,
  setSectionModalOpen: (open) => set({ sectionModalOpen: open }),
  
  goalModalOpen: false,
  setGoalModalOpen: (open) => set({ goalModalOpen: open }),
  
  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
    viewMode: 'sections', // 'sections', 'goals', 'tasks', 'notes'
  setViewMode: (mode) => set({ viewMode: mode }),
}));

// Keyboard shortcuts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      useUI.getState().setQuickCaptureOpen(true);
    }
    if (e.key === 'Escape') {
      const { setQuickCaptureOpen, setProjectModalOpen, setSectionModalOpen, setGoalModalOpen } = useUI.getState();
      setQuickCaptureOpen(false);
      setProjectModalOpen(false);
      setSectionModalOpen(false);
      setGoalModalOpen(false);
    }
  });
}