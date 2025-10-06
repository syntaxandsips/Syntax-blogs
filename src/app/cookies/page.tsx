import { Metadata } from 'next';
import { Cookie, ServerCog, Settings2 } from 'lucide-react';
import { PageShell, PageHero, ContentSection } from '@/components/ui/PageLayout';

const cookieCategories = [
  {
    title: 'Essential cookies',
    description: 'Required to keep you signed in, remember your preferences, and protect your account.',
  },
  {
    title: 'Analytics cookies',
    description: 'Help us understand how the platform is used so we can improve navigation and performance.',
  },
  {
    title: 'Preference cookies',
    description: 'Store your theme, language, and accessibility settings for a consistent experience.',
  },
];

const managementSteps = [
  'Open the cookie banner or account settings to review your preferences.',
  'Toggle categories on or off. Essential cookies cannot be disabled because the product will not function without them.',
  'Save your changes. Preferences apply across devices when you are signed in.',
];

export const metadata: Metadata = {
  title: 'Cookie Policy | Syntax & Sips',
  description: 'Learn how Syntax & Sips uses cookies and how you can control your preferences.',
};

export default function CookiesPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Cookies"
          title="Cookies keep Syntax & Sips running smoothly"
          description="We use a small set of cookies to provide essential functionality and improve how the platform performs."
        />
      }
    >
      <ContentSection
        eyebrow="At a glance"
        title="Why we use cookies"
        description="Cookies help us deliver secure sessions, remember your settings, and make better decisions with anonymized insights."
        tone="peach"
        align="center"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <Cookie className="h-10 w-10 text-[#FF5252]" aria-hidden="true" />
            <h3 className="text-lg font-black">Stay signed in</h3>
            <p className="text-sm text-black/70">We keep sessions secure without requiring you to log in every time.</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <ServerCog className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
            <h3 className="text-lg font-black">Performance insights</h3>
            <p className="text-sm text-black/70">Anonymous analytics help us understand what to improve next.</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <Settings2 className="h-10 w-10 text-[#4CAF50]" aria-hidden="true" />
            <h3 className="text-lg font-black">Personalization</h3>
            <p className="text-sm text-black/70">Your theme, shortcuts, and reading preferences follow you everywhere.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Categories"
        title="Types of cookies we set"
        description="Each category is purpose-driven and limited to what is necessary to provide value."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {cookieCategories.map((cookie) => (
            <article
              key={cookie.title}
              className="flex h-full flex-col gap-3 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]"
            >
              <h3 className="text-lg font-black">{cookie.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{cookie.description}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Manage your preferences"
        title="How to update or revoke consent"
        description="You can adjust optional cookies at any time—your choices are respected immediately."
        tone="lavender"
      >
        <ol className="space-y-3">
          {managementSteps.map((step, index) => (
            <li
              key={step}
              className="rounded-2xl border-2 border-dashed border-black/30 bg-white/70 px-4 py-3 text-sm text-black/80"
            >
              <span className="font-semibold text-black">{index + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </ContentSection>

      <ContentSection
        eyebrow="Questions"
        title="Need more information?"
        description="If you have questions about cookies or tracking technologies, our support team can help."
        align="center"
      >
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm text-black/70">Email privacy@syntaxandsips.com or adjust your settings anytime in the app.</p>
          <p className="text-sm font-semibold text-black">Last updated: March 1, 2025</p>
        </div>
      </ContentSection>
    </PageShell>
  );
}
