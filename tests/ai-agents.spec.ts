import { expect, test } from '@playwright/test';
import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

test('withRetries retries failures before succeeding', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { withRetries } = require('../src/agents/utils');

  let attempts = 0;
  const result = await withRetries(async () => {
    attempts += 1;
    if (attempts < 2) {
      throw new Error('retry');
    }
    return 'ok';
  });

  expect(result).toBe('ok');
  expect(attempts).toBe(2);
});

test('CoordinatorAgent executes steps sequentially', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CoordinatorAgent } = require('../src/agents/coordinatorAgent');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createAgentLogger } = require('../src/agents/utils');

  const events: unknown[] = [];
  const emitter = { emit: (_event: string, payload: unknown) => events.push(payload) };
  const logger = createAgentLogger(emitter);

  const coordinator = new CoordinatorAgent({
    logger,
    router: async () => undefined,
    onStateUpdate: state => {
      events.push(state.currentAgent);
    },
  });

  coordinator.registerWorkflow([
    {
      id: 'step-1',
      agent: 'research',
      name: 'Research Phase',
      description: 'Gather context',
      async run() {
        return {
          status: 'success',
          payload: { step: 'one' },
          toolInvocations: [],
        };
      },
    },
    {
      id: 'step-2',
      agent: 'writing',
      name: 'Draft Phase',
      description: 'Compose draft',
      async run(_context: unknown, state: Record<string, unknown>) {
        return {
          status: 'success',
          payload: { ...state, step: 'two' },
          toolInvocations: [],
        };
      },
    },
  ]);

  const result = await coordinator.executeWorkflow('workflow-1', { step: 'start' });

  expect(result.completed).toBe(true);
  expect(result.state.step).toBe('two');
  expect(events).toContain('writing');
});
