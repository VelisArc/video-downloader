import { describe, expect, it } from 'vitest';
import app from './index';
import type { Env } from '../worker-configuration';

const env = {} as Env;

function request(path: string, init: RequestInit = {}, ip = '203.0.113.1') {
  const headers = new Headers(init.headers);
  headers.set('cf-connecting-ip', ip);
  return app.request(path, { ...init, headers }, env);
}

describe('ShareHub worker', () => {
  it('reports health', async () => {
    const response = await request('/api/health');
    expect(response.status).toBe(200);
    const body = (await response.json()) as any;
    expect(body.ok).toBe(true);
    expect(body.authConfigured).toBe(false);
  });

  it('exposes public config with both legacy and current keys', async () => {
    const response = await request(
      '/api/config',
      { headers: { Origin: 'https://example.com' } },
      '203.0.113.2',
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    const body = (await response.json()) as any;
    expect(body).toMatchObject({
      razorpayConfigured: false,
      paymentConfigured: false,
      authConfigured: false,
      guestDailyLimit: 1,
    });
  });

  it('answers CORS preflight', async () => {
    const response = await request(
      '/api',
      { method: 'OPTIONS', headers: { Origin: 'https://example.com' } },
      '203.0.113.3',
    );
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-methods')).toContain('POST');
  });

  it('rejects invalid URLs', async () => {
    const response = await request(
      '/api',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'http://127.0.0.1/video.mp4' }),
      },
      '203.0.113.4',
    );
    expect(response.status).toBe(400);
  });

  it('does not consume quota when extraction is not configured', async () => {
    const response = await request(
      '/api',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/watch?v=1', type: 'video' }),
      },
      '203.0.113.5',
    );
    expect(response.status).toBe(501);
  });

  it('resolves a direct media URL and enforces the guest quota', async () => {
    const first = await request(
      '/api',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/clip.mp4?token=1', type: 'video' }),
      },
      '203.0.113.6',
    );
    expect(first.status).toBe(200);
    const body = (await first.json()) as any;
    expect(body.downloadUrl).toContain('/clip.mp4');
    expect(body.ext).toBe('mp4');
    expect(body.quota.remaining).toBe(0);

    const second = await request(
      '/api',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/clip.mp4?token=1', type: 'video' }),
      },
      '203.0.113.6',
    );
    expect(second.status).toBe(429);
  });

  it('requires authentication to be configured for account endpoints', async () => {
    const response = await request('/api/cookies', {}, '203.0.113.7');
    expect(response.status).toBe(503);
  });

  it('returns 404 as JSON', async () => {
    const response = await request('/missing', {}, '203.0.113.8');
    expect(response.status).toBe(404);
    const body = (await response.json()) as any;
    expect(body.error).toBe('Not found');
  });
});
