// src/widgets/Sidebar/ui/Sidebar.tsx
import { Box, Drawer, Tabs, useMediaQuery, useTheme } from '@mui/material';
import { useSidebarState } from '@/widgets/Sidebar/model/useSidebarState';
import { AccordionTabDocuments } from '@/features/document-categories';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { SidebarKey } from '../model/types';
import { Logo } from '@/shared/components/Logo';
import { SidebarItem } from '@/widgets/Sidebar/ui/SidebarItem.tsx';
import { useCategoriesStore } from '@/features/document-categories/model/store.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { tabs, accordions, isExpanded, handleClick, isAdmin } = useSidebarState();
  const { fetchCategories } = useCategoriesStore();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up(1350));
  const location = useLocation();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<SidebarKey, HTMLDivElement | null>>(
    {} as Record<SidebarKey, HTMLDivElement | null>,
  );

  // вычисляем активный ключ напрямую из URL
  const urlActiveKey: SidebarKey | null =
    tabs.find((t) => location.pathname.startsWith(t.path))?.key ??
    accordions.find((a) => location.pathname.startsWith(a.path))?.key ??
    null;

  const [indicatorTop, setIndicatorTop] = useState(0);

  const measureTop = () => {
    if (!urlActiveKey || !containerRef.current) {
      setIndicatorTop(0);

      return;
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const el = itemRefs.current[urlActiveKey];
    if (!el) {
      setIndicatorTop(0);

      return;
    }
    const elRect = el.getBoundingClientRect();
    setIndicatorTop(elRect.top - containerRect.top);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useLayoutEffect(() => {
    measureTop();
  }, [urlActiveKey, isExpanded, tabs.length, accordions.length, location.pathname]);

  useEffect(() => {
    const onResize = () => measureTop();
    const onScroll = () => measureTop();
    window.addEventListener('resize', onResize);
    const node = containerRef.current;
    node?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      node?.removeEventListener('scroll', onScroll as EventListener);
    };
  }, [urlActiveKey]);

  return (
    <Drawer
      variant={isDesktop ? 'permanent' : 'temporary'}
      open={isDesktop ? true : isOpen}
      onClose={onClose}
    >
      {!isDesktop && <Logo />}
      <Box
        ref={containerRef}
        sx={{ position: 'relative', overflowY: 'auto', mt: !isDesktop ? '20px' : 0 }}
      >
        {/* Индикатор активного пункта */}
        {urlActiveKey && (
          <Box
            sx={{
              ...theme.custom.sidebarLinie,
              top: indicatorTop,
              transition: 'top 0.2s, height 0.2s',
            }}
          />
        )}
        {/* Табы */}
        <Tabs
          orientation="vertical"
          value={false}
          onChange={(_, newValue) => handleClick(newValue as SidebarKey)}
        >
          {tabs.map((item) => (
            <Box
              key={item.key}
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[item.key] = el;
              }}
            >
              <SidebarItem
                item={item}
                value={item.key}
                handleClick={handleClick}
                isAdmin={isAdmin}
                active={location.pathname.startsWith(item.path)}
              />
            </Box>
          ))}
        </Tabs>

        {/* Аккордеоны */}
        {accordions.map((item) => {
          const Icon = item.Icon;
          return (
            <Box
              key={item.key}
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[item.key] = el;
              }}
            >
              <AccordionTabDocuments
                value={item.key}
                expanded={isExpanded && location.pathname.startsWith(item.path)}
                onChange={() => handleClick(item.key)}
                active={location.pathname.startsWith(item.path)}
                icon={Icon ? <Icon /> : undefined}
              />
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
};
