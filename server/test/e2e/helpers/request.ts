import request, { SuperTest, Test } from 'supertest';
import type { Express } from 'express';
import { authHeader, type AuthTokens } from './auth.js';

export class ApiClient {
  private agent: SuperTest<Test>;
  private defaultTokens?: AuthTokens;

  constructor(private app: Express) {
    this.agent = request(app);
  }

  setAuth(tokens: AuthTokens) { this.defaultTokens = tokens; }
  clearAuth() { this.defaultTokens = undefined; }

  private req(method: 'get' | 'post' | 'put' | 'delete' | 'patch', url: string) {
    const r = this.agent[method](url);
    if (this.defaultTokens) r.set(authHeader(this.defaultTokens));
    return r;
  }

  get(url: string) { return this.req('get', url); }
  post(url: string) { return this.req('post', url); }
  put(url: string) { return this.req('put', url); }
  delete(url: string) { return this.req('delete', url); }
  patch(url: string) { return this.req('patch', url); }

  // Helpers con assertions comunes
  async expectOk<T = any>(method: 'get' | 'post' | 'put' | 'delete', url: string, body?: any) {
    const res = await this[method](url).send(body).expect(200);
    return res.body as T;
  }
  async expectCreated<T = any>(url: string, body?: any) {
    const res = await this.post(url).send(body).expect(200);
    return res.body as T;
  }
  async expectBadRequest(url: string, body?: any) {
    return this.post(url).send(body).expect(400);
  }
  async expectUnauthorized(url: string, body?: any) {
    const prev = this.defaultTokens; this.clearAuth();
    try { return await this.post(url).send(body).expect(401); }
    finally { this.defaultTokens = prev; }
  }
  async expectForbidden(url: string, body?: any) {
    return this.post(url).send(body).expect(403);
  }
  async expectNotFound(url: string) {
    return this.get(url).expect(404);
  }
}

export function createApiClient(app: Express) {
  return new ApiClient(app);
}