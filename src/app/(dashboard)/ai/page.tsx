import { Suspense } from 'react';

import { listWorkflows } from '@/services/ai/workflowService';

import { DraftPreview } from './DraftPreview';
import { SeoInsights } from './SeoInsights';
import { WorkflowLauncher } from './WorkflowLauncher';
import { WorkflowTimeline } from './WorkflowTimeline';

export const dynamic = 'force-dynamic';

export default async function AiDashboardPage() {
  const workflows = await listWorkflows();

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border-4 border-black bg-white p-6 shadow-neobrutalist">
        <WorkflowLauncher />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border-4 border-black bg-white p-4 shadow-neobrutalist lg:col-span-2">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading timeline…</p>}>
            <WorkflowTimeline initialWorkflows={workflows} />
          </Suspense>
        </div>
        <div className="space-y-6">
          <DraftPreview />
          <SeoInsights />
        </div>
      </div>
    </div>
  );
}
