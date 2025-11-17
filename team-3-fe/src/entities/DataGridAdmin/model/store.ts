import { create } from 'zustand';
import type {
  AdminGridState,
  PartialUserDataGrid,
  UserDataGrid,
} from '@/entities/DataGridAdmin/model/types.ts';
import type { GridRowSelectionModel } from '@mui/x-data-grid';
import { getUsers } from '@/shared/api/users/getUsers';
import { updateUserRole } from '@/shared/api/users/updateUserRole.ts';
import { notify } from '@/app/providers/NotificationProvider/notificationService.ts';

interface AdminGridStore extends AdminGridState {
  // flags
  isLoading: boolean;
  error: string | null;

  // поиск
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // данные
  rows: UserDataGrid[];
  filteredRows: UserDataGrid[];
  setRows: (rows: UserDataGrid[]) => void;
  filterRows: () => void;
  fetchUsers: () => Promise<void>;

  // выбор строк
  rowSelectionModel: GridRowSelectionModel;
  setRowSelectionModel: (model: GridRowSelectionModel) => void;

  // действия
  addUser: (newUser: PartialUserDataGrid) => void;
  deleteUser: (id: number) => void;
  handleRoleChange: (userId: number, roleId: number) => Promise<void>;

  // попап
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
}

// утилита фильтра (единая точка)
const applyFilter = (rows: UserDataGrid[], query: string): UserDataGrid[] => {
  const q = query.trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((row) => {
    const parts: Array<string> = [
      String(row.id ?? ''),
      row.first_name ?? '',
      row.last_name ?? '',
      row.email ?? '',
    ];
    return parts.some((p) => p.toLowerCase().includes(q));
  });
};

export const useAdminGridStore = create<AdminGridStore>((set, get) => ({
  // -------------------- начальное состояние --------------------
  rows: [],
  filteredRows: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const { rows } = get();
    set({ filteredRows: applyFilter(rows, query) });
  },

  setRows: (rows) => {
    const { searchQuery } = get();
    set({
      rows,
      filteredRows: applyFilter(rows, searchQuery),
    });
  },

  filterRows: () => {
    const { rows, searchQuery } = get();
    set({ filteredRows: applyFilter(rows, searchQuery) });
  },

  // -------------------- выбор строк --------------------
  rowSelectionModel: {
    type: 'include',
    ids: new Set<number>(),
  },
  setRowSelectionModel: (model) => set({ rowSelectionModel: model }),

  // -------------------- действия --------------------
  handleRoleChange: async (userId, roleId) => {
    const { rows, searchQuery } = get();

    const idx = rows.findIndex((r) => r.id === userId);
    if (idx < 0) return;

    const optimistic = [...rows];
    optimistic[idx] = { ...optimistic[idx], role_id: roleId };
    set({
      rows: optimistic,
      filteredRows: applyFilter(optimistic, searchQuery),
    });

    try {
      await updateUserRole(userId, roleId);
      notify({ message: 'Роль обновлена', severity: 'success' });
    } catch (e: any) {
      // откат
      set({
        rows,
        filteredRows: applyFilter(rows, searchQuery),
      });
      notify({ message: e?.message ?? 'Не удалось обновить роль', severity: 'error' });
    }
  },

  addUser: (newUser) =>
    set((state) => {
      const nextId = state.rows.length ? Math.max(...state.rows.map((r) => r.id)) + 1 : 1;
      const row: UserDataGrid = { ...newUser, id: nextId } as UserDataGrid;

      const rows = [...state.rows, row];
      return {
        rows,
        filteredRows: applyFilter(rows, state.searchQuery),
      };
    }),

  deleteUser: (id) =>
    set((state) => {
      const rows = state.rows.filter((r) => r.id !== id);
      return {
        rows,
        filteredRows: applyFilter(rows, state.searchQuery),
      };
    }),

  // -------------------- загрузка --------------------
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await getUsers();

      // приводим к UserDataGrid, отбрасывая лишнее
      const userDataGrid: UserDataGrid[] = users.map(
        ({ created_at, changed_at, initials, photoPath, documentsID, ...rest }) => rest,
      );

      const { searchQuery } = get();
      set({
        rows: userDataGrid,
        filteredRows: applyFilter(userDataGrid, searchQuery),
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || 'Ошибка загрузки пользователей',
        isLoading: false,
      });
    }
  },

  // -------------------- попап --------------------
  popupOpen: false,
  setPopupOpen: (open) => set({ popupOpen: open }),
}));
