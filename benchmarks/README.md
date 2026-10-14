# Benchmarks

Performance of dt-toolbox **8.0.0** (with `@peter.naydenov/walk` 7.0.1) compared with the published **7.5.1** (with walk 6.1.0).

Measured on October 14, 2026: Node v26.11.1, Apple M3 Max, 128 GiB RAM, macOS (darwin arm64). Median of 5 separate Node processes per version, run alternately. Speed: in each process, the median of 15 calls after 3 warm-up calls. Retained memory: the average of 4 kept dt-objects after one warm-up instance. Allocated memory: the median of 7 calls after 15 warm-up calls, with a young generation large enough (`--max-semi-space-size=256`) that no garbage collection runs during a call; calls with a collection inside are not counted. Your numbers will differ with hardware, Node version and data.



## Speed

Median time per call. Lower is better.

| Data | Operation | 7.5.1 (walk 6.1.0) | 8.0.0 (walk 7.0.1) | Change |
|---|---|---:|---:|---:|
| wide (20k objects) | init | 82.40 ms | 40.52 ms | **-51%** |
| wide (20k objects) | flat | 72.43 ms | 33.89 ms | **-53%** |
| wide (20k objects) | load | 62.23 ms | 9.92 ms | **-84%** |
| wide (20k objects) | dt.copy() | 21.56 ms | 20.37 ms | **-6%** |
| wide (20k objects) | model as 'std' | 16.66 ms | 18.00 ms | **+8%** |
| wide (20k objects) | model as 'dt-model' | 52.66 ms | 5.15 ms | **-90%** |
| deep (2k levels) | init | 5.04 ms | 4.17 ms | **-17%** |
| deep (2k levels) | flat | 4.47 ms | 3.68 ms | **-18%** |
| deep (2k levels) | load | 1.94 ms | 0.41 ms | **-79%** |
| deep (2k levels) | dt.copy() | 0.50 ms | 0.71 ms | **+41%** |
| deep (2k levels) | model as 'std' | 4.46 ms | 0.56 ms | **-88%** |
| deep (2k levels) | model as 'dt-model' | 1.64 ms | 0.12 ms | **-93%** |
| mixed (3k records) | init | 22.01 ms | 12.31 ms | **-44%** |
| mixed (3k records) | flat | 18.16 ms | 10.06 ms | **-45%** |
| mixed (3k records) | load | 19.65 ms | 3.29 ms | **-83%** |
| mixed (3k records) | dt.copy() | 4.69 ms | 4.61 ms | **-2%** |
| mixed (3k records) | model as 'std' | 4.06 ms | 4.25 ms | **+5%** |
| mixed (3k records) | model as 'dt-model' | 18.95 ms | 1.16 ms | **-94%** |



## Memory

Two different questions: how much memory a dt-object keeps while it exists, and how much memory each call allocates while it runs (temporary objects plus the result). Temporary memory is collected later, but it costs garbage-collection time.

### Retained by one dt-object

Heap kept by one dt-object after garbage collection. Lower is better.

| Data | Created with | 7.5.1 (walk 6.1.0) | 8.0.0 (walk 7.0.1) | Change |
|---|---|---:|---:|---:|
| wide (20k objects) | init | 19.5 MiB | 14.2 MiB | **-27%** |
| wide (20k objects) | load | 18.1 MiB | 9.3 MiB | **-49%** |
| deep (2k levels) | init | 0.9 MiB | 0.8 MiB | **-13%** |
| deep (2k levels) | load | 1.3 MiB | 0.5 MiB | **-63%** |
| mixed (3k records) | init | 7.1 MiB | 5.5 MiB | **-22%** |
| mixed (3k records) | load | 7.0 MiB | 3.5 MiB | **-49%** |

### Allocated per call

Everything one call allocates: temporary objects plus the result. Lower is better.

| Data | Operation | 7.5.1 (walk 6.1.0) | 8.0.0 (walk 7.0.1) | Change |
|---|---|---:|---:|---:|
| wide (20k objects) | init | 109.3 MiB | 67.1 MiB | **-39%** |
| wide (20k objects) | flat | 95.6 MiB | 60.6 MiB | **-37%** |
| wide (20k objects) | load | 128.1 MiB | 25.7 MiB | **-80%** |
| wide (20k objects) | dt.copy() | 39.4 MiB | 45.3 MiB | **+15%** |
| wide (20k objects) | model as 'std' | 43.3 MiB | 40.5 MiB | **-6%** |
| wide (20k objects) | model as 'dt-model' | 128.6 MiB | 21.7 MiB | **-83%** |
| deep (2k levels) | init | 27.5 MiB | 26.6 MiB | **-3%** |
| deep (2k levels) | flat | 26.9 MiB | 26.1 MiB | **-3%** |
| deep (2k levels) | load | 6.5 MiB | 1.6 MiB | **-75%** |
| deep (2k levels) | dt.copy() | 1.6 MiB | 2.5 MiB | **+56%** |
| deep (2k levels) | model as 'std' | 13.7 MiB | 2.1 MiB | **-85%** |
| deep (2k levels) | model as 'dt-model' | 6.3 MiB | 1.6 MiB | **-74%** |
| mixed (3k records) | init | 37.5 MiB | 25.1 MiB | **-33%** |
| mixed (3k records) | flat | 32.6 MiB | 22.9 MiB | **-30%** |
| mixed (3k records) | load | 48.2 MiB | 11.5 MiB | **-76%** |
| mixed (3k records) | dt.copy() | 13.6 MiB | 16.4 MiB | **+21%** |
| mixed (3k records) | model as 'std' | 15.8 MiB | 16.3 MiB | **+3%** |
| mixed (3k records) | model as 'dt-model' | 47.1 MiB | 10.3 MiB | **-78%** |

`init` and `flat` on the 2,000-level chain allocate about 27 MiB in both versions. Every dt-line stores its full path (breadcrumbs), and on a deep chain the paths get long: their total length grows with the square of the depth. That's a property of the DT-model format, not of the walk version.



## Where the gains come from

- **Walk 7 settings.** The data-to-DT-model conversion only needs walk's callbacks, so it runs with `copy:false` (no result is built), `parentPath:false` (unused callback argument) and `detectCycles:false`. Circular references are checked once by dt-toolbox before conversion, so walk doesn't need to track them.
- **No second copy of the data.** A dt-object used to keep a full copy of the original data next to its dt-lines, only for `dt.copy()`. `dt.copy()` now rebuilds the data from the dt-lines.
- **Shape-aware DT-model copy.** A DT-model is a flat list of `[ name, flatData, breadcrumbs, edges ]` lines. Copying it with a function that knows this shape (`src/copyDtModel.js`) is much faster than a general deep copy, and it creates arrays of the exact size. This is why `load` and `model as 'dt-model'` gained the most.
- **No RegExp per value.** The parent of each value was found with a RegExp built from its key. A string `slice` does the same work, and it's also correct for keys with special characters.
- **No needless string building.** Long breadcrumbs (deep data) are no longer rebuilt when nothing changes in them.

What got slower or uses more memory:

- `dt.copy()` allocates 15-56% more temporary memory and is slower on very deep data (+0.2 ms on 2,000 levels). It rebuilds the data from the dt-lines instead of copying a stored copy. In exchange, every dt-object keeps 13-27% less memory for its whole life, and `init` is much faster.
- `model as 'std'` is within ±8% of 7.5.1 on wide and mixed data, close to run-to-run variation.



## Data sets

Defined in [datasets.mjs](datasets.mjs):

| Name | Shape |
|---|---|
| wide (20k objects) | 20,000 small objects, each with an array: many dt-lines, shallow |
| deep (2k levels) | an object chain 2,000 levels deep: long breadcrumbs |
| mixed (3k records) | 3,000 records with nested objects and arrays: typical application data |



## Run it yourself

```bash
node benchmarks/compare.mjs
```

The script installs the published baseline version into a temporary folder (with its own walk version), runs both versions in separate processes and prints the tables above (speed, retained memory, allocated memory) as markdown. A full run takes a few minutes. Options:

| Option | Meaning |
|---|---|
| `--baseline-version 7.4.9` | compare with another published version (default `7.5.1`) |
| `--baseline path/to/dtbox.esm.mjs` | compare with a local build |
| `--runs 7` | processes per version (default 5) |
| `--label '8.0.0'` | column title for the current source |

To measure only the current source:

```bash
node benchmarks/run.mjs src/main.js speed
node --expose-gc benchmarks/run.mjs src/main.js memory
node --expose-gc --max-semi-space-size=256 benchmarks/run.mjs src/main.js allocation
```
