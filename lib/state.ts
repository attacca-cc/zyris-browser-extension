import { storage } from "wxt/utils/storage";

/** Whether the native host has reached a running Zyris app, shared by background and popup. */
export const connected = storage.defineItem<boolean>("session:connected", { fallback: false });
