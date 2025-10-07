import { NextResponse } from 'next/server';
import { getTrendingPosts } from '@/lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(12, Math.max(1, Number.parseInt(limitParam, 10))) : 6;

  try {
    const posts = await getTrendingPosts(limit);
    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load trending posts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
