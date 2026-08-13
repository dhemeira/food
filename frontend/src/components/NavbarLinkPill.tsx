import { NavLink, type NavLinkRenderProps } from 'react-router-dom';
import type { ComponentType } from 'react';

interface Props {
  to: string;
  outlineIcon: ComponentType<{ className?: string }>;
  solidIcon: ComponentType<{ className?: string }>;
}

function NavbarLinkPill({ to, outlineIcon: Outline, solidIcon: Solid }: Props) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: NavLinkRenderProps) =>
        (isActive ? 'pointer-events-none ' : '') +
        'relative flex h-full w-full items-center justify-center'
      }>
      {({ isActive }: NavLinkRenderProps) => (
        <div
          className={
            (isActive ? 'bg-text/20 absolute -inset-x-1.5 inset-y-0 ' : '') +
            'flex items-center justify-center rounded-full'
          }>
          {isActive ? <Solid className="size-6.5" /> : <Outline className="size-6.5" />}
        </div>
      )}
    </NavLink>
  );
}

export default NavbarLinkPill;
