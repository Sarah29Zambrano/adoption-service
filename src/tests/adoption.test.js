/**
 * Tests funcionales para adoption.router.js
 * Cubre: casos positivos, negativos y de borde.
 * Usa mocks/fakes para child_process y variables de entorno.
 */

const childProcess = require('child_process');
const { handleCommand, validateUser } = require('../services/index');

// ─────────────────────────────────────────────────────────────────────────────
// GET /adoptions
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /adoptions', () => {
  it('✅ devuelve un array con al menos una adopción', () => {
    const result = handleCommand({ method: 'GET', endpoint: '/adoptions' });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('✅ cada adopción tiene la forma correcta', () => {
    const result = handleCommand({ method: 'GET', endpoint: '/adoptions' });
    result.forEach(a => {
      expect(a).toMatchObject({
        id:     expect.any(Number),
        petId:  expect.any(Number),
        userId: expect.any(Number),
        status: expect.stringMatching(/^(adopted|pending)$/),
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /adoptions — casos positivos
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /adoptions — éxito', () => {
  beforeEach(() => { process.env.SKIP_USER_VALIDATION = 'true'; });
  afterEach(() => { delete process.env.SKIP_USER_VALIDATION; });

  it('✅ crea adopción y devuelve status "pending"', () => {
    const result = handleCommand({
      method: 'POST', endpoint: '/adoptions',
      body: { petId: 10, userId: 20 },
    });
    expect(result).toMatchObject({ petId: 10, userId: 20, status: 'pending' });
    expect(typeof result.id).toBe('number');
  });

  it('✅ el ID es autoincremental', () => {
    const a = handleCommand({ method: 'POST', endpoint: '/adoptions', body: { petId: 1, userId: 1 } });
    const b = handleCommand({ method: 'POST', endpoint: '/adoptions', body: { petId: 2, userId: 2 } });
    expect(b.id).toBe(a.id + 1);
  });

  it('✅ la nueva adopción aparece en GET /adoptions', () => {
    const created = handleCommand({
      method: 'POST', endpoint: '/adoptions',
      body: { petId: 77, userId: 88 },
    });
    const list = handleCommand({ method: 'GET', endpoint: '/adoptions' });
    expect(list.find(a => a.id === created.id)).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /adoptions — casos negativos y de borde
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /adoptions — errores de validación', () => {
  beforeEach(() => { process.env.SKIP_USER_VALIDATION = 'true'; });
  afterEach(() => { delete process.env.SKIP_USER_VALIDATION; });

  it('❌ falta petId → 400', () => {
    const result = handleCommand({ method: 'POST', endpoint: '/adoptions', body: { userId: 20 } });
    expect(result.status).toBe(400);
    expect(result.error).toMatch(/petId/);
  });

  it('❌ falta userId → 400', () => {
    const result = handleCommand({ method: 'POST', endpoint: '/adoptions', body: { petId: 10 } });
    expect(result.status).toBe(400);
  });

  it('❌ body vacío → 400', () => {
    const result = handleCommand({ method: 'POST', endpoint: '/adoptions', body: {} });
    expect(result.status).toBe(400);
  });

  it('❌ body undefined → 400', () => {
    const result = handleCommand({ method: 'POST', endpoint: '/adoptions' });
    expect(result.status).toBe(400);
  });
});

describe('POST /adoptions — usuario inválido (mock child_process)', () => {
  beforeEach(() => { delete process.env.SKIP_USER_VALIDATION; });
  afterEach(() => { delete process.env.SKIP_USER_VALIDATION; });

  it('❌ spawnSync devuelve "invalid" → 400 Invalid user', () => {
    const spy = jest.spyOn(childProcess, 'spawnSync')
      .mockReturnValue({ stdout: Buffer.from('invalid') });

    const result = handleCommand({
      method: 'POST', endpoint: '/adoptions',
      body: { petId: 10, userId: 99 },
    });
    expect(result.status).toBe(400);
    expect(result.error).toMatch(/Invalid user/);
    spy.mockRestore();
  });

  it('✅ spawnSync devuelve "valid" → adopción creada', () => {
    const spy = jest.spyOn(childProcess, 'spawnSync')
      .mockReturnValue({ stdout: Buffer.from('valid') });

    const result = handleCommand({
      method: 'POST', endpoint: '/adoptions',
      body: { petId: 5, userId: 6 },
    });
    expect(result).toMatchObject({ petId: 5, userId: 6, status: 'pending' });
    spy.mockRestore();
  });

  it('🔍 spy verifica que spawnSync es invocado exactamente una vez', () => {
    const spy = jest.spyOn(childProcess, 'spawnSync')
      .mockReturnValue({ stdout: Buffer.from('valid') });

    handleCommand({ method: 'POST', endpoint: '/adoptions', body: { petId: 1, userId: 1 } });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /adoptions/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /adoptions/:id', () => {
  it('✅ devuelve adopción existente (id=1)', () => {
    const result = handleCommand({ method: 'GET', endpoint: '/adoptions/1' });
    expect(result).toMatchObject({ id: 1, petId: 123, userId: 456 });
  });

  it('❌ id inexistente → 404', () => {
    const result = handleCommand({ method: 'GET', endpoint: '/adoptions/9999' });
    expect(result.status).toBe(404);
    expect(result.error).toBe('Not found');
  });

  it('❌ id=0 → 404', () => {
    const result = handleCommand({ method: 'GET', endpoint: '/adoptions/0' });
    expect(result.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rutas desconocidas
// ─────────────────────────────────────────────────────────────────────────────
describe('Rutas no definidas', () => {
  it('❌ GET /unknown → 404', () => {
    const result = handleCommand({ method: 'GET', endpoint: '/unknown' });
    expect(result.status).toBe(404);
  });

  it('❌ DELETE /adoptions/1 → 404', () => {
    const result = handleCommand({ method: 'DELETE', endpoint: '/adoptions/1' });
    expect(result.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateUser — unitarios
// ─────────────────────────────────────────────────────────────────────────────
describe('validateUser', () => {
  it('✅ retorna true con SKIP_USER_VALIDATION=true (fake de entorno)', () => {
    process.env.SKIP_USER_VALIDATION = 'true';
    expect(validateUser(1)).toBe(true);
    delete process.env.SKIP_USER_VALIDATION;
  });

  it('✅ retorna true para userId positivo via proceso hijo real', () => {
    expect(validateUser(42)).toBe(true);
  });

  it('❌ retorna false para userId 0 via proceso hijo real', () => {
    expect(validateUser(0)).toBe(false);
  });
});