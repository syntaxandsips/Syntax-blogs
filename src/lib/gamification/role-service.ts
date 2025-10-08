import type { SupabaseClient } from '@supabase/supabase-js';
import { ROLE_ASSIGNMENT_RULES } from './constants';
import type { RoleAssignmentContext } from './types';

const fetchRolesBySlug = async (supabase: SupabaseClient, slugs: string[]) => {
  const { data, error } = await supabase
    .from('roles')
    .select('id, slug')
    .in('slug', slugs);

  if (error) {
    throw new Error(`Unable to load roles for gamification: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.slug as string, row.id as string]));
};

const loadBadgeSlugs = async (supabase: SupabaseClient, profileId: string) => {
  const { data, error } = await supabase
    .from('profile_badges')
    .select('badge:badge_id (slug)')
    .eq('profile_id', profileId);

  if (error) {
    throw new Error(`Unable to load profile badges: ${error.message}`);
  }

  const slugs = new Set<string>();

  for (const row of data ?? []) {
    const badgeRecord = row.badge as unknown;

    if (Array.isArray(badgeRecord)) {
      for (const badge of badgeRecord) {
        if (badge && typeof badge === 'object') {
          const slug = (badge as { slug?: unknown }).slug;

          if (typeof slug === 'string') {
            slugs.add(slug);
          }
        }
      }
      continue;
    }

    if (badgeRecord && typeof badgeRecord === 'object') {
      const slug = (badgeRecord as { slug?: unknown }).slug;

      if (typeof slug === 'string') {
        slugs.add(slug);
      }
    }
  }

  return slugs;
};

export const syncRoleAssignments = async ({
  supabase,
  profileId,
  profile,
  newlyAwardedBadges = [],
}: RoleAssignmentContext) => {
  const rules = ROLE_ASSIGNMENT_RULES.slice();

  if (rules.length === 0) {
    return;
  }

  const ruleSlugs = rules.map((rule) => rule.roleSlug);
  const roleMap = await fetchRolesBySlug(supabase, ruleSlugs);
  const badgeSlugs = await loadBadgeSlugs(supabase, profileId);

  for (const badge of newlyAwardedBadges) {
    badgeSlugs.add(badge.slug);
  }

  const desiredRoleSlugs = new Set<string>();

  for (const rule of rules) {
    if (rule.type === 'level' && profile.level >= rule.level) {
      desiredRoleSlugs.add(rule.roleSlug);
    }

    if (rule.type === 'badge' && badgeSlugs.has(rule.badgeSlug)) {
      desiredRoleSlugs.add(rule.roleSlug);
    }
  }

  const { data: currentRolesData, error: currentRolesError } = await supabase
    .from('profile_roles')
    .select('role:role_id (id, slug)')
    .eq('profile_id', profileId);

  if (currentRolesError) {
    throw new Error(`Unable to load profile roles: ${currentRolesError.message}`);
  }

  const currentRoleSlugs = new Set<string>();
  const currentRoleIdsBySlug = new Map<string, string>();

  for (const row of currentRolesData ?? []) {
    const role = row.role;

    if (!role || typeof role !== 'object') {
      continue;
    }

    const slug = (role as { slug?: unknown }).slug;
    const id = (role as { id?: unknown }).id;

    if (typeof slug === 'string' && typeof id === 'string') {
      currentRoleSlugs.add(slug);
      currentRoleIdsBySlug.set(slug, id);
    }
  }

  const rolesToAdd: { profile_id: string; role_id: string }[] = [];
  const rolesToRemove: string[] = [];

  for (const slug of desiredRoleSlugs) {
    const roleId = roleMap.get(slug);

    if (!roleId) {
      continue;
    }

    if (!currentRoleSlugs.has(slug)) {
      rolesToAdd.push({ profile_id: profileId, role_id: roleId });
    }
  }

  for (const rule of rules) {
    const slug = rule.roleSlug;

    if (!desiredRoleSlugs.has(slug) && currentRoleSlugs.has(slug)) {
      const roleId = currentRoleIdsBySlug.get(slug);

      if (roleId) {
        rolesToRemove.push(roleId);
      }
    }
  }

  if (rolesToAdd.length > 0) {
    const { error } = await supabase.from('profile_roles').upsert(rolesToAdd, {
      onConflict: 'profile_id,role_id',
    });

    if (error) {
      throw new Error(`Unable to assign gamified roles: ${error.message}`);
    }
  }

  for (const roleId of rolesToRemove) {
    const { error } = await supabase
      .from('profile_roles')
      .delete()
      .eq('profile_id', profileId)
      .eq('role_id', roleId);

    if (error) {
      throw new Error(`Unable to remove gamified role: ${error.message}`);
    }
  }
};
