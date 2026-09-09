import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';

const CHIP_PADDING = 6;
const px = (n: number): string => `${n}px`;

export interface TabBarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  indicatorClassName?: string;
}

export interface TabBarItemProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  icon: ReactNode;
  activeIcon?: ReactNode;
}

function TabBarItem({ active = false, icon, activeIcon, className, ...rest }: TabBarItemProps) {
  return (
    <span
      data-active={active ? 'true' : undefined}
      className={`flex h-full w-full items-center justify-center ${className ?? ''}`}
      {...rest}>
      {active && activeIcon ? activeIcon : icon}
    </span>
  );
}

/**
 * TabBar is a bottom pill navigation with a sliding active indicator.
 *
 * ```tsx
 * <TabBar className="…">
 *   <NavLink to="/" end className="flex flex-1 items-center justify-center">
 *     {({ isActive }) => (
 *       <TabBar.Item active={isActive} icon={<HomeOutline />} activeIcon={<HomeSolid />} />
 *     )}
 *   </NavLink>
 * </TabBar>
 * ```
 *
 * The indicator slides to whichever child has `data-active="true"`. `TabBar.Item`
 * sets that attribute from its `active` prop, but any child can set it directly.
 */
function TabBarComponent({ children, className, indicatorClassName, ...rest }: TabBarProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const firstRun = useRef(true);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    const measure = () => {
      const activeEl = nav.querySelector<HTMLElement>('[data-active="true"]');
      if (!activeEl) {
        pill.style.opacity = '0';
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      pill.style.transition = firstRun.current
        ? 'none'
        : 'opacity 200ms ease, transform 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      firstRun.current = false;

      pill.style.opacity = '1';
      pill.style.width = px(elRect.width + CHIP_PADDING * 2);
      pill.style.height = px(elRect.height);
      pill.style.transform = `translate(${elRect.left - navRect.left - CHIP_PADDING}px, ${
        elRect.top - navRect.top
      }px)`;
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(nav);

    const mutationObserver = new MutationObserver(() => measure());
    mutationObserver.observe(nav, {
      attributes: true,
      attributeFilter: ['data-active'],
      subtree: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [children]);

  return (
    <nav ref={navRef} className={`relative flex ${className ?? ''}`} {...rest}>
      <span
        ref={pillRef}
        aria-hidden="true"
        className={`bg-ui-text/20 pointer-events-none absolute top-0 left-0 rounded-full opacity-0 ${indicatorClassName ?? ''}`}
      />
      {children}
    </nav>
  );
}

export const TabBar = Object.assign(TabBarComponent, { Item: TabBarItem });

export default TabBar;
