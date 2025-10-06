import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NewNavbar } from './NewNavbar';
import { NewFooter } from './NewFooter';

interface PageShellProps {
  children: ReactNode;
  hero?: ReactNode;
  backgroundClassName?: string;
}

export function PageShell({ hero, children, backgroundClassName = 'bg-[#f0f0f0]' }: PageShellProps) {
  return (
    <div className={cn('min-h-screen flex flex-col text-black', backgroundClassName)}>
      <NewNavbar />
      {hero}
      <main className="flex-1 container mx-auto px-4 py-16 space-y-16">{children}</main>
      <NewFooter />
    </div>
  );
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  align = 'left',
  className,
}: PageHeroProps) {
  const alignmentClasses = align === 'center' ? 'items-center text-center mx-auto' : '';

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b-4 border-black bg-gradient-to-r from-[#FF5252] via-[#FF7B7B] to-[#6C63FF] text-white',
        className,
      )}
    >
      <div className="container mx-auto px-4 py-20">
        <div className={cn('max-w-3xl flex flex-col gap-6', alignmentClasses)}>
          {eyebrow && (
            <span className="inline-block bg-black/30 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest rounded-full">
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-black leading-tight drop-shadow-[4px_4px_0px_rgba(0,0,0,0.25)]">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">{description}</p>
          {actions && <div className="flex flex-wrap gap-4">{actions}</div>}
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
    </section>
  );
}

interface ContentSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  align?: 'left' | 'center';
  tone?: 'neutral' | 'lavender' | 'peach';
  footerContent?: ReactNode;
}

const toneStyles: Record<Required<ContentSectionProps>['tone'], string> = {
  neutral: 'bg-white',
  lavender: 'bg-[#f5f1ff]',
  peach: 'bg-[#ffe8e8]',
};

export function ContentSection({
  eyebrow,
  title,
  description,
  children,
  align = 'left',
  tone = 'neutral',
  footerContent,
}: ContentSectionProps) {
  const hasChildren = children !== undefined && children !== null;

  return (
    <section>
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.08)]',
          toneStyles[tone],
        )}
      >
        <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-black/5 blur-3xl" aria-hidden="true" />
        <div className={cn('relative z-10 flex flex-col gap-6', align === 'center' ? 'text-center items-center' : '')}>
          <header className="space-y-3 max-w-3xl">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black text-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                {eyebrow}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h2>
            {description && <p className="text-base md:text-lg text-black/70 leading-relaxed">{description}</p>}
          </header>
          {hasChildren ? (
            <div className="w-full">{children}</div>
          ) : (
            <p className="w-full rounded-2xl border-2 border-dashed border-black/30 bg-white/60 px-6 py-10 text-center text-base font-semibold text-black/50">
              More updates are on the way. Check back soon!
            </p>
          )}
          {footerContent && <div className="w-full pt-4 border-t-2 border-dashed border-black/20">{footerContent}</div>}
        </div>
      </div>
    </section>
  );
}

interface CtaButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  target?: '_blank' | '_self' | '_parent' | '_top' | string;
  rel?: string;
}

export function CtaButton({ href, children, variant = 'primary', target, rel }: CtaButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full border-2 border-black px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black';

  const variantStyles =
    variant === 'primary'
      ? 'bg-black text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(255,82,82,0.5)]'
      : 'bg-white text-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(108,99,255,0.35)]';

  return (
    <Link href={href} target={target} rel={rel} className={cn(baseStyles, variantStyles)}>
      {children}
    </Link>
  );
}
