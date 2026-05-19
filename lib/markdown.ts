import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { visit } from 'unist-util-visit';
import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'typescript', 'javascript', 'tsx', 'jsx',
        'python', 'bash', 'sh', 'json', 'yaml',
        'markdown', 'html', 'css', 'text',
      ],
    });
  }
  return highlighterPromise;
}

function remarkRewriteMdLinks() {
  return (tree: any) => {
    visit(tree, 'link', (node: any) => {
      if (typeof node.url === 'string' && node.url.endsWith('.md')) {
        node.url = '/' + node.url.slice(0, -3);
      }
    });
  };
}

function remarkShiki(highlighter: Highlighter) {
  return () => (tree: any) => {
    visit(tree, 'code', (node: any) => {
      const lang = node.lang || 'text';
      try {
        node.type = 'html';
        node.value = highlighter.codeToHtml(node.value, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
        });
      } catch {
        const escaped = node.value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        node.type = 'html';
        node.value = `<pre><code>${escaped}</code></pre>`;
      }
    });
  };
}

export async function markdownToHtml(content: string): Promise<string> {
  const highlighter = await getHighlighter();
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRewriteMdLinks)
    .use(remarkShiki(highlighter))
    .use(remarkHtml, { sanitize: false })
    .process(content);
  return result.toString();
}
