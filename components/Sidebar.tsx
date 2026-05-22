import { getNavTree } from '@/lib/content';
import { SidebarNav } from './SidebarNav';

export function Sidebar() {
  const navTree = getNavTree();
  return (
    <aside className="hidden md:block w-64 shrink-0 h-screen overflow-y-auto border-r border-gray-200 py-6">
      <SidebarNav navTree={navTree} />
    </aside>
  );
}
