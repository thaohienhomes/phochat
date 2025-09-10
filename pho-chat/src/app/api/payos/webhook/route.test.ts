import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mocks
const verifyMock = vi.fn();
const mutationMock = vi.fn();

vi.mock('@/lib/payos', () => ({
  getPayOS: () => ({ webhooks: { verify: verifyMock } }),
}));

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class MockConvexHttpClient {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(_url: string) {}
    mutation = mutationMock;
    query = vi.fn();
  },
}));

beforeEach(() => {
  verifyMock.mockReset();
  mutationMock.mockReset();
});

function makeReq(body: any) {
  return new Request('http://localhost/api/payos/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;
}

describe('PayOS webhook route', () => {
  it('returns 400 when verify result has no orderCode', async () => {
    verifyMock.mockResolvedValueOnce({});
    const res = await POST(makeReq({ signature: 'sig', any: 'payload' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it("records new event and updates status to succeeded when code is '00'", async () => {
    verifyMock.mockResolvedValueOnce({
      orderCode: 123,
      code: '00',
      id: 'evt_1',
    });
    // First mutation: recordEventIfNew -> true, Second: setStatusByOrderCode
    mutationMock.mockResolvedValueOnce(true).mockResolvedValueOnce('ok');

    const res = await POST(makeReq({ signature: 'sig', whatever: true }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);

    expect(mutationMock).toHaveBeenCalledTimes(2);

    const firstArgs = mutationMock.mock.calls[0]?.[1];
    expect(firstArgs).toMatchObject({ orderCode: 123 });
    expect(firstArgs).toHaveProperty('eventHash');
    expect(firstArgs).toHaveProperty('payload');

    const secondArgs = mutationMock.mock.calls[1]?.[1];
    expect(secondArgs).toMatchObject({ orderCode: 123, status: 'succeeded' });
  });

  it('early-returns duplicate when recordEventIfNew is false', async () => {
    verifyMock.mockResolvedValueOnce({ orderCode: 456, status: 'PAID' });
    // recordEventIfNew -> false
    mutationMock.mockResolvedValueOnce(false);

    const res = await POST(makeReq({ signature: 'sig', foo: 'bar' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ received: true, duplicate: true });

    // Only one mutation call (recordEventIfNew), no status update
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });
  it('returns 200 for empty POST (healthcheck)', async () => {
    const res = await POST(new Request('http://localhost/api/payos/webhook', { method: 'POST' }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, healthcheck: true });
  });

  it('returns 200 for non-JSON POST (healthcheck)', async () => {
    const res = await POST(new Request('http://localhost/api/payos/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'ping',
    }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, healthcheck: true });
  });

});
