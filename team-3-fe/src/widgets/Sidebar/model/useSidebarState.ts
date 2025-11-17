// src/widgets/Sidebar/model/useSidebarState.ts
import { useEffect, useMemo, useState } from 'react';
import type { SidebarKey, SidebarItem } from './types';
import { useSidebarItems } from '@/widgets/Sidebar/model/useSidebarItems';

export const useSidebarState = () => {
  const { tabs, accordions, isAdmin } = useSidebarItems();

  // Плоский список (для поиска по key)
  const items: SidebarItem[] = useMemo(
    () => [...accordions, ...tabs],
    [tabs, accordions]
  );

  // Дефолтные активные элементы на основании роли
  const defaults = useMemo(() => {
    if (isAdmin) {
      return {
        activeTabKey: 'admin' as SidebarKey | false,
        activeAccordionKey: null as SidebarKey | null,
        isExpanded: false,
      };
    }
    const firstAccordionKey = accordions[0]?.key ?? null;
    return {
      activeTabKey: false as SidebarKey | false,
      activeAccordionKey: firstAccordionKey,
      isExpanded: Boolean(firstAccordionKey),
    };
  }, [isAdmin, accordions]);

  const [isExpanded, setIsExpanded] = useState(defaults.isExpanded);
  const [activeTabKey, setActiveTabKey] = useState<SidebarKey | false>(defaults.activeTabKey);
  const [activeAccordionKey, setActiveAccordionKey] =
    useState<SidebarKey | null>(defaults.activeAccordionKey);

  // Синхронизация при смене роли/списка пунктов
  useEffect(() => {
    setIsExpanded(defaults.isExpanded);
    setActiveTabKey(defaults.activeTabKey);
    setActiveAccordionKey(defaults.activeAccordionKey);
  }, [defaults.isExpanded, defaults.activeTabKey, defaults.activeAccordionKey]);

  const handleClick = (key: SidebarKey) => {
    const item = items.find((i) => i.key === key);
    if (!item) return;

    if (item.type === 'accordion') {
      if (activeAccordionKey === key && isExpanded) {
        setIsExpanded(false);
      } else {
        setActiveAccordionKey(key);
        setIsExpanded(true);
      }
      setActiveTabKey(false);
    } else {
      setActiveTabKey(key);
      setIsExpanded(false);
      setActiveAccordionKey(null);
    }
  };

  return {
    items,
    tabs,
    accordions,
    isExpanded,
    activeTabKey,
    activeAccordionKey,
    handleClick,
    isAdmin,
  };
};
