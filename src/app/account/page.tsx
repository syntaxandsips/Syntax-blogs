import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server-client';
import { UserAccountPanel } from '@/components/auth/UserAccountPanel';
import type {
  AdminUserRole,
  AuthenticatedProfileSummary,
  UserCommentSummary,
  UserContributionSnapshot,
  UserPostSummary,
} from '@/utils/types';
import { CommentStatus, PostStatus } from '@/utils/types';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/account');
  }

  const { data: profileRecord, error: profileError } = await supabase
    .from('profiles')
    .select(
      `id, display_name, avatar_url, is_admin, created_at, primary_role_id,
       profile_roles(role:roles(id, slug, name, description, priority))`,
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to load profile: ${profileError.message}`);
  }

  if (!profileRecord) {
    throw new Error('Profile not found.');
  }

  const roles: AdminUserRole[] =
    profileRecord.profile_roles
      ?.map((entry) => entry.role)
      .filter((role): role is { id: string; slug: string; name: string; description: string | null; priority: number } => !!role)
      .map((role) => ({
        id: role.id,
        slug: role.slug,
        name: role.name,
        description: role.description,
        priority: role.priority,
      })) ?? [];

  roles.sort((a, b) => a.priority - b.priority);

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('id, title, slug, status, views, created_at, published_at')
    .eq('author_id', profileRecord.id)
    .order('created_at', { ascending: false });

  if (postsError) {
    throw new Error(`Unable to load authored posts: ${postsError.message}`);
  }

  const posts: UserPostSummary[] = (postsData ?? []).map((post) => ({
    id: post.id as string,
    title: (post.title as string) ?? 'Untitled post',
    slug: (post.slug as string | null) ?? null,
    status: (post.status as PostStatus) ?? PostStatus.DRAFT,
    views: typeof post.views === 'number' ? post.views : 0,
    createdAt: post.created_at as string,
    publishedAt: (post.published_at as string | null) ?? null,
  }));

  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('id, content, status, created_at, posts:post_id(title, slug)')
    .eq('author_profile_id', profileRecord.id)
    .order('created_at', { ascending: false });

  if (commentsError) {
    throw new Error(`Unable to load your comments: ${commentsError.message}`);
  }

  const comments: UserCommentSummary[] = (commentsData ?? []).map((comment) => ({
    id: comment.id as string,
    content: (comment.content as string) ?? '',
    status: (comment.status as CommentStatus) ?? CommentStatus.PENDING,
    createdAt: comment.created_at as string,
    postTitle: (comment.posts?.title as string | null) ?? null,
    postSlug: (comment.posts?.slug as string | null) ?? null,
  }));

  const totals = {
    totalPosts: posts.length,
    publishedPosts: posts.filter((post) => post.status === PostStatus.PUBLISHED).length,
    draftPosts: posts.filter((post) => post.status === PostStatus.DRAFT).length,
    scheduledPosts: posts.filter((post) => post.status === PostStatus.SCHEDULED).length,
    totalViews: posts.reduce((sum, post) => sum + (Number.isFinite(post.views) ? post.views : 0), 0),
    totalComments: comments.length,
    approvedComments: comments.filter((comment) => comment.status === CommentStatus.APPROVED).length,
    pendingComments: comments.filter((comment) => comment.status === CommentStatus.PENDING).length,
    rejectedComments: comments.filter((comment) => comment.status === CommentStatus.REJECTED).length,
  } satisfies UserContributionSnapshot['totals'];

  const profileSummary: AuthenticatedProfileSummary = {
    userId: user.id,
    email: user.email ?? '',
    displayName: profileRecord.display_name as string,
    avatarUrl: (profileRecord.avatar_url as string | null) ?? null,
    isAdmin: Boolean(profileRecord.is_admin),
    createdAt: profileRecord.created_at as string,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    primaryRoleId: (profileRecord.primary_role_id as string | null) ?? null,
    roles,
  };

  const contributions: UserContributionSnapshot = {
    posts,
    comments,
    totals,
  };

  return <UserAccountPanel profile={profileSummary} contributions={contributions} />;
}
