import BlogsClientPage from './client-page';

// Removed dynamic = 'force-dynamic' to support static exports
// The client component will handle loading data from localStorage

export default function BlogsPage() {
  return <BlogsClientPage />;
}