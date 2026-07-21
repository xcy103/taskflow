import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BoardsPage } from './BoardsPage';

const getMock = vi.fn();
const postMock = vi.fn();

vi.mock('../api/client', () => ({
  api: {
    get: (...args) => getMock(...args),
    post: (...args) => postMock(...args),
    delete: vi.fn(),
  },
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Alice' }, logout: vi.fn() }),
}));

beforeEach(() => {
  getMock.mockReset();
  postMock.mockReset();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <BoardsPage />
    </MemoryRouter>
  );
}

describe('BoardsPage', () => {
  it('renders the boards returned by the API', async () => {
    getMock.mockResolvedValue({ boards: [{ _id: '1', title: 'Sprint 1' }] });
    renderPage();

    expect(await screen.findByText('Sprint 1')).toBeInTheDocument();
  });

  it('creates a board and shows it', async () => {
    getMock.mockResolvedValue({ boards: [] });
    postMock.mockResolvedValue({ board: { _id: '2', title: 'New Board' } });
    renderPage();

    await screen.findByText(/no boards yet/i);
    fireEvent.change(screen.getByPlaceholderText(/new board title/i), {
      target: { value: 'New Board' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add board/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/boards', { title: 'New Board' }));
    expect(await screen.findByText('New Board')).toBeInTheDocument();
  });
});
