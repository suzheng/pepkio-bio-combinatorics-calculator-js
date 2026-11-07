// SPDX-License-Identifier: MIT
import { z } from "zod";

export const bioCombinatoricsModeSchema = z.enum([
  "permutation",
  "combination",
  "permutation_with_repetition",
  "combination_with_repetition",
  "multiset_permutation",
  "index_multiplex",
  "hamming_barcode",
  "iupac_degeneracy",
  "crispr_cell_scaling",
]);

export const bioCombinatoricsCalculatorInputSchema = z.object({
  mode: bioCombinatoricsModeSchema,
  n: z.number().int().nonnegative().optional(),
  r: z.number().int().nonnegative().optional(),
  multiset_items: z.string().optional(),
  choices_per_position: z.array(z.number().int().positive()).optional(),
  barcode_length: z.number().int().positive().optional(),
  min_hamming_distance: z.number().int().min(1).optional(),
  barcodes_needed: z.number().int().positive().optional(),
  alphabet_size: z.number().int().min(2).max(16).optional(),
  iupac_sequence: z.string().optional(),
  library_size: z.number().int().positive().optional(),
  coverage_per_guide: z.number().positive().optional(),
  replicates: z.number().int().positive().optional(),
  moi: z.number().positive().optional(),
  enumerate: z.boolean().optional(),
});

export type BioCombinatoricsCalculatorInput = z.infer<typeof bioCombinatoricsCalculatorInputSchema>;

export function parseRunInput(input: unknown): BioCombinatoricsCalculatorInput {
  return bioCombinatoricsCalculatorInputSchema.parse(input);
}
