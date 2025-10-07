import { NextResponse } from 'next/server';
import { searchPublishedPosts } from '@/lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchPublishedPosts(query, 20);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to search posts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
