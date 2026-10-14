---
name: dt-toolbox
description: Writes correct code with the dt-toolbox npm package (`import dtbox from 'dt-toolbox'`). Covers converting deeply nested JS data between data-models (std, breadcrumbs, tuples, files, midFlat, DT-model), creating dt-objects with `dtbox.init`/`dtbox.load`, scanning and reshaping them with `dt.query`/`dt.model` and the store API (`from`, `use`, `get`, `find`, `like`, `look`, `set`, `save`, `push`, `connect`), filters, data segments, `index` and `extractList`. Use this skill whenever code imports or requires 'dt-toolbox', mentions `dtbox`, dt-object or DT-model, or when the user wants to flatten a nested object into path keys like 'a/b/c', rebuild nested objects from breadcrumbs, tuples or file-path lists, or query/restructure deeply nested data with dt-toolbox — even if no specific method is named. Also use it to debug unexpected dt-toolbox output.
---

# dt-toolbox

dt-toolbox turns deeply nested data into a flat, indexed representation (the **DT-model**), lets you scan and reshape it without touching the source, and converts it to other data shapes.

```js
import dtbox from 'dt-toolbox'          // ESM
const dtbox = require ( 'dt-toolbox' )  // CommonJS
```

TypeScript declarations ship with the package. Model names (`model`, `as`) autocomplete in editors.

## Mental model

A **DT-model** is an array of **dt-lines**. Each dt-line describes one object or array in the source:

```
[ name, flatData, breadcrumbs, edges ]
  name        - key of this object in its parent ('root' for the top level)
  flatData    - the object's primitive values only ({...} or [...])
  breadcrumbs - path from the top, '/'-separated: 'root/personal/hobbies'
  edges       - breadcrumbs of child objects/arrays
```

Nested objects never appear inside `flatData`. They become their own dt-lines, linked through `edges`. Most dt-toolbox code is about finding the right dt-lines (scanning) and building new ones (drafting).

A **dt-object** wraps a DT-model and exposes the API (`query`, `model`, `export`, …). It is effectively immutable: `query` and `model` build *new* results and never change the dt-object or the original data.

## Choose the entry point

| You have / want | Use |
|---|---|
| Nested data → scan, reshape, or convert it | `dtbox.init ( data, { model } )` → dt-object |
| A DT-model array (e.g. from `dt.export()`) → dt-object | `dtbox.load ( dtModel )` |
| One-off shape conversion, no querying | `dtbox.convert ( data, { model, as } )` |
| Only the DT-model array | `dtbox.flat ( data, { model } )` |

`model` is the shape of the *input*, and `as` is the shape of the *output*. Both default to `'std'` (a regular JS object or array), so plain nested objects need no options.

`dtbox.getWalk ()` returns the bundled `@peter.naydenov/walk` v.7 deep-copy function. In its callbacks, call `IGNORE ()` instead of returning `IGNORE`.

Data-models: `'std'`, `'breadcrumbs'`, `'tuples'`, `'files'`, `'midFlat'`, `'flat'`/`'dt-model'`. Singular aliases (`'tuple'`, `'file'`, `'breadcrumb'`, `'standard'`, `'midflat'`) also work. See [references/data-models.md](references/data-models.md) for each shape with examples.

```js
dtbox.convert ( { a: 1, b: { c: 2 } }, { as: 'breadcrumbs' } )
// → { a: 1, 'b/c': 2 }
dtbox.convert ( { a: 1, 'b/c': 2 }, { model: 'breadcrumbs', as: 'std' } )
// → { a: 1, b: { c: 2 } }
```

## Query and model: the core workflow

Both take a function that receives the **store** (scan + draft API) first, then any extra arguments you pass:

```js
dt.query ( ( store, ...args ) => { /* scan and draft */ }, ...args )   // → dt-object
dt.model ( ( store, ...args ) => { /* scan and draft */ return { as: 'std' } }, ...args )   // → data in the 'as' shape
```

- **`dt.query(fn)`** returns a new dt-object built from what you drafted. If you drafted nothing, it returns the same dt-object. Use it to chain further work.
- **`dt.model(fn)`** produces the final output. The function's return value `{ as }` picks the shape: any data-model name, or `'dt-object'`. If `as` is missing, the result is a dt-object. If you drafted nothing, the whole current data is converted. So `dt.model ( () => ({ as: 'std' }) )` gives the full data back as a plain object.

### Store API

Scan methods narrow the **scan-list** (the dt-lines that `look` will visit) and are chainable:

| Method | Scan-list becomes |
|---|---|
| `from ( breadcrumbs )` | that dt-line and all its descendants |
| `get ( breadcrumbs )` | only that dt-line |
| `find ( name )` | dt-lines whose name equals `name` |
| `like ( text \| [texts] )` | dt-lines whose name contains the text |
| `use ( filterName )` | dt-lines selected by a filter (see `dt.setupFilter`) |
| `look ( fn )` | — visits each property of each dt-line in the scan-list |

`look` calls `fn` once per property, with `{ value, key, name, flatData, breadcrumbs, links, empty, next, finish }`. Return `next()` to skip the remaining properties of the current dt-line. That's the usual way to run once per dt-line. Return `finish()` to stop the whole `look`. Empty objects/arrays are visited once with `empty: true` and `key: null`. After `look` runs, the scan-list resets to all dt-lines, so start each scan with fresh scan methods.

Draft methods build the result:

| Method | Effect |
|---|---|
| `set ( name, data )` | create a dt-line (`data` is an object or array of primitives) |
| `save ( name, key, value )` | set a property on a drafted object (does not overwrite existing keys) |
| `push ( name, value )` | append a primitive to a drafted array |
| `connect ( [ 'parent/child', … ] )` | nest drafted dt-line `child` under `parent` |

Name the top-level drafted line `'root'`. In `std` output, drafted lines that were never connected are added to the top level under their own name. Use `connect` to nest them deeper.

Full signatures, return values and errors: [references/api.md](references/api.md).

## Example: select and reshape

```js
const people = {
      alice : { age: 34, city: 'Varna' }
    , bob   : { age: 51, city: 'Sofia' }
    , carol : { age: 28, city: 'Varna' }
  }
const dt = dtbox.init ( people )

const under40 = dt.model ( ( store, maxAge ) => {
        store.set ( 'root', [] )
        store.look ( ({ key, value, name }) => {   // no scan methods → visits every dt-line
                if ( key === 'age' && value < maxAge )   store.push ( 'root', name )
            })
        return { as: 'std' }
    }, 40 )
// under40 → [ 'alice', 'carol' ]
```

More worked patterns (grouping, building nested results with `connect`, filters, segments, `extractList`): [references/recipes.md](references/recipes.md).

## Other dt-object methods

- `dt.export ( name? )` returns a DT-model copy: everything, or one segment re-rooted as `'root'`. Feed it to `dtbox.load` later.
- `dt.copy ( name? )` returns a deep copy of a segment's data (default `'root'`) as a plain object, or `null` if the segment is missing. Keys come in `std` output order: primitives first, then nested objects.
- `dt.index ( breadcrumbs )` returns one dt-line, e.g. `dt.index ( 'root/friends' )`. A scalar property also works: `dt.index ( 'root/name' )` → `[ 'name', 'Peter', 'root/name', [] ]`. Missing → `null`.
- `dt.setupFilter ( name, fn )` precomputes a named scan-list once. `fn ({ name, flatData, breadcrumbs, edges })` returns `true` to include the dt-line. Use it with `store.use ( name )`. Built-in filters: `'root'`, `'object'`, `'list'` (arrays), `'listObject'` (objects inside arrays).
- `dt.insertSegment ( name, data )` adds an independent data block. `data` can be a dt-object (preferred), a DT-model, or a plain object (works, but logs a warning). Its breadcrumbs start with `name/` instead of `root/`.
- `dt.listSegments ()` → `[ 'root', ...segmentNames ]`.
- `dt.extractList ( [ names ], { as }? )` fetches several segments or properties at once. Segments come back in the `as` shape (dt-objects without options). Properties come back as values, paths like `'c/d'` work, and missing items are `null`.

## Gotchas (and why they matter)

- **`init` vs `load`.** `load` expects an existing DT-model and does no conversion. Passing ordinary data to `load`, or a DT-model to `init` without `{ model: 'dt-model' }`, produces garbage rather than an error.
- **Return `{ as }` from the model function.** It is not a second argument: `dt.model ( fn, { as: 'std' } )` passes `{ as: 'std' }` to `fn` as an extra argument and returns a dt-object.
- **Unknown filter names scan everything.** `store.use ( 'typo' )` leaves the scan-list unchanged, so a misspelled filter silently returns all dt-lines.
- **Segments in `std` output.** `dt.model ( () => ({ as: 'std' }) )` returns root data with each segment as a top-level key. A segment with the same name as a root object property is merged into it. To read one segment alone, use `dt.copy ( 'segment' )`.
- **`'files'` is a string format.** Values round-trip as strings (`1` → `'1'`), so use it for display and paths, not for numeric data.
- **Unsupported model names throw** in `init`, `flat`, `convert` and `model`. The error message lists the supported names. Omitting `model`/`as` (or passing `undefined`) uses `'std'`.
- **Circular references throw** in `init`, `flat`, `convert` and `insertSegment` with a clear message. Shared references (the same object in two places) are fine.
- **Primitive input** to `init` is wrapped: `dtbox.init ( 42 )` holds `{ value: 42 }`.
- **Date and RegExp** values are kept as leaf values in every data-model.

## Answering style

Give a focused, runnable snippet with the import line and the expected output as a `// →` comment. Mention a gotcha only when it applies to the user's case. If dt-toolbox is a poor fit (tiny flat objects, reactive state, events), say so and suggest plain JS instead of forcing the library.
