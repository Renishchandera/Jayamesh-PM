// components/PomodoroTimer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { useUI } from '../store';

const POMODORO_PRESETS = {
  pomodoro: { minutes: 25, label: '🍅 Pomodoro' },
  shortBreak: { minutes: 5, label: '☕ Short Break' },
  longBreak: { minutes: 15, label: '🌴 Long Break' },
  deepWork: { minutes: 90, label: '🚀 Deep Work' }
};

export default function PomodoroTimer({ pomodoroState, onStateChange, onReset, onClose }) {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [focusLevel, setFocusLevel] = useState(3);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  const { selectedProjectId } = useUI();
  const audioRef = useRef(null);

  const { isActive, timeLeft, mode, sessionsCompleted } = pomodoroState;

  useEffect(() => {
    loadTasks();
  }, [selectedProjectId]);

  const loadTasks = async () => {
    if (selectedProjectId) {
      const projectTasks = await db.tasks.where('projectId').equals(selectedProjectId).toArray();
      setTasks(projectTasks);
    }
  };

  const handleStart = () => {
    onStateChange({ isActive: true });
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handlePause = () => {
    onStateChange({ isActive: false });
  };

  const handleReset = () => {
    onReset();
  };

  const handleModeChange = (newMode) => {
    if (!isActive) {
      onStateChange({ 
        mode: newMode,
        timeLeft: POMODORO_PRESETS[newMode].minutes * 60
      });
    }
  };

  const saveSession = async (completed, notes = '') => {
    try {
      await db.pomodoroSessions.add({
        projectId: selectedProjectId,
        taskId: selectedTaskId,
        duration: POMODORO_PRESETS[mode].minutes,
        completed,
        interrupted: !completed,
        notes: notes || sessionNotes,
        focusLevel,
        startTime: new Date(Date.now() - POMODORO_PRESETS[mode].minutes * 60 * 1000),
        endTime: new Date()
      });
      
      setSessionNotes('');
      setShowSessionModal(false);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = POMODORO_PRESETS[mode].minutes * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getTimerColor = () => {
    if (mode === 'pomodoro') return 'from-red-500 to-orange-500';
    if (mode === 'shortBreak') return 'from-green-500 to-emerald-500';
    if (mode === 'longBreak') return 'from-blue-500 to-cyan-500';
    return 'from-purple-500 to-pink-500';
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Main Timer */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-80 overflow-hidden">
        {/* Timer Header */}
        <div className="p-4 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">Focus Timer</h3>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-slate-600 rounded-full text-xs text-slate-300">
                {sessionsCompleted} today
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-400 hover:text-white"
                title="Hide Timer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-6 text-center">
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={`text-${getTimerColor().split('-')[1]}-500 transition-all duration-1000`}
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold bg-gradient-to-r ${getTimerColor()} bg-clip-text text-transparent mb-2`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-slate-400 text-sm">
                  {POMODORO_PRESETS[mode].label}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {Object.entries(POMODORO_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                disabled={isActive}
                className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                  mode === key 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Task Selector */}
          {selectedProjectId && (
            <div className="mb-4">
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a task...</option>
                {tasks.filter(t => t.status !== 'done').map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                Start Focus
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold text-white hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Pause
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-bold text-white hover:from-red-600 hover:to-pink-600 transition-all"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Completion Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Session Complete! 🎉</h3>
              <p className="text-slate-400 mt-1">Great job on your focus session!</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How focused were you?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setFocusLevel(level)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                        focusLevel === level
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {level} {level === 1 ? '😴' : level === 5 ? '🚀' : '💪'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session Notes (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="How did the session go? Any insights?"
                  rows="3"
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => saveSession(false, 'Session interrupted')}
                  className="flex-1 py-3 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => saveSession(true, sessionNotes)}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  Save Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio elements */}
      <audio ref={audioRef} src="/sounds/complete.mp3" preload="auto" />
    </div>
  );
}