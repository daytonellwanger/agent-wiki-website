import path from 'path';
import fs from 'fs';

const WIKI_DIR = path.join(process.cwd(), '..', 'agent-wiki');

function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function slugToHref(slug: string[]): string {
  return slug.length === 0 ? '/' : '/' + slug.join('/');
}

// Returns all slug arrays for generateStaticParams.
// The root index.md is represented as [].
export function getAllSlugs(): string[][] {
  const slugs: string[][] = [];

  function walk(dir: string, prefix: string[]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name]);
      } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
        const stem = entry.name.slice(0, -3);
        if (stem === 'index' && prefix.length === 0) {
          slugs.push([]);
        } else {
          slugs.push([...prefix, stem]);
        }
      }
    }
  }

  walk(WIKI_DIR, []);
  return slugs;
}

export function getPage(slug: string[]): { title: string; content: string } | null {
  const filePath =
    slug.length === 0
      ? path.join(WIKI_DIR, 'index.md')
      : path.join(WIKI_DIR, ...slug) + '.md';

  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  const title = extractTitle(content, slug[slug.length - 1] ?? 'Home');
  return { title, content };
}

export interface NavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NavTree {
  topLevel: NavItem[];
  sections: NavSection[];
}

export function getNavTree(): NavTree {
  // Determine section order from index.md headings
  const indexContent = fs.readFileSync(path.join(WIKI_DIR, 'index.md'), 'utf-8');
  const sectionOrder: string[] = [];
  for (const m of indexContent.matchAll(/^##\s+(.+)$/gm)) {
    sectionOrder.push(m[1].trim().toLowerCase());
  }

  // Top-level files in display order
  const topLevelNames = ['index.md', 'overview.md', 'log.md'];
  const topLevel: NavItem[] = [];
  for (const name of topLevelNames) {
    const filePath = path.join(WIKI_DIR, name);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const stem = name.slice(0, -3);
    const slug = stem === 'index' ? [] : [stem];
    topLevel.push({
      title: extractTitle(content, stem),
      href: slugToHref(slug),
    });
  }

  // Subdirectories sorted by index.md section order
  const entries = fs.readdirSync(WIKI_DIR, { withFileTypes: true });
  const dirs = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name)
    .sort((a, b) => {
      const ai = sectionOrder.indexOf(a.toLowerCase());
      const bi = sectionOrder.indexOf(b.toLowerCase());
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  const sections: NavSection[] = dirs.map(dir => {
    const dirPath = path.join(WIKI_DIR, dir);
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md'))
      .sort();

    const items: NavItem[] = files.map(file => {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const stem = file.slice(0, -3);
      return {
        title: extractTitle(content, stem),
        href: slugToHref([dir, stem]),
      };
    });

    return {
      title: dir.charAt(0).toUpperCase() + dir.slice(1),
      items,
    };
  });

  return { topLevel, sections };
}
