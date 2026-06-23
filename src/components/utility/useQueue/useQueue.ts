import { useCallback, useState } from "react";

export interface UseQueueReturn<T> {
  /** The current queue contents (oldest first). */
  queue: T[];
  /** Append an item to the back of the queue. */
  add: (item: T) => void;
  /** Remove and return the item at the front of the queue (or `undefined`). */
  remove: () => T | undefined;
  /** Empty the queue. */
  clear: () => void;
  /** The item at the front of the queue, if any. */
  first: T | undefined;
  /** The item at the back of the queue, if any. */
  last: T | undefined;
  /** Number of items currently queued. */
  size: number;
}

/**
 * A FIFO queue backed by React state.
 *
 * `add` enqueues at the back; `remove` dequeues from the front and returns the
 * removed item. `clear` empties the queue. `first`, `last`, and `size` are
 * derived from the current contents.
 */
export function useQueue<T>(initialValue: T[] = []): UseQueueReturn<T> {
  const [queue, setQueue] = useState<T[]>(initialValue);

  const add = useCallback((item: T) => {
    setQueue((prev) => [...prev, item]);
  }, []);

  const remove = useCallback((): T | undefined => {
    const removed = queue[0];
    setQueue((prev) => (prev.length === 0 ? prev : prev.slice(1)));
    return removed;
  }, [queue]);

  const clear = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    add,
    remove,
    clear,
    first: queue[0],
    last: queue[queue.length - 1],
    size: queue.length,
  };
}
