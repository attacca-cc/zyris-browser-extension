import { beforeEach, expect, test } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { handle } from "./methods";

beforeEach(() => fakeBrowser.reset());

test("an unknown method is answered with an error, not dropped", async () => {
  expect(await handle({ id: 1, method: "nope" })).toEqual({ id: 1, error: "unknown method: nope" });
});

test("a bad parameter becomes the error of that one reply", async () => {
  expect(await handle({ id: 2, method: "tab_open", params: {} })).toEqual({
    id: 2,
    error: "`url` must be a string",
  });
});

test("tab_open answers with the new tab's id", async () => {
  const reply = await handle({ id: 3, method: "tab_open", params: { url: "https://example.com" } });
  expect(reply.error).toBeUndefined();
  expect(reply.result).toEqual({ id: expect.any(Number) });
});
