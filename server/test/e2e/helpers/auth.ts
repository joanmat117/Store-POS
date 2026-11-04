import request from 'supertest';
import type { Express } from 'express';

export interface AuthTokens {
  token: string;
  user: { id: number; username: string; role: string; permissions: string[] };
}

let cachedAdminToken: AuthTokens | null = null;

export async function loginAsAdmin(app: Express): Promise<AuthTokens> {
  if (cachedAdminToken) return cachedAdminToken;

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin' })
    .expect(200);

  cachedAdminToken = {
    token: res.body.token,
    user: res.body.user,
  };
  return cachedAdminToken;
}

export async function loginAs(app: Express, username: string, password: string): Promise<AuthTokens> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
    .expect(200);
  return {
    token: res.body.token,
    user: res.body.user,
  };
}

export function authHeader(tokens: AuthTokens): Record<string, string> {
  return { Authorization: `Bearer ${tokens.token}` };
}

export function clearAuthCache() { cachedAdminToken = null; }