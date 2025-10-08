'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ToggleRight } from 'lucide-react';
import type { GamificationProfile } from '@/lib/gamification/types';

interface GamificationSettingsCardProps {
  profile: GamificationProfile;
  onUpdated?: (profile: GamificationProfile) => void;
}

export const GamificationSettingsCard = ({ profile, onUpdated }: GamificationSettingsCardProps) => {
  const [settings, setSettings] = useState(profile.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSettings(profile.settings);
  }, [profile.settings]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/gamification/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to update settings.');
      }

      const updated = payload.profile as GamificationProfile;
      setSettings(updated.settings);
      setSuccess('Preferences saved.');
      onUpdated?.(updated);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[32px] border-4 border-black bg-[#FFF9E9] p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-[0.28em] text-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
            <ShieldCheck className="h-4 w-4 text-[#3DC35B]" aria-hidden="true" />
            Privacy controls
          </span>
          <h3 className="mt-2 text-2xl font-black text-gray-900">Gamification preferences</h3>
          <p className="mt-1 text-sm font-medium text-gray-600">
            Decide how we track your XP, display badges, and notify you about achievements. You can opt out anytime.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ToggleRow
          label="Enable points & XP tracking"
          description="Keep earning XP and level progression from comments, posts, and streaks."
          value={settings.optedIn}
          onToggle={() => handleToggle('optedIn')}
        />
        <ToggleRow
          label="Showcase badges on my profile"
          description="Display unlocked badges to the community."
          value={settings.showcaseBadges}
          onToggle={() => handleToggle('showcaseBadges')}
        />
        <ToggleRow
          label="Send achievement emails"
          description="Get a celebratory email when you level up or unlock a rare badge."
          value={settings.emailNotifications}
          onToggle={() => handleToggle('emailNotifications')}
        />
        <ToggleRow
          label="Join the gamification beta"
          description="Preview seasonal quests and experimental features before everyone else."
          value={settings.betaTester}
          onToggle={() => handleToggle('betaTester')}
        />
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm font-semibold text-green-600">{success}</p> : null}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFBE0B] px-5 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ToggleRight className="h-4 w-4" aria-hidden="true" />}
          Save preferences
        </button>
      </div>
    </section>
  );
};

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

const ToggleRow = ({ label, description, value, onToggle }: ToggleRowProps) => (
  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-black bg-white px-4 py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
    <div>
      <p className="text-sm font-black text-gray-900">{label}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">{description}</p>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-wide transition ${
        value
          ? 'bg-[#6C63FF] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)]'
          : 'bg-[#F3F4F6] text-gray-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
      }`}
    >
      {value ? 'Enabled' : 'Disabled'}
    </button>
  </div>
);
