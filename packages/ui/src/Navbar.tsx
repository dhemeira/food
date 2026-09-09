import type { HTMLAttributes, ReactNode } from 'react';

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/**
 * Navbar is a sticky top bar container for primary navigation.
 *
 * ```tsx
 * <Navbar className="border-b">
 *   <Link to="/">Logo</Link>
 *   <div className="ml-auto flex items-center gap-1">…</div>
 * </Navbar>
 * ```
 */
export function Navbar({ className, children, ...rest }: NavbarProps) {
  return (
    <header
      className={`border-ui-border bg-ui-surface sticky top-0 z-20 ${className ?? ''}`}
      {...rest}>
      {children}
    </header>
  );
}

export default Navbar;
