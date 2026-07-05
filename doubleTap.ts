import { storage } from "@vendetta/plugin";

const lastTapByMessageId = new Map<string, number>();

/**
 * Returns true if this call is the *second* tap on `messageId` within the
 * configured threshold. Resets state either way so a third tap starts fresh
 * instead of accidentally chaining into another trigger.
 */
export function isDoubleTap(messageId: string): boolean {
  const now = Date.now();
  const last = lastTapByMessageId.get(messageId) ?? 0;
  const threshold = (storage.tapThresholdMs as number) ?? 300;

  // Cheap hygiene so this map never grows unbounded in a long session.
  if (lastTapByMessageId.size > 500) lastTapByMessageId.clear();

  if (now - last < threshold) {
    lastTapByMessageId.delete(messageId);
    return true;
  }

  lastTapByMessageId.set(messageId, now);
  return false;
}
