"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Loader2, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { useToast } from "./ToastProvider";

interface DashboardSettings {
  newsletterDoubleOptIn: boolean;
  newsletterWeeklyDigest: boolean;
  commentsAutoApproveMembers: boolean;
  commentsNotifyOnNew: boolean;
  themeDarkMode: boolean;
  themeAccent: string;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  newsletterDoubleOptIn: true,
  newsletterWeeklyDigest: true,
  commentsAutoApproveMembers: false,
  commentsNotifyOnNew: true,
  themeDarkMode: false,
  themeAccent: "#6C63FF",
};

interface SettingsResponse {
  settings: Partial<DashboardSettings> | null;
}

const ACCENT_OPTIONS = [
  { name: "Signature Violet", value: "#6C63FF" },
  { name: "Sunset Coral", value: "#FF5252" },
  { name: "Citrus Glow", value: "#FFD166" },
  { name: "Mint Burst", value: "#06D6A0" },
  { name: "Midnight", value: "#111827" },
];

export function SettingsPanel() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const mergedSettings = useMemo(() => ({
    ...DEFAULT_SETTINGS,
    ...settings,
  }), [settings]);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/admin/settings", {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as SettingsResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load settings.");
        }

        if (payload.settings) {
          setSettings((prev) => ({ ...prev, ...payload.settings }));
        }
      } catch (error) {
        showToast({
          variant: "error",
          title: "Unable to load settings",
          description: error instanceof Error ? error.message : "Unable to load settings.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [showToast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: mergedSettings }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save settings.");
      }

      showToast({
        variant: "success",
        title: "Settings saved",
        description: payload.message ?? "Settings updated successfully.",
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Unable to save settings",
        description: error instanceof Error ? error.message : "Unable to save settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2A2A2A]">Settings</h1>
        <p className="text-sm text-[#2A2A2A]/70">
          Configure moderation rules, newsletter preferences, and dashboard theming.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]"
      >
        <section className="space-y-4">
          <header className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-[#2A2A2A]">Newsletter & access</h2>
              <p className="text-xs text-gray-500">Control how subscribers join and what they receive.</p>
            </div>
          </header>

          <label className="flex items-start gap-3 rounded-lg border-2 border-black/10 bg-[#f8f9ff] p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={mergedSettings.newsletterDoubleOptIn}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  newsletterDoubleOptIn: event.target.checked,
                }))
              }
            />
            <span>
              <span className="block text-sm font-semibold text-[#2A2A2A]">
                Require double opt-in
              </span>
              <span className="text-xs text-gray-500">
                Subscribers must confirm via email before they begin receiving messages.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border-2 border-black/10 bg-[#f8f9ff] p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={mergedSettings.newsletterWeeklyDigest}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  newsletterWeeklyDigest: event.target.checked,
                }))
              }
            />
            <span>
              <span className="block text-sm font-semibold text-[#2A2A2A]">
                Send weekly digest
              </span>
              <span className="text-xs text-gray-500">
                Automatically compile top stories into a weekly round-up for subscribers.
              </span>
            </span>
          </label>
        </section>

        <section className="space-y-4">
          <header className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-[#2A2A2A]">Comment moderation</h2>
              <p className="text-xs text-gray-500">
                Adjust how community feedback flows through the moderation queue.
              </p>
            </div>
          </header>

          <label className="flex items-start gap-3 rounded-lg border-2 border-black/10 bg-[#fff9f9] p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={mergedSettings.commentsAutoApproveMembers}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  commentsAutoApproveMembers: event.target.checked,
                }))
              }
            />
            <span>
              <span className="block text-sm font-semibold text-[#2A2A2A]">
                Auto-approve trusted members
              </span>
              <span className="text-xs text-gray-500">
                Comments from team members bypass pending review and publish immediately.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border-2 border-black/10 bg-[#fff9f9] p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={mergedSettings.commentsNotifyOnNew}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  commentsNotifyOnNew: event.target.checked,
                }))
              }
            />
            <span>
              <span className="block text-sm font-semibold text-[#2A2A2A]">
                Send moderation alerts
              </span>
              <span className="text-xs text-gray-500">
                Notify moderators when a new comment arrives to reduce turnaround time.
              </span>
            </span>
          </label>
        </section>

        <section className="space-y-4">
          <header className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-[#2A2A2A]">Appearance</h2>
              <p className="text-xs text-gray-500">
                Fine-tune accent colors and dashboard visual style.
              </p>
            </div>
          </header>

          <div className="rounded-lg border-2 border-black/10 bg-[#f8f9ff] p-4">
            <p className="text-sm font-semibold text-[#2A2A2A]">Accent color</p>
            <p className="text-xs text-gray-500">
              Update the highlight color used across primary buttons and callouts.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ACCENT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      themeAccent: option.value,
                    }))
                  }
                  className={`flex items-center justify-between rounded-md border-2 px-3 py-2 text-sm font-semibold transition ${
                    mergedSettings.themeAccent === option.value
                      ? "border-black bg-black text-white"
                      : "border-black/20 bg-white text-[#2A2A2A] hover:border-black/40"
                  }`}
                >
                  <span>{option.name}</span>
                  <span
                    className="h-5 w-5 rounded-full border border-black/10"
                    style={{ backgroundColor: option.value }}
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg border-2 border-black/10 bg-[#f8f9ff] p-4">
            <input
              type="checkbox"
              checked={mergedSettings.themeDarkMode}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  themeDarkMode: event.target.checked,
                }))
              }
            />
            <span>
              <span className="block text-sm font-semibold text-[#2A2A2A]">
                Enable dark dashboard preview
              </span>
              <span className="text-xs text-gray-500">
                Use a darker palette while reviewing analytics and moderation queues.
              </span>
            </span>
          </label>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-black/10 pt-4">
          <p className="text-xs text-gray-500">
            Settings apply to the admin dashboard experience and are stored securely in Supabase.
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-black px-4 py-2 font-bold uppercase tracking-wide text-white transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
