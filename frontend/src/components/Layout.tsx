import type { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}

export default Layout;
