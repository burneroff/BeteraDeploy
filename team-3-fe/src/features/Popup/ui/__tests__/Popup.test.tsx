import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Popup } from '../Popup';

 
vi.mock('@/entities/DataGridAdmin', () => ({
  useAdminGridStore: () => ({
    popupOpen: true,
    setPopupOpen: vi.fn(),
    addUser: vi.fn(),
  }),
}));

 
vi.mock('@/shared/components/RoleSelect', () => ({
  RoleSelect: (props: any) => (
    <select
      aria-label="role"
      data-testid="role-select"
      value={props.value ?? ''}
      onChange={(e) => props.onChange(Number(e.target.value))}
      disabled={props.disabled}
    >
      <option value="">—</option>
      <option value="1">Администратор</option>
      <option value="2">Модератор</option>
      <option value="3">Пользователь</option>
      <option value="4">Гость</option>
    </select>
  ),
}));

 
const mutateMock = vi.fn();
vi.mock('@/shared/queries', () => ({
  useRegister: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

describe('Popup component', () => {
  beforeEach(() => {
    mutateMock.mockReset();
  });

  it('рендерит поля формы', () => {
    render(<Popup />);
    expect(screen.getByLabelText(/Имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Фамилия/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Добавить/i)).toBeInTheDocument();
    expect(screen.getByTestId('role-select')).toBeInTheDocument();
  });

  it('вызывает registerUser при сабмите', async () => {
    render(<Popup />);

    fireEvent.change(screen.getByLabelText(/Имя/i), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByLabelText(/Фамилия/i), { target: { value: 'Иванов' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'ivan@mail.ru' } });
    fireEvent.change(screen.getByTestId('role-select'), { target: { value: '1' } });
 
    const submitBtn = screen.getByText(/Добавить/i);
    await waitFor(() => expect(submitBtn).not.toBeDisabled());

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          first_name: 'Иван',
          last_name: 'Иванов',
          email: 'ivan@mail.ru',
          role_id: 1,
        },
        expect.any(Object)
      );
    });
  });

  it('показывает ошибку email при 409', async () => {
    mutateMock.mockImplementation((_data, { onError }) => {
      onError({ response: { status: 409 } });
    });

    render(<Popup />);

    fireEvent.change(screen.getByLabelText(/Имя/i), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByLabelText(/Фамилия/i), { target: { value: 'Иванов' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'ivan@mail.ru' } });
    fireEvent.change(screen.getByTestId('role-select'), { target: { value: '1' } });

 
    const submitBtn = screen.getByText(/Добавить/i);
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

 
    await waitFor(() => {
      expect(
        screen.getByText(/Данный email уже зарегистрирован в системе/i)
      ).toBeInTheDocument();
    });
  });
});
