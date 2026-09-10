import {
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

const CHIP_PADDING = 6;
const px = (n: number): string => `${n}px`;
const SLIDE_EASING = "cubic-bezier(0.175, 0.885, 0.32, 1.15)";

export interface TabBarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  indicatorClassName?: string;
}

export interface TabBarItemProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  icon: ReactNode;
  activeIcon?: ReactNode;
}

/**
 * Stacks the outline and solid icons in the same grid cell and cross-fades
 * between them based on `active`. Both icons always occupy the same box so the
 * pill never changes size while an icon swaps.
 */
function StackedIcon({
  active,
  icon,
  activeIcon,
}: {
  active: boolean;
  icon: ReactNode;
  activeIcon?: ReactNode;
}) {
  const solid = activeIcon ?? icon;
  return (
    <span aria-hidden="true" className="grid place-items-center">
      <span
        className="[grid-area:1/1] transition-opacity duration-200"
        style={{ opacity: active ? 0 : 1 }}
      >
        {icon}
      </span>
      <span
        className="[grid-area:1/1] transition-opacity duration-200"
        style={{ opacity: active ? 1 : 0 }}
      >
        {solid}
      </span>
    </span>
  );
}

function TabBarItem({
  active = false,
  icon,
  activeIcon,
  className,
  ...rest
}: TabBarItemProps) {
  return (
    <span
      data-active={active ? "true" : undefined}
      className={`flex h-full w-full items-center justify-center ${className ?? ""}`}
      {...rest}
    >
      <StackedIcon active={active} icon={icon} activeIcon={activeIcon} />
    </span>
  );
}

/**
 * TabBar is a bottom pill navigation with a sliding, squashing active
 * indicator.
 *
 * ```tsx
 * <TabBar className="…">
 *   <NavLink to="/" end className="flex-1">
 *     {({ isActive }) => (
 *       <TabBar.Item active={isActive} icon={<HomeOutline />} activeIcon={<HomeSolid />} />
 *     )}
 *   </NavLink>
 * </TabBar>
 * ```
 *
 * The indicator slides to whichever child carries `data-active="true"`.
 * `TabBar.Item` sets that attribute from its `active` prop, but any child can
 * set it directly (e.g. a custom search button).
 *
 * The slide (translate) and the squash (scale) live on separate elements:
 * translating the outer pill with a CSS transition and scaling an inner
 * visual with the Web Animations API. Keeping them apart avoids Safari
 * overriding the translate when the squash runs, which previously made the
 * pill jump instead of sliding.
 */
function TabBarComponent({
  children,
  className,
  indicatorClassName,
  ...rest
}: TabBarProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const squashRef = useRef<HTMLSpanElement | null>(null);
  const squashAnimRef = useRef<Animation | null>(null);
  const firstRun = useRef(true);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    const squash = squashRef.current;
    if (!nav || !pill || !squash) return;

    const playSquash = () => {
      squashAnimRef.current?.cancel();
      if (typeof squash.animate !== "function") return;
      squashAnimRef.current = squash.animate(
        [
          { transform: "scale(1, 1)" },
          {
            transform: "scale(1.04, 0.92)",
            offset: 0.2,
            easing: "ease-in-out",
          },
          { transform: "scale(0.99, 1.03)", offset: 0.8, easing: "ease-out" },
          { transform: "scale(1, 1)" },
        ],
        { duration: 400, easing: "ease-in-out" },
      );
    };

    const measure = () => {
      const activeEl = nav.querySelector<HTMLElement>('[data-active="true"]');
      if (!activeEl) {
        // No active slot (e.g. a route without a tab): keep the pill in its
        // last position instead of hiding it.
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      pill.style.transition = firstRun.current
        ? "none"
        : `transform 400ms ${SLIDE_EASING}, opacity 200ms ease`;
      if (!firstRun.current) playSquash();
      firstRun.current = false;

      pill.style.opacity = "1";
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
      attributeFilter: ["data-active"],
      subtree: true,
    });

    return () => {
      squashAnimRef.current?.cancel();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [children]);

  return (
    <nav ref={navRef} className={`relative flex ${className ?? ""}`} {...rest}>
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-0 opacity-0"
      >
        <span
          ref={squashRef}
          className={`block h-full w-full rounded-full bg-text/15 backdrop-blur-xs backdrop-saturate-150 inset-shadow-[0_0_2px_1px_#eef0fb22] ${
            indicatorClassName ?? ""
          }`}
        />
      </span>
      {children}
    </nav>
  );
}

export const TabBar = Object.assign(TabBarComponent, { Item: TabBarItem });

export default TabBar;
