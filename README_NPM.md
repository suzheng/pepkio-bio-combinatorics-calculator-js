# Pepkio Bio Combinatorics Calculator

Node.js and TypeScript client library with CLI for evaluating exact combinatorial combinations, NGS dual-index multiplexing layouts, degenerate IUPAC primer pools, and CRISPR library cell transduction scaling via the Pepkio Tools API.

# What It Does

Designing experimental protocols in molecular biology, high-throughput sequencing, and functional genomics requires computing exact combinatorial possibilities. Spreadsheets and standard floating-point calculators encounter precision loss or integer overflow when calculating large factorials or combinatorial spaces, and lack specialized biological models for nucleic acid degeneracy and cell culture scaling.

This package provides a typed Node.js client and command-line interface for the hosted Pepkio Bio Combinatorics Calculator REST API. It evaluates exact combinations ($C(n,r)$), permutations ($P(n,r)$), multi-position NGS indexing arrangements, IUPAC degenerate primer pools, Hamming distance barcode bounds, and Poisson-based cell transduction requirements for pooled CRISPR screens.

Programmatic runs require a network connection and a Pepkio API key. Calculations are processed via the Pepkio Tools API.

# Features

- **Exact BigInt Combinatorics**: Computes combinations ($n \text{ choose } r$) and permutations ($n \text{ permute } r$) with arbitrary precision without floating-point rounding.
- **NGS Dual-Index Multiplexing**: Calculates total unique sample capacities for Illumina i5/i7 dual-indexing and multi-index arrays to avoid collision.
- **IUPAC Degenerate Primer Analysis**: Determines exact sequence variant counts, GC-content range, and multiplicity for oligonucleotides with IUPAC ambiguity codes.
- **Hamming Distance Barcode Bounds**: Estimates maximum distinct DNA barcode capacities for given sequence lengths under minimum distance constraints.
- **CRISPR Screen Cell Scaling**: Computes minimum transduced cell numbers, culture vessel counts, and media volume required to maintain guide representation at a target MOI.
- **Typed ESM Client**: TypeScript definitions with Zod schema validation and Promise-based API methods (`getManifest`, `listExamples`, `getExampleInput`, `run`).
- **Command-Line Interface (CLI)**: Inspect tool manifests and execute calculations directly from the terminal.
- **Shareable Permalinks**: Generates permanent calculation URLs for reproducible documentation and lab notebooks.

# Installation

```bash
npm install pepkio-bio-combinatorics-calculator
```

Requires Node.js 18 or newer.

# Configuration

Set an API key with **tools:run** scope before invoking `run()`:

```bash
export PEPKIO_API_KEY="your-api-key"
```

Create and manage keys in your [Pepkio Account](https://www.pepkio.com/account/api-keys).

Optional configuration variables:

| Variable | Purpose |
|----------|---------|
| `PEPKIO_API_KEY` | Production API key (required for `run`) |
| `LOCAL_PEPKIO_API_KEY` | Local development key when `PEPKIO_API_BASE_URL` points to `tools.localtest.me` |
| `PEPKIO_API_BASE_URL` | API base URL (default: `https://tools.pepkio.com`) |

# Quick Example

```typescript
import { PepkioClient } from "pepkio-bio-combinatorics-calculator";

const client = new PepkioClient({ apiKey: process.env.PEPKIO_API_KEY });

// 1. Calculate combinations: C(10, 3)
const combInput = await client.getExampleInput("combination_10_choose_3");
const combResult = await client.run(combInput);
console.log("Combinations:", combResult.result?.count_exact); // "120"
console.log("Interpretation:", combResult.result?.interpretation);
console.log("Permalink:", combResult.permalink);

// 2. Evaluate IUPAC primer degeneracy for sequence "RYDH"
const iupacInput = await client.getExampleInput("iupac_rydh");
const iupacResult = await client.run(iupacInput);
console.log("IUPAC Variants:", iupacResult.result?.count_exact); // "36"
```

# CLI

```bash
# List available manifest examples
npx pepkio-bio-combinatorics-calculator manifest --examples

# Run a calculation example
npx pepkio-bio-combinatorics-calculator run --example combination_10_choose_3
```

# Typical Use Cases

- **NGS Dual-Index Multiplexing**: Determine sample pooling capacity when combining i5 and i7 adapter indices across 96-well or 384-well plates.
- **Degenerate PCR Primer Design**: Compute unique sequence variants and GC distribution for primers targeting polymorphic viral or bacterial loci.
- **CRISPR Screen Scaling**: Calculate target cell numbers and culture vessels for pooled sgRNA libraries to maintain 200x–500x coverage at MOI 0.3.
- **Error-Correcting Barcode Layouts**: Evaluate maximum distinct DNA barcodes for single-cell lineage tracing with minimum Hamming distance ($d \ge 3$).
- **Combinatorial Library Design**: Compute theoretical library sizes for site-saturation mutagenesis and antibody CDR randomization.

# Scientific Background

Standard 64-bit floating point arithmetic (IEEE 754) loses exact integer precision beyond $2^{53} - 1$. Biological factorials and combination spaces frequently exceed this range. The Pepkio engine uses arbitrary-precision integer arithmetic for combinations ($C(n,r) = \frac{n!}{r!(n-r)!}$) and permutations ($P(n,r) = \frac{n!}{(n-r)!}$).

For degenerate primers, multiplicity equals the product of base options at each IUPAC position ($D = \prod d_i$). For pooled viral CRISPR screens, transduction follows Poisson statistics ($P(k) = \frac{\lambda^k e^{-\lambda}}{k!}$); at low MOI ($\lambda = 0.3$), approximately 74% of transduced cells contain a single guide integration, dictating total cell culture requirements: $N_{\text{cells}} = \frac{N_{\text{guides}} \times \text{Coverage}}{1 - e^{-\lambda}}$.

# Web Application

For researchers who prefer a graphical interface, an interactive web version is available.

Web Application: https://www.pepkio.com/tools/bio-combinatorics-calculator

The web interface provides interactive sliders, plate layout visualizations, exportable CSV results, and shareable permalinks.

# Documentation and Resources

GitHub Repository: https://github.com/pepkio/pepkio-bio-combinatorics-calculator-js

Web Application: https://www.pepkio.com/tools/bio-combinatorics-calculator

Python client (PyPI): https://pypi.org/project/pepkio-bio-combinatorics-calculator/

# About Pepkio

Pepkio (https://www.pepkio.com/) develops software tools and bioinformatics solutions for life science researchers, including laboratory calculators and analysis services (https://www.pepkio.com/cro).

A semantic, AI-native version of this document in the K2F format is available at https://k2f.dev (https://k2f.dev/v/632d4fcda806690030bdfa582c69cf55bedab9bdb55dec203f7e562de510c7a0)
