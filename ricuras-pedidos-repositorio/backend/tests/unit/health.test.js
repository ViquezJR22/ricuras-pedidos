const request = require('supertest');
const app = require('../../src/app');

describe('Prueba de humo del entorno', () => {
  it('GET /api/health responde 200 y estado ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('ok');
  });
});
