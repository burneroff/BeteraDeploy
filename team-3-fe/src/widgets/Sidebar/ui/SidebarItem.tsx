import { LinkTab } from '@/shared/components/LinkTab/ui/LinkTab';
import type { SidebarItem as SidebarItemType, SidebarKey } from '../model/types';
 
interface SidebarItemProps {
  item: SidebarItemType;
  handleClick: (key: SidebarKey) => void;
  isAdmin: boolean;
  value: SidebarKey;
  active: boolean;
}

export const SidebarItem = ({
  item,
  isAdmin,
  value,
  handleClick,
  active,
}: SidebarItemProps) => {
  if (item.key === 'admin' && !isAdmin) return null;
  const Icon = item.Icon;
  return (
    <LinkTab
      label={item.label}
      value={value}
      to={`/${item.key}`}
      onClick={() => handleClick(item.key)}
      active={active}
      icon={Icon ? <Icon /> : undefined}
    />
  );
};
