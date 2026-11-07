import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PepkioClient } from "../src/client.js";
import { PepkioAPIError } from "../src/types.js";

const MOCK_MANIFEST = {
  schema_version: "1.0",
  tool_id: "bio-combinatorics-calculator",
  title: "Bio Combinatorics Calculator",
  execution_mode: "sync",
  examples: [
    {
      name: "combination_10_choose_3",
      description: "10 choose 3 combinations",
      input: {
        mode: "combination",
        n: 10,
        r: 3,
      },
    },
    {
      name: "index_multiplex_96_well",
      description: "Dual indexing",
      input: {
        mode: "index_multiplex",
        choices_per_position: [8, 12],
      },
    },
  ],
};

const MOCK_RUN_RESULT = {
  run_id: "run-123",
  status: "completed",
  result: {
    ready: true,
    errors: [],
    warnings: [],
    mode: "combination",
    count_exact: "120",
    count_formatted: "120",
    formula_label: "nCr = 10! / (3!·(10−3)!)",
    interpretation: "120 unordered selections when choosing 3 from 10 distinct items.",
    secondary_metrics: [
      { label: "n", value: "10" },
      { label: "r", value: "3" },
    ],
  },
  error: null,
  result_url: "https://tools.pepkio.com/api/tools/v1/runs/run-123",
  permalink: "https://tools.pepkio.com/r/run-123",
};

describe("PepkioClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getManifest() fetches and returns tool_id", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const manifest = await client.getManifest();

    expect(manifest.tool_id).toBe("bio-combinatorics-calculator");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://tools.pepkio.com/api/tools/v1/tools/bio-combinatorics-calculator/manifest",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("getExampleInput returns parsed input from manifest example", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const input = await client.getExampleInput("combination_10_choose_3");

    expect(input.mode).toBe("combination");
    expect(input.n).toBe(10);
    expect(input.r).toBe(3);
  });

  it("getExampleInput throws for unknown example", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    await expect(client.getExampleInput("missing")).rejects.toThrow(
      'Example "missing" not found',
    );
  });

  it("run() sends correct URL, headers, and body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_RUN_RESULT),
    });

    const client = new PepkioClient({ apiKey: "secret-key" });
    const input = {
      mode: "combination" as const,
      n: 10,
      r: 3,
    };

    const result = await client.run(input, { label: "unit-test" });

    expect(result.status).toBe("completed");
    expect(result.result?.count_exact).toBe("120");

    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(
      "https://tools.pepkio.com/api/tools/v1/tools/bio-combinatorics-calculator/run",
    );
    expect(init?.method).toBe("POST");
    expect(init?.headers?.Authorization).toBe("Bearer secret-key");

    const body = JSON.parse(init?.body as string);
    expect(body.input.mode).toBe("combination");
    expect(body.input.n).toBe(10);
    expect(body.options.label).toBe("unit-test");
  });

  it("run() throws PepkioAPIError without API key", async () => {
    const client = new PepkioClient({ apiKey: "" });
    await expect(
      client.run({
        mode: "combination",
        n: 10,
        r: 3,
      }),
    ).rejects.toBeInstanceOf(PepkioAPIError);
  });

  it("throws PepkioAPIError on HTTP 401", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => JSON.stringify({ error: "Invalid API key" }),
    });

    const client = new PepkioClient({ apiKey: "bad-key" });
    await expect(
      client.run({
        mode: "combination",
        n: 10,
        r: 3,
      }),
    ).rejects.toMatchObject({ status: 401, message: "Invalid API key" });
  });

  it("throws when response body error is set", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () =>
        JSON.stringify({
          run_id: "run-err",
          status: "failed",
          error: "Validation failed",
          result: null,
        }),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    await expect(
      client.run({
        mode: "combination",
        n: 10,
        r: 3,
      }),
    ).rejects.toMatchObject({ message: "Validation failed", runId: "run-err" });
  });

  it("waitForRun() polls until completed", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/manifest")) {
        return {
          ok: true,
          status: 200,
          statusText: "OK",
          text: async () => JSON.stringify(MOCK_MANIFEST),
        };
      }
      callCount += 1;
      const status = callCount < 2 ? "running" : "completed";
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () =>
          JSON.stringify({
            ...MOCK_RUN_RESULT,
            status,
          }),
      };
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    const result = await client.waitForRun("run-123", {
      intervalMs: 10,
      timeoutMs: 5000,
    });

    expect(result.status).toBe("completed");
    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it("listExamples returns manifest examples", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(MOCK_MANIFEST),
    });

    const client = new PepkioClient({ apiKey: "test-key" });
    await client.getManifest();
    const examples = client.listExamples();

    expect(examples).toEqual([
      { name: "combination_10_choose_3", description: "10 choose 3 combinations" },
      { name: "index_multiplex_96_well", description: "Dual indexing" },
    ]);
  });
});
