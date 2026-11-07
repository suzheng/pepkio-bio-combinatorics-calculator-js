// SPDX-License-Identifier: MIT
export type RunStatus = "queued" | "running" | "completed" | "failed" | (string & {});

export interface RunOptions {
  idempotency_key?: string;
  label?: string;
}

export interface RunResult<T = BioCombinatoricsCalculatorResult> {
  run_id: string;
  status: RunStatus;
  result?: T;
  error?: string | null;
  result_url?: string;
  permalink?: string;
  duration_ms?: number;
}

export interface ManifestExample {
  name: string;
  description?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ToolManifest {
  schema_version: string;
  tool_id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
  execution_mode?: string;
  estimated_runtime_sec?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  agent_notes?: string;
  example_prompts?: string[];
  examples?: ManifestExample[];
  limits?: Record<string, unknown>;
  input_schema?: Record<string, unknown>;
}

export interface ExampleMeta {
  name: string;
  description?: string;
}

export type BioCombinatoricsMode =
  | "permutation"
  | "combination"
  | "permutation_with_repetition"
  | "combination_with_repetition"
  | "multiset_permutation"
  | "index_multiplex"
  | "hamming_barcode"
  | "iupac_degeneracy"
  | "crispr_cell_scaling";

export interface PositionBreakdown {
  label: string;
  choices: number;
}

export interface SecondaryMetric {
  label: string;
  value: string;
}

/** Output shape returned by bio-combinatorics-calculator */
export interface BioCombinatoricsCalculatorResult {
  ready: boolean;
  errors: string[];
  warnings: string[];
  mode: BioCombinatoricsMode | string;
  count_exact: string;
  count_formatted: string;
  formula_label: string;
  interpretation: string;
  secondary_metrics: SecondaryMetric[];
  position_breakdown?: PositionBreakdown[];
  enumeration?: string[];
  enumeration_truncated?: boolean;
  enumeration_csv?: string;
  feasible?: boolean;
  methods_text?: string;
  result_csv?: string;
  [key: string]: unknown;
}

export class PepkioAPIError extends Error {
  readonly status: number;
  readonly body?: unknown;
  readonly runId?: string;

  constructor(message: string, opts: { status: number; body?: unknown; runId?: string }) {
    super(message);
    this.name = "PepkioAPIError";
    this.status = opts.status;
    this.body = opts.body;
    this.runId = opts.runId;
  }
}
