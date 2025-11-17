import { DocumentIcon } from '@/shared/icons/DocumentIcon';
import { AdminIcon } from '@/shared/icons/AdminIcon';
import type { SidebarItem } from './types';
import { useMemo } from 'react';
import { useAuthStore } from '@/entities/user/model/store.ts';

export const useSidebarItems = () => {
  const { user } = useAuthStore(); // может прийти "Администратор" или "admin"

  const isAdmin = useMemo(() => {
    return user?.role_id === 1;
  }, [user?.role_id]);

  const { tabs, accordions } = useMemo(() => {
    const tabs: SidebarItem[] = [];
    const accordions: SidebarItem[] = [
      {
        label: 'Документы',
        key: 'documents',
        type: 'accordion',
        path: '/documents',
        Icon: DocumentIcon,
      },
    ];

    if (isAdmin) {
      tabs.push({
        label: 'Администрирование',
        key: 'admin',
        type: 'tab',
        path: '/admin',
        Icon: AdminIcon,
      });
    }

    return { tabs, accordions };
  }, [isAdmin]);

  return { tabs, accordions, isAdmin };
};
