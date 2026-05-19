import { getAllSlugs, getPage } from '@/lib/content';
import { markdownToHtml } from '@/lib/markdown';
import { MarkdownContent } from '@/components/MarkdownContent';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = getPage(slug ?? []);
  return {
    title: page ? `${page.title} | Agent Wiki` : 'Agent Wiki',
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = getPage(slug ?? []);

  if (!page) notFound();

  const html = await markdownToHtml(page.content);

  return <MarkdownContent html={html} />;
}
