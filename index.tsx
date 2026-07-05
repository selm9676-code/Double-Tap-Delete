import { findByProps, findByName } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { logger } from "@vendetta";
import { isDoubleTap } from "./doubleTap";
import { getPermissions, deleteMessage, startEdit } from "./messageActions"; from "./lib/messageActions";
import Settings from "./Settings";

// ---- defaults -------------------------------------------------------------
storage.doubleTapAction ??= "delete"; // "delete" | "edit"
storage.confirmDelete ??= true;
storage.tapThresholdMs ??= 300;

let unpatch: (() => void) | null = null;

function handleDoubleTap(message: any, channel: any) {
  const { canEdit, canDelete } = getPermissions(message, channel);
  const action = storage.doubleTapAction;

  if (action === "edit") {
    if (!canEdit) {
      showToast("You can only edit your own messages");
      return;
    }
    startEdit(channel.id, message.id, message.content ?? "");
    return;
  }

  if (!canDelete) {
    showToast("You don't have permission to delete this message");
    return;
  }

  if (storage.confirmDelete) {
    showConfirmationAlert({
      title: "Delete Message",
      content: "This message will be permanently deleted.",
      confirmText: "Delete",
      confirmColor: "red",
      cancelText: "Cancel",
      onConfirm: () => deleteMessage(channel.id, message.id),
    });
  } else {
    deleteMessage(channel.id, message.id);
  }
}

/**
 * Finds the component responsible for rendering + handling presses on an
 * individual message bubble. This is the one part of a plugin like this
 * that can drift when Discord ships an internal refactor.
 *
 * If onLoad logs the "could not find" error below: open Settings > General >
 * Developer Settings in ShiggyCord, use the JS console, and search loaded
 * modules for something exposing both `message` and `onPress` props (or
 * reuse the action-sheet-finder plugin to identify the current key), then
 * swap the name in MODULE_KEY/EXPORT_KEY below.
 */
const MODULE_KEY = "MessageContent";
const EXPORT_KEY = "MessageContent";

export function onLoad() {
  const mod = findByProps(MODULE_KEY) ?? findByName(EXPORT_KEY, false);

  if (!mod || !mod[EXPORT_KEY]) {
    logger.error(
      "[DoubleTapEditDelete] Could not find the message row component to patch. " +
        "Discord's internals likely changed — see the comment above MODULE_KEY in index.tsx."
    );
    showToast("Double Tap Edit/Delete failed to load — see logs");
    return;
  }

  unpatch = before(EXPORT_KEY, mod, ([props]: [any]) => {
    if (!props?.message || !props?.channel) return;

    const originalOnPress = props.onPress;
    props.onPress = (...args: any[]) => {
      if (isDoubleTap(props.message.id)) {
        handleDoubleTap(props.message, props.channel);
        return;
      }
      return originalOnPress?.(...args);
    };
  });
}

export function onUnload() {
  unpatch?.();
  unpatch = null;
}

export const settings = Settings;

export default { onLoad, onUnload, settings };
