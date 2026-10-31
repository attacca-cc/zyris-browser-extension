import { browser } from "wxt/browser";
import { handle, type Request } from "@/lib/methods";
import { connected } from "@/lib/state";

/** The name Zyris registers its native messaging host under. */
const HOST = "cc.attacca.zyris";
const FIRST_RETRY_MS = 5_000;
const LAST_RETRY_MS = 60_000;

export default defineBackground(() => {
  let retry: ReturnType<typeof setTimeout> | undefined;
  let delay = FIRST_RETRY_MS;
  let port: ReturnType<typeof browser.runtime.connectNative> | undefined;

  function connect() {
    clearTimeout(retry);
    port?.disconnect();
    const current = browser.runtime.connectNative(HOST);
    port = current;
    current.onMessage.addListener(async (message: Request | { hello: true }) => {
      // The host says hello once it reaches the Zyris app, which is what "connected" means.
      if (!("method" in message)) {
        delay = FIRST_RETRY_MS;
        return void connected.setValue(true);
      }
      current.postMessage(await handle(message));
    });
    current.onDisconnect.addListener(() => {
      void connected.setValue(false);
      // A host that is not installed, or a Zyris that is not running, disconnects at once. Keep
      // trying so linking or starting Zyris takes effect without reloading the extension, but
      // back off: every attempt starts a process.
      retry = setTimeout(connect, delay);
      delay = Math.min(delay * 2, LAST_RETRY_MS);
    });
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message !== "reconnect") return;
    delay = FIRST_RETRY_MS;
    connect();
  });
  connect();
});
