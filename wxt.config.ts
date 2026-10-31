import { defineConfig } from "wxt";

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: "Zyris",
    description: "Lets Attacca drive this browser through the Zyris app on this computer.",
    permissions: ["nativeMessaging", "tabs", "scripting"],
    host_permissions: ["<all_urls>"],
    // Pins the Chrome extension ID to dombmgnljfikkmhnjohcajlmokngogpk for unpacked builds, which
    // is the ID Zyris writes into the native host manifest's `allowed_origins`.
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "zyris@attacca.cc",
              strict_min_version: "128.0",
              data_collection_permissions: { required: ["none"] },
            },
          },
        }
      : {
          key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2EPxmT3Sy5brlu5QatoCX0uHRKmTLq8cweoLuiOPT7b/S6oSQx2IH4cTwFeVSfjyI8TQqxJz5xp2CyRrKRXKpBUNkLGlJPIFHjubBPKvuFeNTu05clCJqiDsWQgKLXMrgDThFW1UaFBDEwqRwZ17E27nGG6jAn8yp1U12oE8mjSltsEELG6yY0E00u2rFquSuOVaNkgAfIwNwBphnhmhCxRedVZaU2XYZv+g+ikAEJLSoiRW1cV6YmNE39n1ZB/SbFv1SLsiUg2KsniWftQVki4Sgp0UEpO+OKIu5hCcNE8PL697ipyTXgYnxJwW1ih+LBCqNU0H4V0eZ4U6uOvm6wIDAQAB",
        }),
  }),
});
