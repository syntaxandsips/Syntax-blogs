"use client";

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-2xl border-4 px-5 py-4 font-semibold shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)] transition-colors',
  {
    variants: {
      tone: {
        info: 'bg-[#E9F5FF] border-[#118AB2] text-[#0B2A3B]',
        success: 'bg-[#E6F4EA] border-[#2F855A] text-[#1C4532]',
        warning: 'bg-[#FFF7D6] border-[#D69E2E] text-[#422006]',
        danger: 'bg-[#FFE5E5] border-[#D14343] text-[#58151C]',
        neutral: 'bg-white border-black text-black',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
);

export interface NeobrutalAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

export const NeobrutalAlert = React.forwardRef<HTMLDivElement, NeobrutalAlertProps>(
  ({ className, tone, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="neobrutal-alert"
      role="alert"
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5 text-lg" aria-hidden="true">{icon}</span> : null}
        <div className="space-y-1 text-sm font-semibold leading-relaxed">{children}</div>
      </div>
    </div>
  ),
);

NeobrutalAlert.displayName = 'NeobrutalAlert';

export const NeobrutalAlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="neobrutal-alert-title"
      className={cn('text-base font-black tracking-tight', className)}
      {...props}
    />
  ),
);

NeobrutalAlertTitle.displayName = 'NeobrutalAlertTitle';

export const NeobrutalAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="neobrutal-alert-description"
    className={cn('text-sm font-medium text-current', className)}
    {...props}
  />
));

NeobrutalAlertDescription.displayName = 'NeobrutalAlertDescription';

