import { getNavTree } from '@/lib/content';
import { MobileMenuClient } from './MobileMenuClient';

export function MobileMenu() {
  const navTree = getNavTree();
  return <MobileMenuClient navTree={navTree} />;
}
