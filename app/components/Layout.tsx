import {Outlet} from '@remix-run/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-full bg-white">
      <div className="h-full w-80 border-r bg-gray-50">{children}</div>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </main>
  );
}
