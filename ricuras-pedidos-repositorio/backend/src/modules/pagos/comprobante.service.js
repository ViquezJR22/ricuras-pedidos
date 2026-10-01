const { ESTADOS } = require('./estados');

// RF14: el comprobante solo existe si el pago quedó realmente aprobado.
function generarComprobante(pedido, resultadoPago) {
  if (!resultadoPago || resultadoPago.estado !== ESTADOS.APROBADO) {
    const error = new Error('El comprobante solo se genera con un pago aprobado');
    error.status = 409;
    throw error;
  }
  return {
    pedidoId: pedido.id,
    monto: pedido.total,
    referencia: resultadoPago.referencia,
    fecha: new Date().toISOString(),
  };
}

module.exports = { generarComprobante };
