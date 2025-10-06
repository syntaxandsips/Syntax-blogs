import { NewBlogsPage } from '@/components/ui/NewBlogsPage';
import { getPublishedPosts } from '@/lib/posts';

export const revalidate = 60;

export default async function BlogsPage() {
  const posts = await getPublishedPosts();
  return <NewBlogsPage posts={posts} />;
}
