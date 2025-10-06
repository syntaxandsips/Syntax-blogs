import { expect, test } from '@playwright/test';
import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

test.describe('Newsletter API route', () => {
  const envBackup: Record<string, string | undefined> = {};
  const originalFetch = global.fetch;

  test.beforeEach(() => {
    envBackup.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    envBackup.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  test.afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = envBackup.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = envBackup.SUPABASE_SERVICE_ROLE_KEY;
    global.fetch = originalFetch;
  });

  test('rejects invalid email addresses', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { POST } = require('../src/app/api/newsletter/route');

    const request = new Request('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error).toContain('valid email');
  });

  test('forwards requests to the Supabase edge function', async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];

    // @ts-expect-error - mock fetch for test assertion
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ input, init });
      return new Response(JSON.stringify({ message: 'Successfully subscribed' }), { status: 200 });
    };

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { POST } = require('../src/app/api/newsletter/route');

    const request = new Request('http://localhost/api/newsletter?source=hero', {
      method: 'POST',
      body: JSON.stringify({ email: 'person@example.com' }),
      headers: {
        'user-agent': 'Playwright Test Suite',
        'Content-Type': 'application/json',
        referer: 'http://localhost/',
      },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toContain('Successfully');
    expect(calls).toHaveLength(1);

    const [call] = calls;
    expect(call.init?.method).toBe('POST');
    expect(call.init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: expect.stringContaining('service-role-key'),
    });

    const body = JSON.parse(call.init?.body as string);
    expect(body.email).toBe('person@example.com');
    expect(body.source).toBe('hero');
    expect(body.metadata?.userAgent).toBe('Playwright Test Suite');
  });

  test('surfaces upstream failures gracefully', async () => {
    // @ts-expect-error - mock fetch rejection
    global.fetch = async () => {
      throw new Error('connection refused');
    };

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { POST } = require('../src/app/api/newsletter/route');

    const request = new Request('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'person@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toContain('Unable to subscribe');
  });
});
