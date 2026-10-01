// Estrategia de pasarela simulada: sirve para pruebas y demuestra que el
// proveedor se puede cambiar sin tocar PagoFacade (patrón Strategy).
// La estrategia real de Stripe (modo prueba) se implementa en el Sprint 1.
class PasarelaSimuladaStrategy {
  constructor({ estado = 'APROBADO', retrasoMs = 0 } = {}) {
    this.estado = estado;
    this.retrasoMs = retrasoMs;
    this.llamadas = 0;
  }

  async procesar(pedido, claveIdempotencia) {
    this.llamadas += 1;
    await new Promise((r) => setTimeout(r, this.retrasoMs));
    return { estado: this.estado, referencia: `sim_${claveIdempotencia}` };
  }
}

module.exports = { PasarelaSimuladaStrategy };
