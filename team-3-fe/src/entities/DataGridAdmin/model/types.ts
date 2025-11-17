import type { User } from '@/shared/api/users/types.ts';

export type UserDataGrid = Omit<
  User,
  'created_at' | 'changed_at' | 'initials' | 'photoPath' | 'documentsID'
>;

export type PartialUserDataGrid = Omit<UserDataGrid, 'id' | 'isVerified' | 'role'>;

export interface AdminGridState {
  rows: UserDataGrid[];
  setRows: (rows: UserDataGrid[]) => void;
  handleRoleChange: (userId: number, roleId: number, roleName?: string) => Promise<void>;
  addUser: (newUser: PartialUserDataGrid) => void;
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
}
