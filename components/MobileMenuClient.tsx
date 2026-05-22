'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarNav } from './SidebarNav';
import type { NavTree } from '@/lib/content';

export function MobileMenuClient({ navTree }: { navTree: NavTree }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the user navigates to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Hamburger button — only visible on small screens */}
      <button
        className="md:hidden p-1 -ml-1 text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        aria-expanded={isOpen}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop — clicking it closes the drawer */}
          <div
            className="fixed top-12 inset-x-0 bottom-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in drawer */}
          <aside className="fixed top-12 left-0 bottom-0 w-64 bg-white border-r border-gray-200 shadow-lg z-50 overflow-y-auto py-6 md:hidden">
            <SidebarNav navTree={navTree} />
          </aside>
        </>
      )}
    </>
  );
}
