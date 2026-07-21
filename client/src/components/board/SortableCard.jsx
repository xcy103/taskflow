import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// A draggable card with inline title editing (double-click or ✎) and delete (✕).
export function SortableCard({ card, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  function save() {
    setEditing(false);
    const next = title.trim();
    if (next && next !== card.title) onEdit(card._id, next);
    else setTitle(card.title);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-md bg-white p-3 text-sm shadow-sm"
    >
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') {
              setTitle(card.title);
              setEditing(false);
            }
          }}
          className="w-full rounded border border-indigo-300 px-1 py-0.5 focus:outline-none"
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <span
            {...attributes}
            {...listeners}
            onDoubleClick={() => setEditing(true)}
            className="flex-1 cursor-grab"
          >
            {card.title}
          </span>
          <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
            <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-slate-700" aria-label="Edit card">
              ✎
            </button>
            <button onClick={() => onDelete(card._id)} className="text-xs text-slate-400 hover:text-red-600" aria-label="Delete card">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
