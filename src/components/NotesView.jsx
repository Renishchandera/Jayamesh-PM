// components/NotesView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { useUI } from '../store';

export default function NotesView({ sections, selectedSectionId, onSelectSection, refreshData }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: ''
  });

  const { selectedProjectId } = useUI();

  useEffect(() => {
    loadNotes();
  }, [selectedSectionId, selectedProjectId]);

  const loadNotes = async () => {
    try {
      let allNotes;
      if (selectedSectionId) {
        allNotes = await db.notes
          .where('sectionId')
          .equals(selectedSectionId)
          .reverse()
          .sortBy('updatedAt');
      } else if (selectedProjectId) {
        allNotes = await db.notes
          .where('projectId')
          .equals(selectedProjectId)
          .reverse()
          .sortBy('updatedAt');
      } else {
        allNotes = await db.notes
          .reverse()
          .sortBy('updatedAt');
      }
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !selectedSectionId) return;

    try {
      const section = sections.find(s => s.id === selectedSectionId);
      if (!section) return;

      await db.notes.add({
        projectId: section.projectId,
        sectionId: selectedSectionId,
        title: newNote.title.trim(),
        content: newNote.content,
        tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setNewNote({ title: '', content: '', tags: '' });
      refreshData();
      loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const updateNote = async (noteId, updates) => {
    try {
      await db.notes.update(noteId, {
        ...updates,
        updatedAt: new Date()
      });
      loadNotes();
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote({ ...selectedNote, ...updates });
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (confirm('Delete this note?')) {
      try {
        await db.notes.delete(noteId);
        if (selectedNote && selectedNote.id === noteId) {
          setSelectedNote(null);
        }
        loadNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const togglePin = async (noteId, currentlyPinned) => {
    await updateNote(noteId, { isPinned: !currentlyPinned });
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const otherNotes = filteredNotes.filter(note => !note.isPinned);

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Sidebar - Made more compact */}
      <div className="w-64 border-r border-slate-700 bg-slate-800/30 backdrop-blur flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <span className="text-white text-sm">📝</span>
              </div>
              <h2 className="text-lg font-bold text-white">Notes</h2>
            </div>
            <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs font-semibold">
              {notes.length}
            </span>
          </div>

          {/* Section Selector */}
          <div className="mb-3">
            <select
              value={selectedSectionId || ''}
              onChange={(e) => onSelectSection(parseInt(e.target.value))}
              className="w-full p-2 text-sm rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none backdrop-blur"
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute left-2 top-2 text-slate-400 text-sm">🔍</div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-8 text-sm rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none backdrop-blur"
            />
          </div>
        </div>

        {/* Add Note Form */}
        {selectedSectionId && (
          <div className="p-3 border-b border-slate-700 bg-slate-700/20">
            <form onSubmit={createNote} className="space-y-2">
              <input
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="Note title..."
                className="w-full p-2 text-sm rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none backdrop-blur"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition-all text-sm flex items-center justify-center gap-1"
              >
                <span>+</span>
                New Note
              </button>
            </form>
          </div>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-auto">
          {pinnedNotes.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3 bg-yellow-500 rounded-full"></div>
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Pinned</div>
              </div>
              <div className="space-y-1">
                {pinnedNotes.map(note => (
                  <NoteListItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNote?.id === note.id}
                    onSelect={setSelectedNote}
                    onTogglePin={togglePin}
                    sections={sections}
                  />
                ))}
              </div>
            </div>
          )}

          {otherNotes.length > 0 && (
            <div className="p-3">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-3 bg-slate-600 rounded-full"></div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">All Notes</div>
                </div>
              )}
              <div className="space-y-1">
                {otherNotes.map(note => (
                  <NoteListItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNote?.id === note.id}
                    onSelect={setSelectedNote}
                    onTogglePin={togglePin}
                    sections={sections}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500">
              <div className="text-4xl mb-3 opacity-50">📝</div>
              <p className="text-slate-500 text-sm text-center">
                {selectedSectionId ? 'No notes in this section' : 'No notes found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note Editor - Made more spacious */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            {/* Compact Editor Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/30 backdrop-blur">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {isEditing ? (
                      <input
                        value={selectedNote.title}
                        onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                        className="text-xl font-bold bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1 text-white focus:border-blue-500 focus:outline-none w-full backdrop-blur"
                        placeholder="Note title..."
                      />
                    ) : (
                      <h1 className="text-xl font-bold text-white truncate">{selectedNote.title}</h1>
                    )}
                    
                    <button
                      onClick={() => togglePin(selectedNote.id, selectedNote.isPinned)}
                      className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        selectedNote.isPinned 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-600/50'
                      }`}
                      title={selectedNote.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      {selectedNote.isPinned ? '📌' : '📍'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                    {selectedNote.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1 flex-wrap">
                          {selectedNote.tags.map((tag, index) => (
                            <span key={index} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          updateNote(selectedNote.id, {
                            title: selectedNote.title,
                            content: selectedNote.content
                          });
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition-all text-sm"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg font-semibold text-slate-300 hover:bg-slate-600/50 transition-all text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-cyan-600 transition-all text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteNote(selectedNote.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold text-white hover:from-red-600 hover:to-pink-600 transition-all text-sm"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Editor Content - Full height */}
            <div className="flex-1 flex min-h-0">
              {isEditing ? (
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                    className="flex-1 w-full p-6 bg-slate-800/20 border-0 text-white placeholder-slate-400 focus:outline-none resize-none font-sans text-base leading-relaxed"
                    placeholder="Start writing your note... You can use:
• **Bold** text with double asterisks
• _Italic_ text with underscores  
• - Bullet points with dashes
• > Quotes with greater than
• URLs are automatically linked"
                    style={{ minHeight: '400px' }}
                  />
                  <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                    <div className="text-xs text-slate-500">
                      💡 <strong>Formatting Tips:</strong> Use **bold**, _italic_, - lists, {">"} quotes. URLs auto-link.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <div className="max-w-4xl mx-auto p-6">
                    <FormattedNoteContent content={selectedNote.content} />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4 opacity-20">📝</div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">Select a Note</h3>
              <p className="text-slate-500">
                Choose a note from the sidebar to view or edit
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Note List Item Component
function NoteListItem({ note, isSelected, onSelect, onTogglePin, sections }) {
  const section = sections.find(s => s.id === note.sectionId);
  
  const formatPreview = (content) => {
    if (!content) return '';
    let preview = content.slice(0, 80);
    if (content.length > 80) preview += '...';
    return preview;
  };

  const preview = formatPreview(note.content);

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all border group ${
        isSelected
          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30'
          : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50'
      }`}
      onClick={() => onSelect(note)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-tight truncate">
            {note.title}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note.id, note.isPinned);
          }}
          className={`p-1 rounded transition-all ml-1 flex-shrink-0 ${
            note.isPinned 
              ? 'text-yellow-400' 
              : 'text-slate-400 hover:text-slate-300'
          }`}
          title={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          {note.isPinned ? '📌' : '📍'}
        </button>
      </div>
      
      {preview && (
        <p className="text-slate-400 text-xs mb-2 leading-relaxed line-clamp-2">
          {preview}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {section && (
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: section.color }}
              title={section.name}
            />
          )}
          <span className="text-slate-500 text-xs">
            {new Date(note.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
        
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 1).map((tag, index) => (
              <span 
                key={index} 
                className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"
                title={tag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Fixed FormattedNoteContent Component
function FormattedNoteContent({ content }) {
  if (!content) {
    return (
      <div className="text-slate-500 italic text-center py-8">
        No content yet. Click edit to start writing...
      </div>
    );
  }

  const formatContent = (text) => {
    return text.split('\n').map((line, index) => {
      if (!line.trim()) {
        return <div key={index} className="h-3" />;
      }

      // Check for bullet points (must start with dash and space)
      if (line.trim().startsWith('- ')) {
        return (
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className="text-blue-400 mt-1 flex-shrink-0 text-sm">•</span>
            <span className="flex-1 text-slate-200">{formatLine(line.replace('- ', ''))}</span>
          </div>
        );
      }

      // Check for quotes (must start with > and space)
      if (line.trim().startsWith('> ')) {
        return (
          <div key={index} className="border-l-3 border-blue-500/50 pl-3 my-2 text-slate-300 italic">
            {formatLine(line.replace('> ', ''))}
          </div>
        );
      }

      // Regular paragraph
      return (
        <div key={index} className="mb-2 text-slate-200">
          {formatLine(line)}
        </div>
      );
    });
  };

  const formatLine = (line) => {
    let formattedLine = [];
    let currentIndex = 0;

    // Process bold text first (using **)
    const boldParts = line.split(/(\*\*.*?\*\*)/g);
    
    boldParts.forEach((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // This is bold text
        const boldContent = part.slice(2, -2);
        
        // Process italic within bold
        const italicParts = boldContent.split(/(_.*?_)/g);
        italicParts.forEach((italicPart, italicIndex) => {
          if (italicPart.startsWith('_') && italicPart.endsWith('_')) {
            formattedLine.push(
              <em key={currentIndex++} className="text-white italic font-semibold">
                {italicPart.slice(1, -1)}
              </em>
            );
          } else if (italicPart) {
            formattedLine.push(
              <strong key={currentIndex++} className="text-white font-semibold">
                {italicPart}
              </strong>
            );
          }
        });
      } else {
        // Process regular text with italic and URLs
        const italicParts = part.split(/(_.*?_)/g);
        
        italicParts.forEach((italicPart, italicIndex) => {
          if (italicPart.startsWith('_') && italicPart.endsWith('_')) {
            // Italic text
            formattedLine.push(
              <em key={currentIndex++} className="text-slate-300 italic">
                {italicPart.slice(1, -1)}
              </em>
            );
          } else {
            // Process URLs in regular text
            const urlParts = italicPart.split(/(https?:\/\/[^\s]+)/g);
            
            urlParts.forEach((urlPart, urlIndex) => {
              if (urlPart.match(/^https?:\/\/[^\s]+$/)) {
                // URL
                formattedLine.push(
                  <a 
                    key={currentIndex++}
                    href={urlPart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-words"
                  >
                    {urlPart}
                  </a>
                );
              } else if (urlPart) {
                // Regular text
                formattedLine.push(
                  <span key={currentIndex++} className="text-slate-200">
                    {urlPart}
                  </span>
                );
              }
            });
          }
        });
      }
    });

    return formattedLine;
  };

  return (
    <div className="text-slate-200 text-base leading-relaxed font-sans whitespace-pre-wrap">
      {formatContent(content)}
    </div>
  );
}