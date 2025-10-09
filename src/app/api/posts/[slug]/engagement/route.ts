import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerComponentClient, createServiceRoleClient } from '@/lib/supabase/server-client';

const voteSchema = z.object({
  voteType: z.enum(['upvote', 'downvote']),
});

interface SessionProfile {
  id: string;
  displayName: string | null;
}

const getSessionProfile = async (): Promise<SessionProfile | null> => {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id as string,
    displayName: (data.display_name as string | null) ?? null,
  };
};

interface PostRecord {
  id: string;
  views: number | null;
}

const fetchPostBySlug = async (slug: string): Promise<PostRecord | null> => {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('posts')
    .select('id, views')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PostRecord;
};

interface EngagementStats {
  upvotes: number;
  downvotes: number;
  comments: number;
  bookmarks: number;
  views: number;
}

const loadEngagementStats = async (postId: string): Promise<EngagementStats> => {
  const supabase = createServiceRoleClient();

  const [{ count: upvotes }, { count: downvotes }, { count: comments }, { count: bookmarks }] = await Promise.all([
    supabase
      .from('post_votes')
      .select('id', { head: true, count: 'exact' })
      .eq('post_id', postId)
      .eq('vote_type', 'upvote'),
    supabase
      .from('post_votes')
      .select('id', { head: true, count: 'exact' })
      .eq('post_id', postId)
      .eq('vote_type', 'downvote'),
    supabase
      .from('comments')
      .select('id', { head: true, count: 'exact' })
      .eq('post_id', postId)
      .eq('status', 'approved'),
    supabase
      .from('bookmarks')
      .select('id', { head: true, count: 'exact' })
      .eq('post_id', postId),
  ]);

  return {
    upvotes: upvotes ?? 0,
    downvotes: downvotes ?? 0,
    comments: comments ?? 0,
    bookmarks: bookmarks ?? 0,
    views: 0,
  };
};

const buildEngagementResponse = async (
  post: PostRecord,
  profile: SessionProfile | null,
): Promise<{ stats: EngagementStats; viewer: { vote: 'upvote' | 'downvote' | null; bookmarkId: string | null } }> => {
  const supabase = createServiceRoleClient();
  const stats = await loadEngagementStats(post.id);
  stats.views = post.views ?? 0;

  let vote: 'upvote' | 'downvote' | null = null;
  let bookmarkId: string | null = null;

  if (profile) {
    const [{ data: voteRow }, { data: bookmarkRow }] = await Promise.all([
      supabase
        .from('post_votes')
        .select('id, vote_type')
        .eq('post_id', post.id)
        .eq('profile_id', profile.id)
        .maybeSingle(),
      supabase
        .from('bookmarks')
        .select('id')
        .eq('post_id', post.id)
        .eq('profile_id', profile.id)
        .maybeSingle(),
    ]);

    vote = (voteRow?.vote_type as 'upvote' | 'downvote' | null) ?? null;
    bookmarkId = (bookmarkRow?.id as string | null) ?? null;
  }

  return {
    stats,
    viewer: {
      vote,
      bookmarkId,
    },
  };
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await fetchPostBySlug(decodedSlug);

  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  }

  const profile = await getSessionProfile();
  const payload = await buildEngagementResponse(post, profile);

  return NextResponse.json({
    postId: post.id,
    stats: payload.stats,
    viewer: payload.viewer,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const post = await fetchPostBySlug(decodedSlug);

  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = voteSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from('post_votes')
    .select('id, vote_type')
    .eq('post_id', post.id)
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (existing && existing.vote_type === parsed.data.voteType) {
    await supabase
      .from('post_votes')
      .delete()
      .eq('id', existing.id);

    const payload = await buildEngagementResponse(post, profile);
    return NextResponse.json({
      postId: post.id,
      stats: payload.stats,
      viewer: payload.viewer,
    });
  }

  await supabase
    .from('post_votes')
    .upsert(
      {
        post_id: post.id,
        profile_id: profile.id,
        vote_type: parsed.data.voteType,
      },
      { onConflict: 'post_id,profile_id' },
    );

  const payload = await buildEngagementResponse(post, profile);
  return NextResponse.json({
    postId: post.id,
    stats: payload.stats,
    viewer: payload.viewer,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const post = await fetchPostBySlug(decodedSlug);

  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  }

  const supabase = createServiceRoleClient();

  await supabase
    .from('post_votes')
    .delete()
    .eq('post_id', post.id)
    .eq('profile_id', profile.id);

  const payload = await buildEngagementResponse(post, profile);
  return NextResponse.json({
    postId: post.id,
    stats: payload.stats,
    viewer: payload.viewer,
  });
}
