import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Search from '~/components/Search';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const onHome = pathname === '/';

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-2 sm:p-4">
        {/* The search input stays mounted on every route so the tab bar can
            focus it synchronously within the tap gesture (iOS only opens the
            keyboard for a gesture-driven focus). It is visually hidden with
            `sr-only` while off the home page. */}
        <div className={onHome ? '' : 'sr-only'}>
          <Search />
        </div>
        {children}
      </main>
    </div>
  );
}

export default Layout;
