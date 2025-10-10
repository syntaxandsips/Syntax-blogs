import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { NewFooter } from './NewFooter';

interface ContentPageLayoutProps {
  title: string;
  description: string;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function ContentPageLayout({
  title,
  description,
  badge,
  action,
  children,
}: ContentPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      <main className="flex-1">
        <section className="border-b-4 border-black bg-[#f0f0f0]">
          <div className="container mx-auto px-4 py-12">
            <div className="neo-container bg-white">
              <div className="space-y-6">
                {badge && (
                  <div className="inline-flex items-center gap-2 bg-[#FFD166] border-4 border-black px-4 py-2 font-bold uppercase tracking-widest text-xs md:text-sm shadow-[6px_6px_0_0_#000]">
                    {badge}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-black leading-tight">{title}</h1>
                <p className="text-lg md:text-xl text-gray-700 max-w-3xl">{description}</p>
                {action && <div className="flex flex-wrap gap-3">{action}</div>}
              </div>
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 pb-16">
          <div className="space-y-8 lg:space-y-10">{children}</div>
        </section>
      </main>
      <NewFooter />
    </div>
  );
}

type ContentSectionProps = Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'className'> & {
  title: string;
  description?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export function ContentSection({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  fullWidth = false,
  ...sectionProps
}: ContentSectionProps) {
  const containerClassName = `neo-container bg-white ${className ?? ''}`.trim();
  const layoutClassName = fullWidth
    ? 'space-y-6'
    : 'flex flex-col lg:flex-row lg:items-start gap-8';

  return (
    <section {...sectionProps} className={containerClassName}>
      {eyebrow && (
        <div className="mb-4 inline-flex items-center gap-2 bg-[#06D6A0] border-4 border-black px-3 py-1 text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000]">
          {eyebrow}
        </div>
      )}
      <div className={layoutClassName}>
        <div className={`${fullWidth ? 'space-y-4' : 'space-y-4 lg:w-1/3'}`}>
          <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
          {description && <p className="text-gray-700 leading-relaxed">{description}</p>}
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className={`${fullWidth ? 'space-y-4' : 'lg:flex-1 space-y-4'}`}>{children}</div>
      </div>
    </section>
  );
}
