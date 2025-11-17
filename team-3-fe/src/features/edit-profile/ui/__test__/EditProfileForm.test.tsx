import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileForm } from '../EditProfileForm';

// ------- hoisted mocks (во избежание "Cannot access ... before initialization") -------
const notifyMock = vi.hoisted(() => vi.fn());
const setUserMock = vi.hoisted(() => vi.fn());
const uploadPhotoMock = vi.hoisted(() => vi.fn());
const updateProfileMock = vi.hoisted(() => vi.fn());

// ------- module mocks -------
vi.mock('@/entities/user/model/store.ts', () => ({
  useAuthStore: () => ({
    user: { id: 1, first_name: 'Иван', last_name: 'Иванов', photoPath: 'photo.png' },
    setUser: setUserMock,
  }),
}));

vi.mock('@/shared/queries', () => ({
  useUploadPhoto: () => ({
    mutateAsync: uploadPhotoMock,
    isPending: false,
  }),
  useUpdateProfile: () => ({
    mutateAsync: updateProfileMock,
    isPending: false,
  }),
}));

vi.mock('@/app/providers/NotificationProvider/notificationService', () => ({
  notify: notifyMock,
}));

// Стабим ConfirmDeleteModal, чтобы не ловить порталы и тексты из MUI.
// Рендерим простую кнопку "Подтвердить" когда open=true.
vi.mock('@/shared/components/ConfirmDeleteModal/ConfirmDeleteModal', () => ({
  ConfirmDeleteModal: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? <button onClick={onConfirm}>Подтвердить</button> : null,
}));

describe('EditProfileForm', () => {
  beforeEach(() => {
    setUserMock.mockReset();
    uploadPhotoMock.mockReset();
    updateProfileMock.mockReset();
    notifyMock.mockReset();
  });

  it('рендерит поля формы', () => {
    render(<EditProfileForm />);
    expect(screen.getByLabelText(/Имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Фамилия/i)).toBeInTheDocument();
    expect(screen.getByText(/Сохранить/i)).toBeInTheDocument();
  });

  it('сохраняет профиль при сабмите', async () => {
    updateProfileMock.mockResolvedValueOnce({});
    render(<EditProfileForm />);

    fireEvent.change(screen.getByLabelText(/Имя/i), { target: { value: 'Пётр' } });
    fireEvent.change(screen.getByLabelText(/Фамилия/i), { target: { value: 'Петров' } });

    await waitFor(() => expect(screen.getByText(/Сохранить/i)).not.toBeDisabled());
    fireEvent.click(screen.getByText(/Сохранить/i));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith({
        user_id: 1,
        first_name: 'Пётр',
        last_name: 'Петров',
        photo_path: 'photo.png',
      });
      expect(setUserMock).toHaveBeenCalled();
      expect(notifyMock).toHaveBeenCalledWith({ message: 'Профиль сохранён', severity: 'success' });
    });
  });

  it('удаляет фото через ConfirmDeleteModal', async () => {
    render(<EditProfileForm />);

    // В блоке с фото первая кнопка — загрузка (label role=button), вторая — удаление (IconButton)
    const buttons = screen.getAllByRole('button');
    const deleteBtn = buttons[1]; // в твоей разметке именно вторым идёт IconButton с DeleteIcon
    fireEvent.click(deleteBtn);

    // Наш стаб модалки рисует одну кнопку "Подтвердить"
    const confirm = await screen.findByText(/Подтвердить/i);
    fireEvent.click(confirm);

    await waitFor(() => {
      expect(notifyMock).toHaveBeenCalledWith({ message: 'Фото удалено', severity: 'info' });
    });
  });
});
