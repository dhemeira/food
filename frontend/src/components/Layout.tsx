import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}

export default Layout;
