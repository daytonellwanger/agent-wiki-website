export function MarkdownContent({ html }: { html: string }) {
  return (
    <article
      className="prose prose-gray max-w-3xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:rounded-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
