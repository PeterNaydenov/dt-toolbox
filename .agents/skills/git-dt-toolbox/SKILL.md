---
name: git-dt-toolbox
description: |
  Help developers use `dt-toolbox` (v7.4.9): create a `dt-object` with
  `dtbox.init(data, { model })` or `dtbox.load(dtModel)`, query it with
  `dt.query(queryFn)`, reshape it with `dt.model(modelFn)`, register
  precomputed filters with `dt.setupFilter(name, fn)`, add new data
  segments with `dt.insertSegment(name, otherDt)`, and extract results
  with `dt.export()`, `dt.copy(name)`, `dt.index(breadcrumbs)`, or
  `dt.extractList([requests], { as })`. Use when a developer asks for an
  immutable, deep-nested object store with fast filterable queries, a
  tree-shaped data model with breadcrumbs, a way to convert among
  standard / tuple / midFlat / file / flat / breadcrumbs representations,
  or "I want a dt-object that I can scan, filter, and reshape without
  mutating the source." Do NOT use for: small flat objects (use plain JS
  or `@peter.naydenov/walk`), reactive state (use `@peter.naydenov/signals`),
  pub/sub events (use `@peter.naydenov/notice`), or fixing bugs in the
  library itself.
---

# git-dt-toolbox helper

A tool for working with deep-nested JS objects. You give it data; it
returns a `dt-object` — an immutable wrapper around an internal
`DT-model` (a flat array of 4-tuples `[name, flatData, breadcrumbs, edges]`).
The dt-object never mutates its source; queries and models produce new
dt-objects.

Source of truth:
- `src/main.js` — the `dtbox` API: `init`, `load`, `flat`, `convert`, `getWalk`
- `src/mainLib.js` — `init`/`load`/`flating`/`converting`/`getWalk` impls;
  the `INIT_DATA_TYPES` list; the `hasCircularRef` guard
- `src/flatObject/index.js` — `dt-object` API: `insertSegment`, `export`,
  `copy`, `query`, `model`, `setupFilter`, `index`, `listSegments`, `extractList`
- `src/flatData/index.js` — the `dt-storage` API exposed to query/model
  callbacks: `from`, `use`, `get`, `find`, `like`, `look`, `set`, `connect`,
  `save`, `push`
- `src/convertors/index.js` — model conversion (std / tuple / breadcrumbs /
  file / midFlat / flat / dt-model)
- `test/` — executable examples for every pattern below
- `README.md` — narrative docs, the DT-model anatomy block, all API tables,
  the "How it works" section

## Procedure

1. **Map the developer's intent to the right shape of `dtbox` call**:
   - "I have a nested object — make it queryable without mutating it" → `const dt = dtbox.init(data)` (default `model: 'std'`)
   - "I have a flat list of `breadcrumb/value` pairs" → `dtbox.init(data, { model: 'breadcrumbs' })` or `dtbox.init(data, { model: 'file' })` for `key/key2/.../value` strings
   - "I have a dt-model array already" → `dtbox.load(dtModel)` — `dt-model` is the canonical flat shape: `[[name, flatData, breadcrumbs, edges], ...]`
   - "I just want a dt-model array, not a dt-object" → `dtbox.flat(data, { model })` or `dtbox.convert(data, { model: 'src', as: 'dst' })`
   - "Query the dt-object" → `dt.query((store, ...args) => { ... })`. The store is the `dt-storage` API; use it to scan and build results
   - "Reshape to a specific model" → `dt.model((store, ...args) => { ... return { as: 'std' } })` (or `'tuples'`, `'breadcrumbs'`, `'midFlat'`, `'flat'`, `'file'`, `'dt-model'`)
   - "Pre-index data for fast scanning" → `dt.setupFilter(name, fn)`. The filter returns `true` for dt-lines that should be in the scan-list. Use `store.use(name)` in a query
   - "Add a separate, unrelated data block to the same dt-object" → `dt.insertSegment('extra', otherDt)` (otherDt must be a dt-object)
   - "Get a single dt-line by its path" → `dt.index('root/familyMembers')` returns `[name, flatData, breadcrumbs, edges]`
   - "Extract a list of segments or properties" → `dt.extractList(['root', 'extra/foo'], { as: 'std' })` — the second arg is the output model
   - "Deep-copy the original source object back" → `dt.copy('root')` (default `'root'` when no arg). Note: `copy` returns the SOURCE shape, not a dt-model
   - "Use the same `walk` version that dt-toolbox uses" → `dtbox.getWalk()`

2. **Generate code that follows the real API contract**:
   - ESM import: `import dtbox from 'dt-toolbox'` (CJS: `require('dt-toolbox')` since 7.4.2)
   - The default export is a flat object with five functions: `init`, `load`, `flat`, `convert`, `getWalk`. There is no factory call.
   - **`init(data, options?)`** — `data` is a plain JS value; `options.model` picks the source model. Default `'std'`. Supported: `'std'`, `'standard'`, `'tuple'`, `'tuples'`, `'breadcrumb'`, `'breadcrumbs'`, `'file'`, `'files'`, `'midFlat'`, `'midflat'`, `'flat'`, `'dt-model'`. An unknown model logs an error and returns `null`.
   - **`load(dtModel)`** — `dtModel` is an array of 4-tuples. Returns a dt-object.
   - **`flat(data, options?)`** — like `init` but returns the dt-model array, not a dt-object. Throws on bad model or non-object input.
   - **`convert(data, { model, as })`** — convert from one model to another. Throws if either model name is unknown.
   - **`dtbox.getWalk()`** — returns the same `@peter.naydenov/walk` version this version of dt-toolbox ships with. Useful for "use the same deep-copy semantics."
   - `dt.query(fn, ...args)` and `dt.model(fn, ...args)` pass extra args to the callback after the `store` argument. Use them for context the callback needs.
   - `dt.setupFilter(name, fn)` — `fn({ name, flatData, breadcrumbs, edges })` returns `true`/`false`. Only `true` lines end up in the filter's scan-list.
   - `dt.insertSegment(name, otherDt)` — `otherDt` MUST be a dt-object. The new segment becomes a separate "root" in the storage; its internal `breadcrumbs` start with `name/` not `root/`.
   - `dt.export(segmentName?)` — returns the dt-model array for that segment (default `'root'`). Segment names are returned as `root` in the export, regardless of what they were registered as.
   - `dt.copy(segmentName?)` — returns a deep copy of the SOURCE data (not the dt-model) for that segment. Default `'root'`.
   - `dt.index(breadcrumbs)` — returns a single dt-line `[name, flatData, breadcrumbs, edges]`.
   - `dt.listSegments()` — returns `['root', ...otherSegmentNames]`.
   - `dt.extractList([requests], { as? })` — `requests` is an array of `segmentName` or `segmentName/propertyName`. `as` is the output model; default `'dt-model'`.

3. **Apply the `dt-storage` (store) API contract — used inside query/model**:
   - **`from(breadcrumbs)`** — start scanning from a sub-tree.
   - **`use(filterName)`** — restrict the scan to a precomputed filter's list.
   - **`get(breadcrumbs)`** — fetch a single dt-line by path.
   - **`find(name)`** — exact-name match across the current scan-list.
   - **`like(name)`** — substring match against dt-line `name`.
   - **`look(callback)`** — iterate over the current scan-list, calling `callback(dtLine)` for each.
   - **`set(name, data, edges?)`** — define a new dt-line in the result.
   - **`connect(fromBreadcrumbs, toBreadcrumbs)`** — add a parent/child edge between two existing result dt-lines.
   - **`save(breadcrumbs, key, value)`** — write a property into a result dt-line's `flatData` object.
   - **`push(breadcrumbs, value)`** — push a value into a result dt-line's `flatData` array.
   - The store's mutations only affect the NEW dt-object being built. The host dt-object is never touched.

4. **Apply the order-of-execution rules**:
   - `init` → source data → `convert.from(model).toFlat(...)` → dt-model → `flatObject(...)` → dt-object. The dt-object holds a deep copy of the source.
   - `init` rejects circular references with `Error('Circular reference detected...')`. Catch this up-front if the source might be cyclic; the internal `walk` recurses without tracking, so cycles would otherwise OOM-crash.
   - `init` wraps non-object inputs (`null`, `undefined`, primitives) as `{ value: <primitive> }` so the data is preserved. Before the fix, primitives silently produced empty dt-objects.
   - `query` returns the SAME dt-object if nothing new was added; otherwise a new dt-object with the new data.
   - `model` ALWAYS returns a plain value (object/array/string) — the shape depends on the `as` you return from the callback. Without `as`, it returns a dt-model array.
   - `insertSegment` accepts a dt-object only. Pass a plain object through `dtbox.init` first.
   - Address-list order matters: `setAddresses`-like behavior in `init` walks the source recursively; the dt-model preserves the order of `Object.keys` / array indices.

5. **Surface only the relevant gotcha proactively** — pick at most one from the list below that applies to the current example, and only if the user is unlikely to know it:
   - **`init` is a deep copy.** The returned dt-object holds its own copy of the source. Mutating the source after `init` does NOT affect the dt-object. (And vice versa.)
   - **The 4-tuple shape is `[name, flatData, breadcrumbs, edges]`.** Order matters: it's positional, not an object. Breadcrumbs use `/` as the separator, starting with `root/`.
   - **`copy` returns the SOURCE shape, not the dt-model.** `dt.copy('extra')` returns the original `{ vitamins: [...] }` object, not a dt-model array. Use `export` if you need the dt-model.
   - **`init` is for non-dt-model data; `load` is for dt-model data.** Mixing them up is the most common bug. `load` does NOT call any convertor — it assumes the input is already `[name, flatData, breadcrumbs, edges]` tuples.
   - **`model` callback must return either a `set`/`connect`/`save`/`push`-driven result, or `{ as: 'std' }` for a final conversion.** Without `as`, the return is a dt-model array (the raw internal shape).
   - **`insertSegment` requires a dt-object as the second arg.** Wrapping a plain object with `dtbox.init(...)` first is the typical pattern.
   - **Filters are precomputed once and cached.** A filter is run when `setupFilter` is called; later `store.use(name)` just consults the cached list. The filter is the place to put expensive predicates.
   - **Circular references throw.** `init({ a: {} })` then `data.a.self = data` throws `Error('Circular reference detected in data. dt-toolbox cannot initialise a self-referencing object.')`. Catch this up-front.

6. **If the request is for a small flat object**, the dt-toolbox overhead is unjustified. Use plain JS or `@peter.naydenov/walk` for the deep copy.

7. **If the request is for reactive state** (auto-update views when state changes), `dt-toolbox` is non-reactive. Use `@peter.naydenov/signals` for that.

8. **If the request is for a pub/sub event bus**, use `@peter.naydenov/notice`. `dt-toolbox` doesn't emit events.

## Output contract

- One focused code snippet, ESM by default (CJS if asked)
- One line of context explaining which API (init/load/query/model) is used and why
- A pointer to the relevant source/test section if the developer wants to dig deeper
- Surface at most one relevant gotcha proactively, only if it applies to the example
- Never include `init(dtModelArray)` — that's `load`, not `init`
- Never include `load({ key: 'value' })` — that's `init`, not `load`
- Never include a model name not in `INIT_DATA_TYPES` — it logs an error and returns `null`

## Failure handling

- The developer's use case is genuinely ambiguous (e.g., "I need a data structure") → start with `dtbox.init(data)` and a single `dt.query(...)`; mention `model` for the source shape, `setupFilter` for performance
- Developer reports a bug or unexpected behavior in `dt-toolbox` itself → do NOT try to fix from this skill; route to the project source or maintainer
- Developer wants a feature `dt-toolbox` doesn't have (mutation, event emission, async queries) → say so plainly, don't invent an API
- Wrong model name → `init` returns `null` and logs; `flat`/`convert` throw with a clear "Supported: …" message. Tell the user which one they hit.

## Examples

**"Make a nested object queryable"**

```js
import dtbox from 'dt-toolbox'

const data = {
  name: 'Peter',
  familyMembers: ['Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya'],
  shoes: { winter: ['Keen', 'Head'], summer: ['Lotto', 'Asics'] },
}

const dt = dtbox.init(data)   // model: 'std' is the default

// dt.query() and dt.model() return new dt-objects; the original is never mutated.
const justNames = dt.model((store) => {
  store.set('names', [])
  store.look(({ flatData, breadcrumbs }) => {
    if (breadcrumbs === 'root/familyMembers') {
      flatData.forEach((n) => store.push('names', n))
    }
  })
  return { as: 'std' }   // return a plain object instead of a dt-model
})
// justNames -> { names: ['Veselina', 'Iskra', 'Maria', 'Vasil', 'Vladimir', 'Petya'] }
```

`dtbox.init(data)` walks the source, builds the internal dt-model, and returns a dt-object. The dt-object holds a deep copy. Query/model callbacks receive a `store` (the dt-storage API) and can use `set`/`push`/`look` to build a new result. Return `{ as: 'std' }` from a model callback to convert the raw dt-model to a plain object. See `src/mainLib.js` `init` and `src/flatData/index.js`.

**"Convert a flat list of `key/subkey/value` strings into a nested object"**

```js
import dtbox from 'dt-toolbox'

const flat = [
  'name/Peter',
  'shoes/winter/Keen',
  'shoes/winter/Head',
  'shoes/summer/Lotto',
  'shoes/summer/Asics',
]

const dt = dtbox.init(flat, { model: 'file' })
const nested = dt.model(() => {}, { as: 'std' })
// nested -> {
//   name: 'Peter',
//   shoes: { winter: ['Keen', 'Head'], summer: ['Lotto', 'Asics'] }
// }
```

`model: 'file'` parses a list of `'a/b/c'` strings into a tree. The final `as: 'std'` (inside the second arg of `dt.model`, not the callback) is the output model. The empty callback `() => {}` means "use the dt-object as-is, just convert the shape on the way out." See `src/convertors/index.js` and the "Init/Export Data-Models" section in the README.

**"Precompute a filter for fast scanning"**

```js
import dtbox from 'dt-toolbox'

const dt = dtbox.init(people)   // people: { alice: { eyes: 'blue' }, bob: { eyes: 'green' }, ... }

dt.setupFilter('blueEyes', ({ flatData }) => flatData.eyes === 'blue')

const result = dt.query((store) => {
  store.use('blueEyes').look(({ flatData, name }) => {
    console.log(name, 'has blue eyes:', flatData)
  })
})
```

`setupFilter(name, fn)` runs `fn` against every dt-line ONCE and caches the matching list. `store.use(name)` consults that cache instead of re-evaluating. Useful when the same predicate is needed many times across queries. See `src/flatObject/setupFilter.js` and the "Filters" section in the README.
