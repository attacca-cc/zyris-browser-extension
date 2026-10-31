# Zyris browser extension

Lets an agent on [Attacca](https://attacca.cc) use your Chrome or Firefox through
[Zyris](https://github.com/attacca-cc/zyris), the desktop app that connects your computer to
Attacca.

The extension talks only to the Zyris app on the same computer, over
[native messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging).
It opens no network connections of its own, and nothing reaches the browser unless Zyris is
running and linked.

## What an agent can do

Zyris offers these tools to agents under the `mcp_browser` capability:

| Tool | What it does |
| --- | --- |
| `tabs_list` | Lists every open tab: id, window, title, address, and whether it is active. |
| `tab_open` | Opens an address in a new tab. |
| `tab_navigate` | Loads an address in an existing tab (the active tab by default). |
| `page_text` | Returns the visible text of a tab's page. |
| `screenshot` | Returns a PNG of what a tab shows on screen, bringing it to the front first. |

Every call is listed in Zyris's Tools screen, and pausing tools there stops these too.

## Setup

1. Install Zyris 0.6.0 or later.
2. Install this extension (see [Development](#development) for an unpacked build).
3. In Zyris, open **Settings** and press **Link browsers**. Zyris registers itself with every
   Chrome, Chromium, Brave, Edge and Firefox it finds for your user, then restarts.
4. Click the Zyris icon in the browser toolbar to check that it says **Connected to Zyris**.
   On Firefox, press **Allow access to all sites** if the popup shows it. Without that
   permission, `page_text` and `screenshot` fail on every page.

## How it works

```
Attacca ── Zyris app ──stdio── zyris browser-mcp ──local socket── zyris (native host) ──stdio── extension
```

- Zyris starts `zyris browser-mcp` as one of its MCP servers. That process listens on a socket
  in Zyris's data directory (a named pipe on Windows).
- The browser starts Zyris's native messaging host, `cc.attacca.zyris`, when the extension
  connects. The host dials that socket and relays messages unchanged in both directions.
- Each request is `{ id, method, params }` and each reply is `{ id, result }` or `{ id, error }`.
  See [`lib/methods.ts`](lib/methods.ts).

When Zyris is not running, the host exits right away. The extension then retries, starting at
5 seconds and backing off to once a minute.

## Development

Requires Node 24 and pnpm.

```sh
pnpm install
pnpm dev            # Chrome, with reload on change
pnpm dev:firefox    # Firefox
pnpm build          # .output/chrome-mv3 and .output/firefox-mv3
pnpm zip            # store-ready zips
pnpm check && pnpm test
```

To load a build by hand:

- **Chrome:** go to `chrome://extensions`, turn on Developer mode, choose **Load unpacked**, and
  pick `.output/chrome-mv3`.
- **Firefox:** go to `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**,
  and pick `.output/firefox-mv3/manifest.json`.

The extension IDs are pinned, because Zyris's host manifest allows only these:

- Chrome (unpacked): `dombmgnljfikkmhnjohcajlmokngogpk`, from the `key` in `wxt.config.ts`.
- Firefox: `zyris@attacca.cc`.

A Chrome Web Store listing gets its own ID. That ID has to be added to `CHROME_ORIGINS` in
Zyris's `crates/zyris-app/src/browser.rs` before the store build can connect.

## License

Apache-2.0
