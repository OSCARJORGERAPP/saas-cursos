import { describe, expect, it } from "vitest";
import {
  ORDER_STEP,
  orderForAppend,
  orderForInsertBetween,
  renumber,
  swapWithNeighbor,
  displayNumber,
} from "@/lib/ordering";

describe("orderForAppend", () => {
  it("devuelve ORDER_STEP para lista vacía", () => {
    expect(orderForAppend([])).toBe(ORDER_STEP);
  });
  it("agrega después del máximo", () => {
    expect(orderForAppend([1000, 2000, 3000])).toBe(4000);
  });
  it("funciona con órdenes desordenados", () => {
    expect(orderForAppend([3000, 1000, 2000])).toBe(4000);
  });
});

describe("orderForInsertBetween", () => {
  it("lista vacía → ORDER_STEP", () => {
    expect(orderForInsertBetween(null, null)).toBe(ORDER_STEP);
  });
  it("al inicio → antes del primero", () => {
    expect(orderForInsertBetween(null, 1000)).toBe(0);
  });
  it("al final → después del último", () => {
    expect(orderForInsertBetween(3000, null)).toBe(4000);
  });
  it("intercala en el punto medio", () => {
    expect(orderForInsertBetween(1000, 2000)).toBe(1500);
  });
  it("intercala repetidamente hasta agotar el hueco", () => {
    const before = 1000;
    const after = 1001;
    // hueco de 1: no se puede intercalar más
    expect(orderForInsertBetween(before, after)).toBeNull();
    // hueco de 2: justo el límite
    expect(orderForInsertBetween(1000, 1002)).toBe(1001);
  });
  it("devuelve null cuando no hay hueco (requiere renumeración)", () => {
    expect(orderForInsertBetween(5, 6)).toBeNull();
  });
});

describe("renumber", () => {
  it("asigna múltiplos de ORDER_STEP", () => {
    expect(renumber(3)).toEqual([1000, 2000, 3000]);
  });
  it("lista vacía", () => {
    expect(renumber(0)).toEqual([]);
  });
});

describe("swapWithNeighbor", () => {
  const orders = [1000, 2000, 3000];
  it("mueve hacia arriba intercambiando órdenes", () => {
    expect(swapWithNeighbor(orders, 1, "up")).toEqual([
      [1, 1000],
      [0, 2000],
    ]);
  });
  it("mueve hacia abajo", () => {
    expect(swapWithNeighbor(orders, 1, "down")).toEqual([
      [1, 3000],
      [2, 2000],
    ]);
  });
  it("no mueve el primero hacia arriba", () => {
    expect(swapWithNeighbor(orders, 0, "up")).toEqual([]);
  });
  it("no mueve el último hacia abajo", () => {
    expect(swapWithNeighbor(orders, 2, "down")).toEqual([]);
  });
});

describe("displayNumber", () => {
  it("numeración visible 1-based", () => {
    expect(displayNumber(0)).toBe(1);
    expect(displayNumber(4)).toBe(5);
  });
});
