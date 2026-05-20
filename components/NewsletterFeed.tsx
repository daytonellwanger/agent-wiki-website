import Link from 'next/link';

interface RenderedNewsletter {
  slug: string;
  date: string;
  href: string;
  html: string;
}

export function NewsletterFeed({ newsletters }: { newsletters: RenderedNewsletter[] }) {
  return (
    <div className="max-w-3xl">
      {newsletters.map((newsletter, i) => (
        <div key={newsletter.slug}>
          <article>
            <p className="text-sm text-gray-400 mb-2">{newsletter.date}</p>
            <div
              className="prose prose-gray max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:rounded-none"
              dangerouslySetInnerHTML={{ __html: newsletter.html }}
            />
            <p className="text-sm mt-4">
              <Link href={newsletter.href} className="text-gray-400 hover:text-gray-700">Permalink →</Link>
            </p>
          </article>
          {i < newsletters.length - 1 && <hr className="my-10 border-gray-200" />}
        </div>
      ))}
      <p className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
        Older newsletters can be found in the <strong>Newsletters</strong> section of the sidebar.
      </p>
    </div>
  );
}
