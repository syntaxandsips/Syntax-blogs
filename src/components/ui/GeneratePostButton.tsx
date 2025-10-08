"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/neobrutal/alert-dialog';

export default function GeneratePostButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className="neo-button flex items-center space-x-2 py-2 px-4">
          <Sparkles size={16} />
          <span>Generate Post</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>The AI generator is not live yet</AlertDialogTitle>
          <AlertDialogDescription>
            We are still connecting the automated drafting workflow. For now, you can start from one of the existing
            articles or our internal templates while we finish the integration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Got it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
