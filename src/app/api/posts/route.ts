import { NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/posts';

export async function GET() {
  try {
    const posts = await getPublishedPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load published posts.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
