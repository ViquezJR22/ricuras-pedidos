// Resultados posibles de una transacción de pago (RF13)
const ESTADOS = Object.freeze({
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  PENDIENTE: 'PENDIENTE',
  TIMEOUT: 'TIMEOUT',
});

module.exports = { ESTADOS };
