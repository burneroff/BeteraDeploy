import { create } from 'zustand';

export type RoleOption = { id: number; name: string };

const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  { id: 1, name: 'Администратор' },
  { id: 2, name: 'HR-специалист' },
  { id: 3, name: 'Менеджер' },
  { id: 4, name: 'Специалист' },
];

interface RolesState {
  roles: RoleOption[];
  getRoleById: (id: number) => RoleOption | null;
  addRole: (role: RoleOption) => void;
}

export const useRolesStore = create<RolesState>((set, get) => ({
  roles: DEFAULT_ROLE_OPTIONS,

  getRoleById: (id: number) => get().roles.find((role) => role.id === id) || null,

  addRole: (role: RoleOption) => {
    const existing = get().roles.some((r) => r.id === role.id);
    if (existing) return; // не добавляем дубликаты
    set({ roles: [...get().roles, role] });
  },
}));
