const { ESTADOS } = require('./estados');

// Fachada que centraliza la integración con la pasarela de pago.
// Reglas: límite de 10 s, tres resultados (aprobado, rechazado, pendiente)
// y un solo cobro por clave de idempotencia (reintentos de red).
class PagoFacade {
  constructor(estrategia, { timeoutMs = 10000 } = {}) {
    this.estrategia = estrategia;
    this.timeoutMs = timeoutMs;
    this.finales = new Map();
    this.enCurso = new Map();
  }

  async procesar(pedido, claveIdempotencia) {
    if (!claveIdempotencia) throw new Error('Se requiere una clave de idempotencia');
    if (this.finales.has(claveIdempotencia)) return this.finales.get(claveIdempotencia);
    if (this.enCurso.has(claveIdempotencia)) return this.enCurso.get(claveIdempotencia);

    const promesa = this._ejecutar(pedido, claveIdempotencia)
      .then((res) => {
        if (res.estado === ESTADOS.APROBADO || res.estado === ESTADOS.RECHAZADO) {
          this.finales.set(claveIdempotencia, res);
        }
        return res;
      })
      .finally(() => this.enCurso.delete(claveIdempotencia));

    this.enCurso.set(claveIdempotencia, promesa);
    return promesa;
  }

  async _ejecutar(pedido, clave) {
    let temporizador;
    const limite = new Promise((resolve) => {
      temporizador = setTimeout(() => resolve({ estado: ESTADOS.TIMEOUT }), this.timeoutMs);
    });
    // Si la pasarela falla sin respuesta clara, el resultado es desconocido:
    // se trata como PENDIENTE para no asumir que se cobró ni que no se cobró.
    const llamada = this.estrategia
      .procesar(pedido, clave)
      .catch(() => ({ estado: ESTADOS.PENDIENTE, motivo: 'error_pasarela' }));
    try {
      return await Promise.race([llamada, limite]);
    } finally {
      clearTimeout(temporizador);
    }
  }
}

module.exports = { PagoFacade };
