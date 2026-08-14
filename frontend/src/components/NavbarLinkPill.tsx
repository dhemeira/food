import { NavLink, matchPath, useLocation } from 'react-router-dom';
import { type ComponentType, type PointerEvent } from 'react';

interface Props {
  to: string;
  outlineIcon: ComponentType<{ className?: string }>;
  solidIcon: ComponentType<{ className?: string }>;
  forceInactive?: boolean;
  onClick?: () => void;
}

function NavbarLinkPill({
  to,
  outlineIcon: Outline,
  solidIcon: Solid,
  forceInactive = false,
  onClick,
}: Props) {
  const { pathname } = useLocation();
  const active = !forceInactive && matchPath({ path: to, end: to === '/' }, pathname) !== null;

  return (
    <NavLink
      to={to}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      onPointerDown={(e: PointerEvent<HTMLAnchorElement>) => {
        e.preventDefault();
      }}
      className={`relative flex h-full w-full items-center justify-center ${active ? 'pointer-events-none' : ''}`}>
      {active ? <Solid className="size-6.5" /> : <Outline className="size-6.5" />}
    </NavLink>
  );
}

export default NavbarLinkPill;
