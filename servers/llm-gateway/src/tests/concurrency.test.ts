import { describe, expect, it } from "vitest";
import { createLimiter } from "../concurrency.ts";

const signal = () => new AbortController().signal;

describe("лимит параллельности", () => {
  it("даёт слот, ставит в очередь и отказывает, когда очередь полна", async () => {
    const limiter = createLimiter({ maxConcurrent: 1, maxQueue: 2 });
    const first = await limiter.acquire(signal());
    const second = limiter.acquire(signal());
    const third = limiter.acquire(signal());
    expect(first).toBeTypeOf("function");
    expect(second).toBeInstanceOf(Promise);
    expect(third).toBeInstanceOf(Promise);
    expect(limiter.acquire(signal())).toBeNull();
  });

  it("release будит ожидающих в порядке FIFO", async () => {
    const limiter = createLimiter({ maxConcurrent: 1, maxQueue: 2 });
    const order: number[] = [];
    const release = await limiter.acquire(signal());
    const second = limiter.acquire(signal())?.then((next) => {
      order.push(2);
      return next;
    });
    const third = limiter.acquire(signal())?.then((next) => {
      order.push(3);
      return next;
    });
    release?.();
    (await second)?.();
    (await third)?.();
    expect(order).toEqual([2, 3]);
  });

  it("abort удаляет ожидающего из очереди и освобождает место", async () => {
    const limiter = createLimiter({ maxConcurrent: 1, maxQueue: 1 });
    const release = await limiter.acquire(signal());
    const controller = new AbortController();
    const waiting = limiter.acquire(controller.signal);
    expect(limiter.acquire(signal())).toBeNull();
    controller.abort();
    await expect(waiting).rejects.toBeDefined();
    const replacement = limiter.acquire(signal());
    expect(replacement).toBeInstanceOf(Promise);
    release?.();
    await expect(replacement).resolves.toBeTypeOf("function");
  });

  it("уже отменённый сигнал отклоняет запрос без постановки в очередь", async () => {
    const limiter = createLimiter({ maxConcurrent: 1, maxQueue: 1 });
    await limiter.acquire(signal());
    const controller = new AbortController();
    controller.abort();
    await expect(limiter.acquire(controller.signal)).rejects.toBeDefined();
    expect(limiter.acquire(signal())).toBeInstanceOf(Promise);
  });

  it("повторный release не добавляет слот", async () => {
    const limiter = createLimiter({ maxConcurrent: 1, maxQueue: 0 });
    const release = await limiter.acquire(signal());
    release?.();
    release?.();
    expect(limiter.acquire(signal())).toBeInstanceOf(Promise);
    expect(limiter.acquire(signal())).toBeNull();
  });
});
