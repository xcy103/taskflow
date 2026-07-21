import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { SortableCard } from './SortableCard';

// useSortable needs to live inside a DndContext + SortableContext.
function renderCard(props) {
  return render(
    <DndContext>
      <SortableContext items={['c1']}>
        <SortableCard card={{ _id: 'c1', title: 'Task' }} {...props} />
      </SortableContext>
    </DndContext>
  );
}

describe('SortableCard', () => {
  it('edits the title on double-click and calls onEdit', async () => {
    const onEdit = vi.fn();
    renderCard({ onEdit, onDelete: vi.fn() });

    fireEvent.doubleClick(screen.getByText('Task'));
    const input = screen.getByDisplayValue('Task');
    fireEvent.change(input, { target: { value: 'Task 2' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onEdit).toHaveBeenCalledWith('c1', 'Task 2');
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn();
    renderCard({ onEdit: vi.fn(), onDelete });

    fireEvent.click(screen.getByLabelText(/delete card/i));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });
});
