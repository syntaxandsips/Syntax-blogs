import { NextRequest, NextResponse } from 'next/server';

import { runResearchQuery } from '@/lib/mcp/research';
import { runSeoAnalysis } from '@/lib/mcp/seo';
import { uploadAsset } from '@/lib/mcp/storage';

const RESEARCH_MCP_URL = process.env.MCP_RESEARCH_URL ?? 'http://localhost:4000/mcp';
const SEO_MCP_URL = process.env.MCP_SEO_URL ?? 'http://localhost:4002/mcp';
const STORAGE_MCP_URL = process.env.MCP_STORAGE_URL ?? 'http://localhost:4003/mcp';

const RESEARCH_TOKEN = process.env.MCP_RESEARCH_TOKEN;
const SEO_TOKEN = process.env.MCP_SEO_TOKEN;
const STORAGE_TOKEN = process.env.MCP_STORAGE_TOKEN;

interface Params {
  params: { tool: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const payload = await request.json();

    switch (params.tool) {
      case 'research:search': {
        const result = await runResearchQuery(
          { baseUrl: RESEARCH_MCP_URL, apiKey: RESEARCH_TOKEN },
          payload,
        );
        return NextResponse.json({ result });
      }
      case 'seo:analyze': {
        const result = await runSeoAnalysis(
          { baseUrl: SEO_MCP_URL, token: SEO_TOKEN },
          payload,
        );
        return NextResponse.json({ result });
      }
      case 'storage:upload': {
        const result = await uploadAsset(
          { baseUrl: STORAGE_MCP_URL, token: STORAGE_TOKEN },
          payload,
        );
        return NextResponse.json({ result });
      }
      default:
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool invocation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
