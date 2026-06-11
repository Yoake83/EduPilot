'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

const AUTH_ROUTES = ['/login', '/register'];

export function ConditionalSidebar() {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthPage) return null;

  return (
    <div className="hidden md:block">
      <Sidebar />
    </div>
  );
}