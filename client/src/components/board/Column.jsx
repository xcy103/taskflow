import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableCard } from './SortableCard';

// A list rendered as a column: sortable cards + an add-card form.
// The card container is a droppable (id = list id) so empty lists still accept drops.
export function Column({ list, onAddCard, onEditCard, onDeleteCard }) {
  const { setNodeRef } = useDroppable({ id: list._id });
  const [title, setTitle] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCard(list._id, title.trim());
    setTitle('');
  }

  return (
    <section className="w-72 shrink-0 rounded-lg bg-slate-200/70 p-3">
      <h3 className="mb-2 px-1 font-medium">{list.title}</h3>

      <SortableContext items={list.cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="min-h-[12px] space-y-2">
          {list.cards.map((card) => (
            <SortableCard key={card._id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
          ))}
        </div>
      </SortableContext>

      <form onSubmit={submit} className="mt-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="+ Add a card"
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </form>
    </section>
  );
}
