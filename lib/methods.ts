import { browser } from "wxt/browser";

/** A request from Zyris, relayed by the native host. */
export type Request = { id: number; method: string; params?: Record<string, unknown> };
/** The answer sent back for one request: exactly one of `result` or `error`. */
export type Reply = { id: number; result?: unknown; error?: string };

type Params = Record<string, unknown>;

async function target(params: Params) {
  if (typeof params.tabId === "number") return browser.tabs.get(params.tabId);
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab) throw new Error("no active tab");
  return tab;
}

function url(params: Params): string {
  if (typeof params.url !== "string") throw new Error("`url` must be a string");
  return params.url;
}

const methods: Record<string, (params: Params) => Promise<unknown>> = {
  async tabs_list() {
    const tabs = await browser.tabs.query({});
    return tabs.map(({ id, windowId, title, url, active }) => ({ id, windowId, title, url, active }));
  },
  async tab_open(params) {
    const { id } = await browser.tabs.create({ url: url(params) });
    return { id };
  },
  async tab_navigate(params) {
    const tab = await target(params);
    await browser.tabs.update(tab.id!, { url: url(params) });
    return { id: tab.id };
  },
  async page_text(params) {
    const tab = await target(params);
    const [frame] = await browser.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => document.body?.innerText ?? "",
    });
    return { id: tab.id, title: tab.title, url: tab.url, text: frame?.result ?? "" };
  },
  async screenshot(params) {
    const tab = await target(params);
    // captureVisibleTab shows only what is on screen, so the tab is brought to the front first.
    await browser.tabs.update(tab.id!, { active: true });
    await browser.windows.update(tab.windowId!, { focused: true });
    const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId!, { format: "png" });
    return { id: tab.id, png: dataUrl.slice(dataUrl.indexOf(",") + 1) };
  },
};

export async function handle({ id, method, params }: Request): Promise<Reply> {
  const run = methods[method];
  if (!run) return { id, error: `unknown method: ${method}` };
  try {
    return { id, result: await run(params ?? {}) };
  } catch (e) {
    return { id, error: e instanceof Error ? e.message : String(e) };
  }
}
