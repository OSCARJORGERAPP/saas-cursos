export const ORDER_STEP = 1000;
export const MIN_GAP = 1;

/** Orden para agregar al final de una lista. */
export function orderForAppend(orders: number[]): number {
  if (orders.length === 0) return ORDER_STEP;
  return Math.max(...orders) + ORDER_STEP;
}

/**
 * Orden para insertar entre dos elementos (punto medio).
 * `before` o `after` pueden ser null si se inserta al inicio o al final.
 * Devuelve null si no hay hueco suficiente: el llamador debe renumerar primero.
 */
export function orderForInsertBetween(
  before: number | null,
  after: number | null
): number | null {
  if (before === null && after === null) return ORDER_STEP;
  if (before === null) return after! - ORDER_STEP;
  if (after === null) return before + ORDER_STEP;
  if (after - before < MIN_GAP * 2) return null;
  return (before + after) / 2;
}

/**
 * Renumera una lista ordenada asignando múltiplos de ORDER_STEP.
 * Devuelve los nuevos órdenes en el mismo orden de entrada.
 */
export function renumber(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * ORDER_STEP);
}

/**
 * Intercambia las posiciones lógicas de un elemento con su vecino
 * (mover arriba/abajo). Recibe la lista de órdenes ASC y el índice a mover.
 * Devuelve pares [índice, nuevoOrden] a persistir, o [] si no hay movimiento.
 */
export function swapWithNeighbor(
  orders: number[],
  index: number,
  direction: "up" | "down"
): Array<[number, number]> {
  const j = direction === "up" ? index - 1 : index + 1;
  if (j < 0 || j >= orders.length) return [];
  return [
    [index, orders[j]],
    [j, orders[index]],
  ];
}

/** Numeración visible (1-based) según posición en la lista ordenada. */
export function displayNumber(index: number): number {
  return index + 1;
}
