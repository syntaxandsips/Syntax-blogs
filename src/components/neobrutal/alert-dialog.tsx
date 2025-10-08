"use client";

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { cn } from '@/lib/utils';

const basePanelClasses =
  'relative w-full max-w-lg rounded-3xl border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.12)] focus:outline-none';

function NeobrutalAlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="neobrutal-alert-dialog" {...props} />;
}

function NeobrutalAlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="neobrutal-alert-dialog-trigger" {...props} />;
}

function NeobrutalAlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="neobrutal-alert-dialog-portal" {...props} />;
}

function NeobrutalAlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="neobrutal-alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  );
}

function NeobrutalAlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <NeobrutalAlertDialogPortal>
      <NeobrutalAlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="neobrutal-alert-dialog-content"
        className={cn(
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
          basePanelClasses,
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </NeobrutalAlertDialogPortal>
  );
}

function NeobrutalAlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="neobrutal-alert-dialog-header"
      className={cn('flex flex-col gap-2 text-left', className)}
      {...props}
    />
  );
}

function NeobrutalAlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="neobrutal-alert-dialog-footer"
      className={cn('mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function NeobrutalAlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="neobrutal-alert-dialog-title"
      className={cn('text-2xl font-black tracking-tight text-black', className)}
      {...props}
    />
  );
}

function NeobrutalAlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="neobrutal-alert-dialog-description"
      className={cn('text-sm font-medium text-black/80', className)}
      {...props}
    />
  );
}

function NeobrutalAlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="neobrutal-alert-dialog-action"
      className={cn(
        'inline-flex items-center justify-center rounded-full border-2 border-black bg-black px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-white transition-transform duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(108,99,255,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
        className,
      )}
      {...props}
    />
  );
}

function NeobrutalAlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="neobrutal-alert-dialog-cancel"
      className={cn(
        'inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-black transition-transform duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(255,82,82,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
        className,
      )}
      {...props}
    />
  );
}

export {
  NeobrutalAlertDialog as AlertDialog,
  NeobrutalAlertDialogTrigger as AlertDialogTrigger,
  NeobrutalAlertDialogPortal as AlertDialogPortal,
  NeobrutalAlertDialogOverlay as AlertDialogOverlay,
  NeobrutalAlertDialogContent as AlertDialogContent,
  NeobrutalAlertDialogHeader as AlertDialogHeader,
  NeobrutalAlertDialogFooter as AlertDialogFooter,
  NeobrutalAlertDialogTitle as AlertDialogTitle,
  NeobrutalAlertDialogDescription as AlertDialogDescription,
  NeobrutalAlertDialogAction as AlertDialogAction,
  NeobrutalAlertDialogCancel as AlertDialogCancel,
};

