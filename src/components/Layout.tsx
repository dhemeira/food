import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AppearancePicker from '~/components/AppearancePicker';
import Logo from '~/components/Logo';
import Search from '~/components/Search';

interface LayoutProps {
  children: ReactNode;
}

const DETAIL_PATH = /^\/recipe\/(?!new$)[^/]+\/?$/;

function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const wide = onHome || DETAIL_PATH.test(pathname);

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-background fixed inset-x-0 top-0 z-50 h-2 min-[720px]:hidden" />
      <main
        className={
          'mx-auto flex w-full flex-1 flex-col px-4 pb-30 min-[720px]:px-6 min-[720px]:pb-14 lg:px-8 ' +
          (wide ? 'max-w-280' : 'max-w-4xl')
        }>
        {onHome ? (
          <div className="order-0 flex items-center gap-2.25 pt-4 min-[720px]:hidden">
            <Logo className="size-7" />
            <span className="text-[0.95rem] font-semibold tracking-[-0.01em]">Receptek</span>
          </div>
        ) : null}
        {/* The search input stays mounted on every route so the tab bar can
            focus it synchronously within the tap gesture (iOS only opens the
            keyboard for a gesture-driven focus). On Home it is ordered after
            the page head; elsewhere it is visually hidden with `sr-only`. */}
        <div className={`order-2 min-[720px]:hidden ${onHome ? '' : 'sr-only'}`}>
          <Search register placeholder="Keresés a receptek között…" />
        </div>
        {children}
        <div className="order-4 mt-auto">
          <AppearancePicker />
        </div>
      </main>
    </div>
  );
}

export default Layout;
