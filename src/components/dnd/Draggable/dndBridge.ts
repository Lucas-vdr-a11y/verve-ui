/**
 * dndBridge — a tiny in-memory channel that lets `Draggable` hand a rich
 * (possibly non-serializable) payload to `Droppable` during a native HTML5
 * drag. The DataTransfer API only carries strings, so we stash the live value
 * here and put a lightweight token on the DataTransfer for cross-window cases.
 *
 * Module-scope state is SSR-safe: it is plain data, never touches
 * `window`/`document`, and is only written from event handlers in the browser.
 */
export const NOVA_DND_MIME = "application/x-nova-dnd";

let activePayload: unknown = undefined;
let activeType: string | undefined = undefined;

export function setActiveDrag(payload: unknown, type?: string): void {
  activePayload = payload;
  activeType = type;
}

export function getActiveDrag(): { payload: unknown; type?: string } {
  return { payload: activePayload, type: activeType };
}

export function clearActiveDrag(): void {
  activePayload = undefined;
  activeType = undefined;
}
