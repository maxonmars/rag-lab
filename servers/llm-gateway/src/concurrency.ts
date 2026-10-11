export type Release = () => void;

export type LimiterOptions = Readonly<{ maxConcurrent: number; maxQueue: number }>;

type Waiter = Readonly<{ grant: (release: Release) => void }>;

/** Семафор с FIFO-очередью: `null` — очередь полна; отмена `signal` убирает ожидающего и отклоняет промис. */
export function createLimiter(options: LimiterOptions): {
  acquire(signal: AbortSignal): Promise<Release> | null;
} {
  let active = 0;
  const queue: Waiter[] = [];

  const makeRelease = (): Release => {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const next = queue.shift();
      if (next) next.grant(makeRelease());
      else active -= 1;
    };
  };

  return {
    acquire(signal) {
      if (signal.aborted) return Promise.reject(signal.reason);
      if (active < options.maxConcurrent) {
        active += 1;
        return Promise.resolve(makeRelease());
      }
      if (queue.length >= options.maxQueue) return null;
      return new Promise<Release>((resolve, reject) => {
        const onAbort = () => {
          queue.splice(queue.indexOf(waiter), 1);
          reject(signal.reason);
        };
        const waiter: Waiter = {
          grant: (release) => {
            signal.removeEventListener("abort", onAbort);
            resolve(release);
          },
        };
        queue.push(waiter);
        signal.addEventListener("abort", onAbort, { once: true });
      });
    },
  };
}
