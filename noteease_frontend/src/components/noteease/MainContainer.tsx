import { component$, useSignal, $, useComputed$ } from '@builder.io/qwik';

/**
 * Color scheme and theme constants
 */
const COLORS = {
  primary: "#4A90E2",     // Primary color for highlights/buttons
  secondary: "#FFFFFF",   // Card/Background color
  accent: "#F5A623",      // Accent/Button color
  textPrimary: "#222D3C", // For readable text on light bg
  textSecondary: "#8591A3",
  pin: "#F5A623",
  archive: "#C1C7CD",
  delete: "#E74C3C"
};

// Mock data for demo
const demoNotes = [
  {
    id: 1,
    title: "Welcome to NoteEase",
    content: "Start jotting down your awesome notes and ideas!",
    pinned: true,
    archived: false,
    category: 'General'
  },
  {
    id: 2,
    title: "Shopping List",
    content: "Eggs, Milk, Bread, Coffee",
    pinned: false,
    archived: false,
    category: 'Personal'
  },
  {
    id: 3,
    title: "Project Tasks",
    content: "Finish Qwik feature, review code, update docs.",
    pinned: false,
    archived: false,
    category: 'Work'
  },
  {
    id: 4,
    title: "Archived Note",
    content: "This note is archived and shown only in archive!",
    pinned: false,
    archived: true,
    category: 'General'
  }
];

/**
 * Filter and organize notes by pinned and category
 */
function organizeNotes(notes: typeof demoNotes, showArchive: boolean, search: string) {
  // Filter by archive
  const filtered = notes.filter(n => (showArchive ? n.archived : !n.archived));
  // Filter by search
  const bySearch = search.trim()
    ? filtered.filter(n =>
        n.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        n.content.toLowerCase().includes(search.trim().toLowerCase())
      )
    : filtered;

  // Split pinned and non-pinned
  const pinned = bySearch.filter(n => n.pinned);
  const byCategory: Record<string, typeof demoNotes> = {};
  bySearch
    .filter(n => !n.pinned)
    .forEach(n => {
      if (!byCategory[n.category]) byCategory[n.category] = [];
      byCategory[n.category].push(n);
    });
  return { pinned, byCategory };
}

// PUBLIC_INTERFACE
export const MainContainer = component$(() => {
  // State/Signal
  const notes = useSignal([...demoNotes]);
  const search = useSignal('');
  const showArchive = useSignal(false);

  // Main derived notes
  const organized = useComputed$(() =>
    organizeNotes(notes.value, showArchive.value, search.value)
  );

  // Actions: these are placeholders, in a real app would have backend/data model
  const onPin = $((id: number) => {
    notes.value = notes.value.map(note =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    );
  });
  const onArchive = $((id: number) => {
    notes.value = notes.value.map(note =>
      note.id === id ? { ...note, archived: !note.archived } : note
    );
  });
  const onDelete = $((id: number) => {
    notes.value = notes.value.filter(note => note.id !== id);
  });
  const onAddNote = $(() => {
    // For demo: insert a new note, in real app open a dialog
    notes.value = [
      ...notes.value,
      {
        id: Math.max(...notes.value.map(n => n.id))+1,
        title: "New Note",
        content: "Start editing...",
        pinned: false,
        archived: false,
        category: "Uncategorized"
      }
    ];
  });

  return (
    <div class="ne-main-bg">
      <div class="ne-container">
        {/* Header + Search Bar */}
        <header class="ne-header">
          <h1 class="ne-title">NoteEase</h1>
          <button class="ne-archive-toggle" onClick$={() => showArchive.value = !showArchive.value}
            style={{
              background: showArchive.value ? COLORS.accent : COLORS.primary,
              color: showArchive.value ? COLORS.secondary : COLORS.secondary,
            }}
            title={showArchive.value ? 'Show Notes' : 'Show Archive'}
          >
            {showArchive.value ? 'Show Notes' : 'Show Archive'}
          </button>
        </header>
        <div class="ne-search-wrapper">
          <input
            class="ne-search"
            type="search"
            placeholder="Search notes..."
            value={search.value}
            onInput$={e => search.value = (e.target as HTMLInputElement).value}
            aria-label="Search notes"
            style={{
              background: COLORS.secondary,
              borderColor: COLORS.primary,
              color: COLORS.textPrimary,
            }}
          />
        </div>

        {/* Pinned Notes */}
        {organized.value.pinned.length > 0 && !showArchive.value && (
          <>
            <h2 class="ne-section-title" style={{ color: COLORS.pin }}>Pinned</h2>
            <div class="ne-notes-section">
              {organized.value.pinned.map(note => (
                <NoteCard
                  note={note}
                  onPin={onPin}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  colorScheme={COLORS}
                  key={note.id}
                />
              ))}
            </div>
          </>
        )}

        {/* Notes by Category */}
        {Object.keys(organized.value.byCategory).length > 0 ? (
          Object.entries(organized.value.byCategory).map(([cat, notes]) => (
            <section key={cat}>
              <h2 class="ne-section-title">{cat}</h2>
              <div class="ne-notes-section">
                {notes.map(note => (
                  <NoteCard
                    note={note}
                    onPin={onPin}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    colorScheme={COLORS}
                    key={note.id}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div class="ne-empty">{showArchive.value ? "No archived notes." : "No notes to display."}</div>
        )}

        {/* Floating Action Button */}
        {!showArchive.value && (
          <button class="ne-fab" title="Add Note" onClick$={onAddNote}>
            <span class="ne-fab-icon">＋</span>
          </button>
        )}
      </div>
    </div>
  );
});

/**
 * NoteCard - reusable note card component
 */
// PUBLIC_INTERFACE
export const NoteCard = component$(
  ({
    note,
    onPin,
    onDelete,
    onArchive,
    colorScheme
  }: {
    note: typeof demoNotes[0];
    onPin: any;
    onDelete: any;
    onArchive: any;
    colorScheme: typeof COLORS;
  }) => {
    return (
      <div class="ne-note-card"
        style={{
          background: colorScheme.secondary,
          borderColor: note.pinned ? colorScheme.pin : colorScheme.primary
        }}
      >
        <div class="ne-note-header">
          <span class="ne-note-title">{note.title}</span>
          <div class="ne-note-actions">
            <button class="ne-note-btn" title={note.pinned ? "Unpin" : "Pin"} style={{ color: colorScheme.pin }}
              onClick$={() => onPin(note.id)}>
              📌
            </button>
            <button class="ne-note-btn" title={note.archived ? "Unarchive" : "Archive"}
              style={{ color: colorScheme.archive }}
              onClick$={() => onArchive(note.id)}>
              {note.archived ? "📂" : "🗄️"}
            </button>
            <button class="ne-note-btn" title="Delete" style={{ color: colorScheme.delete }}
              onClick$={() => onDelete(note.id)}>
              🗑️
            </button>
          </div>
        </div>
        <div class="ne-note-content">
          {note.content.length > 128
            ? note.content.slice(0, 125) + '...'
            : note.content}
        </div>
      </div>
    );
  }
);
