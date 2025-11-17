import type { ComponentType, SVGProps } from 'react';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SidebarKey = 'admin' | 'documents' | 'test';

export interface SidebarItem {
  key: SidebarKey;
  label: string;
  type: 'accordion' | 'tab';
  path: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
}
