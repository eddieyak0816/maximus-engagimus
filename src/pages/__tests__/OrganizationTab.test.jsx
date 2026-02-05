import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Settings from '../Settings';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'owner-1', email: 'owner@example.com' },
    profile: { id: 'owner-1', role: 'owner', full_name: 'Owner' },
    isOwner: true,
    refreshProfile: vi.fn(),
  })),
}));

vi.mock('../../lib/supabase', () => ({
  getOrganizationMembers: vi.fn(async () => [
    { id: 'owner-1', email: 'owner@example.com', full_name: 'Owner', role: 'owner' },
    { id: 'member-1', email: 'member@example.com', full_name: 'Member', role: 'member' },
  ]),
  updateUserRole: vi.fn(async () => ({ id: 'member-1', role: 'admin' })),
  removeOrganizationMember: vi.fn(async () => ({ success: true })),
  getAIProviders: vi.fn(async () => []),
  getAIChatLinks: vi.fn(async () => []),
  getPlatformPrompts: vi.fn(async () => []),
}));

describe('Organization Team Members', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows an owner to change another member role', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/organization']}>
        <Routes>
          <Route path="/settings/:tab" element={<Settings />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('member@example.com');

    const user = userEvent.setup();
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'admin');

    const confirmBtn = await screen.findByRole('button', { name: 'Change' });
    await user.click(confirmBtn);

    const { updateUserRole } = await import('../../lib/supabase');
    await waitFor(() => expect(updateUserRole).toHaveBeenCalledWith('member-1', 'admin'));
  });

  it('allows an owner to remove a member', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/organization']}>
        <Routes>
          <Route path="/settings/:tab" element={<Settings />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('member@example.com');

    const user = userEvent.setup();
    const removeBtns = screen.getAllByRole('button', { name: 'Remove' });
    const removeBtn = removeBtns[0];
    await user.click(removeBtn);

    const confirmRemoveBtns = await screen.findAllByRole('button', { name: 'Remove' });
    const confirmRemove = confirmRemoveBtns[confirmRemoveBtns.length - 1];
    await user.click(confirmRemove);

    const { removeOrganizationMember } = await import('../../lib/supabase');
    await waitFor(() => expect(removeOrganizationMember).toHaveBeenCalledWith('member-1'));
  });
});

