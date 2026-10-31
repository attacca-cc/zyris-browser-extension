import { browser } from "wxt/browser";
import { connected } from "@/lib/state";

const ALL_SITES = { origins: ["<all_urls>"] };
const status = document.getElementById("status")!;
const grant = document.getElementById("grant")!;
const retry = document.getElementById("retry")!;

async function render() {
  // Firefox leaves host permissions off until the person turns them on, and without them
  // page_text and screenshot fail on every page.
  grant.hidden = await browser.permissions.contains(ALL_SITES);
  const up = await connected.getValue();
  retry.hidden = up;
  status.textContent = up
    ? "Connected to Zyris."
    : "Not connected. Open Zyris, go to Settings, and press “Link browser”.";
}

grant.addEventListener("click", async () => {
  await browser.permissions.request(ALL_SITES);
  void render();
});
retry.addEventListener("click", () => void browser.runtime.sendMessage("reconnect"));
connected.watch(() => void render());
void render();
