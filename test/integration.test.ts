import { describe, expect, it } from "vitest";
import { PepkioClient } from "../src/client.js";
import { DEFAULT_API_BASE_URL } from "../src/config.js";

const LOCAL_BASE_URL = "https://tools.localtest.me";
const PRODUCTION_BASE_URL = "https://tools.pepkio.com";

function envConfig(env: "local" | "production") {
  const baseUrl = process.env.PEPKIO_API_BASE_URL
    ? process.env.PEPKIO_API_BASE_URL.replace(/\/$/, "")
    : env === "local"
      ? LOCAL_BASE_URL
      : PRODUCTION_BASE_URL;

  const isLocal = baseUrl.includes("localtest.me");
  const apiKey = isLocal
    ? process.env.LOCAL_PEPKIO_API_KEY ?? process.env.PEPKIO_API_KEY
    : process.env.PEPKIO_API_KEY;

  return { baseUrl, apiKey, isLocal };
}

describe("integration: local", () => {
  const { baseUrl, apiKey } = envConfig("local");

  it.skipIf(!apiKey)("fetches manifest", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const manifest = await client.getManifest();

    expect(manifest.tool_id).toBe("bio-combinatorics-calculator");
    const names = manifest.examples?.map((e) => e.name) ?? [];
    expect(names).toContain("combination_10_choose_3");
    expect(names).toContain("index_multiplex_96_well");
    expect(names).toContain("iupac_rydh");
    expect(names).toContain("crispr_scaling");
  });

  it.skipIf(!apiKey)("runs combination_10_choose_3 example", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const input = await client.getExampleInput("combination_10_choose_3");
    const result = await client.run(input);

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
    expect(result.result?.count_exact).toBe("120");
    expect(result.result?.mode).toBe("combination");
  }, 60_000);

  it.skipIf(!apiKey)("runs index_multiplex_96_well example", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const input = await client.getExampleInput("index_multiplex_96_well");
    const result = await client.run(input);

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
    expect(result.result?.count_exact).toBe("96");
  }, 60_000);

  it.skipIf(!apiKey)("runs iupac_rydh example", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const input = await client.getExampleInput("iupac_rydh");
    const result = await client.run(input);

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
  }, 60_000);

  it.skipIf(!apiKey)("runs crispr_scaling example", async () => {
    const client = new PepkioClient({ baseUrl, apiKey });
    const input = await client.getExampleInput("crispr_scaling");
    const result = await client.run(input);

    expect(result.status).toBe("completed");
    expect(result.error).toBeFalsy();
    expect(result.result?.ready).toBe(true);
  }, 60_000);
});

describe("integration: production", () => {
  const { baseUrl, apiKey } = envConfig("production");

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "fetches manifest",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const manifest = await client.getManifest();

      expect(manifest.tool_id).toBe("bio-combinatorics-calculator");
      const names = manifest.examples?.map((e) => e.name) ?? [];
      expect(names).toContain("combination_10_choose_3");
      expect(names).toContain("index_multiplex_96_well");
      expect(names).toContain("iupac_rydh");
      expect(names).toContain("crispr_scaling");
    },
  );

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "runs combination_10_choose_3 example",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const input = await client.getExampleInput("combination_10_choose_3");
      const result = await client.run(input);

      expect(result.status).toBe("completed");
      expect(result.error).toBeFalsy();
      expect(result.result?.ready).toBe(true);
      expect(result.result?.count_exact).toBe("120");
      expect(result.result?.mode).toBe("combination");
    },
    60_000,
  );

  it.skipIf(!apiKey || baseUrl.includes("localtest.me"))(
    "runs crispr_scaling example",
    async () => {
      const client = new PepkioClient({
        baseUrl: PRODUCTION_BASE_URL,
        apiKey,
      });
      const input = await client.getExampleInput("crispr_scaling");
      const result = await client.run(input);

      expect(result.status).toBe("completed");
      expect(result.error).toBeFalsy();
      expect(result.result?.ready).toBe(true);
    },
    60_000,
  );
});

describe("integration: config defaults", () => {
  it("uses production base URL by default", () => {
    expect(DEFAULT_API_BASE_URL).toBe("https://tools.pepkio.com");
  });
});
