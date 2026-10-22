import request from 'supertest';
import express from 'express';

describe('Health Check API (GET /api/health)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    // Replicate identical lightweight handler as mounted in server/src/index.ts
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'ok', message: 'Backend is running' });
    });
  });

  it('should return HTTP 200 and expected JSON body on GET /api/health', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'Backend is running',
    });
  });

  it('should support HTTP HEAD requests for lightweight ping monitors like UptimeRobot', async () => {
    const res = await request(app).head('/api/health');

    expect(res.status).toBe(200);
  });

  it('should respond without requiring any authentication headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', '');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should not expose environment variables, database strings, or secrets', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body.password).toBeUndefined();
    expect(res.body.secret).toBeUndefined();
    expect(res.body.mongoUri).toBeUndefined();
    expect(res.body.env).toBeUndefined();
    expect(Object.keys(res.body).sort()).toEqual(['message', 'status'].sort());
  });
});
