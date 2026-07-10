import { findByProps } from "@vendetta/metro";

// Confirmed stable across the Vendetta/Bunny/Kettu/ShiggyCord lineage and
// even Discord's desktop client — these two functions live on the same
// internal module and both take (channelId, messageId, ...).
const MessageActions = findByProps("deleteMessage", "startEditMessage");
const UserStore = findByProps("getCurrentUser");
const PermissionStore = findByProps("can", "getGuildPermissions");

// MANAGE_MESSAGES permission bit (Discord permission flags are stable/public).
// Kept as a plain Number (not BigInt) — 8192 is far below the safe-integer
// limit, and avoiding BigInt entirely sidesteps engine-support questions.
const MANAGE_MESSAGES = 8192;

export interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
}

export function getPermissions(message: any, channel: any): Permissions {
  const me = UserStore?.getCurrentUser?.();
  const isOwn = !!me && message?.author?.id === me.id;

  let hasManageMessages = false;
  if (channel?.guild_id) {
    try {
      hasManageMessages = !!PermissionStore?.can?.(MANAGE_MESSAGES, channel);
    } catch (e) {
      hasManageMessages = false;
    }
  }

  return {
    canEdit: isOwn,
    canDelete: isOwn || hasManageMessages,
  };
}

export function deleteMessage(channelId: string, messageId: string) {
  MessageActions?.deleteMessage?.(channelId, messageId);
}

export function startEdit(channelId: string, messageId: string, content: string) {
  MessageActions?.startEditMessage?.(channelId, messageId, content);
}
