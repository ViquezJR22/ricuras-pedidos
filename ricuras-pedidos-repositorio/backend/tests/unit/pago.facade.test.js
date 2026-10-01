const { PagoFacade } = require('../../src/modules/pagos/pago.facade');
const { PasarelaSimuladaStrategy } = require('../../src/modules/pagos/pasarela-simulada.strategy');
const { generarComprobante } = require('../../src/modules/pagos/comprobante.service');

const pedido = { id: 1, total: 12500 };

describe('PagoFacade (RF13)', () => {
  it('CP-PAG-01: pago aprobado devuelve APROBADO', async () => {
    const f = new PagoFacade(new PasarelaSimuladaStrategy({ estado: 'APROBADO' }));
    expect((await f.procesar(pedido, 'k1')).estado).toBe('APROBADO');
  });

  it('CP-PAG-02: pago rechazado devuelve RECHAZADO', async () => {
    const f = new PagoFacade(new PasarelaSimuladaStrategy({ estado: 'RECHAZADO' }));
    expect((await f.procesar(pedido, 'k2')).estado).toBe('RECHAZADO');
  });

  it('CP-PAG-03: pago pendiente devuelve PENDIENTE', async () => {
    const f = new PagoFacade(new PasarelaSimuladaStrategy({ estado: 'PENDIENTE' }));
    expect((await f.procesar(pedido, 'k3')).estado).toBe('PENDIENTE');
  });

  it('CP-PAG-04: respuesta que excede el límite devuelve TIMEOUT', async () => {
    const f = new PagoFacade(new PasarelaSimuladaStrategy({ retrasoMs: 200 }), { timeoutMs: 50 });
    expect((await f.procesar(pedido, 'k4')).estado).toBe('TIMEOUT');
  });

  it('CP-PAG-05: un reintento con la misma clave no genera un segundo cobro', async () => {
    const pasarela = new PasarelaSimuladaStrategy({ estado: 'APROBADO' });
    const f = new PagoFacade(pasarela);
    const [a, b] = await Promise.all([f.procesar(pedido, 'k5'), f.procesar(pedido, 'k5')]);
    const c = await f.procesar(pedido, 'k5');
    expect(pasarela.llamadas).toBe(1);
    expect(a).toEqual(b);
    expect(c).toEqual(a);
  });

  it('CP-PAG-08: se puede cambiar de proveedor sin modificar la fachada', async () => {
    class OtraPasarela {
      async procesar() { return { estado: 'APROBADO', referencia: 'otra_1' }; }
    }
    const f = new PagoFacade(new OtraPasarela());
    expect((await f.procesar(pedido, 'k8')).referencia).toBe('otra_1');
  });

  it('exige clave de idempotencia', async () => {
    const f = new PagoFacade(new PasarelaSimuladaStrategy());
    await expect(f.procesar(pedido)).rejects.toThrow();
  });

  it('un error de la pasarela se trata como PENDIENTE', async () => {
    class Falla { async procesar() { throw new Error('caída'); } }
    const f = new PagoFacade(new Falla());
    expect((await f.procesar(pedido, 'k9')).estado).toBe('PENDIENTE');
  });
});

describe('Comprobante de pago (RF14)', () => {
  it('CP-PAG-06: se genera solo con pago aprobado', () => {
    const c = generarComprobante(pedido, { estado: 'APROBADO', referencia: 'r1' });
    expect(c.referencia).toBe('r1');
  });

  it.each(['PENDIENTE', 'RECHAZADO', 'TIMEOUT'])('CP-PAG-06: no se genera con %s', (estado) => {
    expect(() => generarComprobante(pedido, { estado })).toThrow(/solo se genera/);
  });
});
