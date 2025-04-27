import EditPostClient from './EditPostClient';

export default function EditPostPage({ params }: { params: { id: string } }) {
  // Access the id directly from params
  // This approach is compatible with the current version of Next.js
  const postId = params.id;

  return <EditPostClient postId={postId} />;
}
