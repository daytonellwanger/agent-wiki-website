'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavTree } from '@/lib/content';

export function SidebarNav({ navTree }: { navTree: NavTree }) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `block px-4 py-1 rounded text-sm leading-6 transition-colors ${
      pathname === href
        ? 'text-gray-900 font-semibold'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <nav className="flex flex-col gap-4">
      <ul className="space-y-0.5">
        {navTree.topLevel.map(item => (
          <li key={item.href}>
            <Link href={item.href} className={linkClass(item.href)}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>

      {navTree.sections.map(section => (
        <div key={section.title}>
          <div className="px-4 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {section.title}
          </div>
          <ul className="space-y-0.5">
            {section.items.map(item => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass(item.href)}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
