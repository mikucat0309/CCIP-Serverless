import { HttpServer } from './utils/worker';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

describe('GET /landing', () => {
	let server: HttpServer = new HttpServer();
	beforeAll(async () => await server.beforeAll());

	it('should return 200 response', async () => {
		const req = new Request('https://ccip.opass.app/landing?token=dummy', { method: 'GET' });
		const resp = await server.fetch(req.url);
		expect(resp.status).toBe(200);

		const json = await resp.json();
		expect(json).toMatchObject({ nickname: 'Aotoki' });
	});

	it('should return 400 response', async () => {
		const req = new Request('https://ccip.opass.app/landing', { method: 'GET' });
		const resp = await server.fetch(req.url);
		expect(resp.status).toBe(400);

		const json = await resp.json();
		expect(json).toMatchObject({ message: 'invalid token' });
	});
});
