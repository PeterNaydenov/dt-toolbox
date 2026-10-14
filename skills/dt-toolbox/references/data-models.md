# Data-models

Every data-model below can be an input (`init`/`flat`/`convert` option `model`) and an output (`convert` option `as`, or `{ as }` returned from a `dt.model` function). Default for both: `'std'`.

All examples use the same source:

```js
const x = { a: 1, b: { c: 2 }, l: [ 'p', 'q' ] }
```

## Contents
- [std](#std)
- [breadcrumbs](#breadcrumbs)
- [tuples](#tuples)
- [files](#files)
- [midFlat](#midflat)
- [flat / dt-model](#flat--dt-model)
- [Choosing a model](#choosing-a-model)

## std

Aliases: `'std'`, `'standard'`. A regular JS object or array of any depth.

```js
dtbox.convert ( x, { as: 'std' } )
// → { a: 1, b: { c: 2 }, l: [ 'p', 'q' ] }
```

## breadcrumbs

Aliases: `'breadcrumbs'`, `'breadcrumb'`. A single flat object. Keys are paths without the `root/` prefix, and array items use their index.

```js
dtbox.convert ( x, { as: 'breadcrumbs' } )
// → { a: 1, 'b/c': 2, 'l/0': 'p', 'l/1': 'q' }

dtbox.convert ( { a: 1, 'b/c': 2 }, { model: 'breadcrumbs', as: 'std' } )
// → { a: 1, b: { c: 2 } }

dtbox.convert ( { k: [ 'only' ] }, { as: 'breadcrumbs' } )
// → { 'k/0': 'only' }
```

Every array item gets its index, so arrays round-trip, including one-item arrays.

Good for form fields, key-value stores, diffs, and env-style config.

## tuples

Aliases: `'tuples'`, `'tuple'`. A list of `[ path, value ]` pairs. Array items share their array's path, and order gives the index.

```js
dtbox.convert ( x, { as: 'tuples' } )
// → [ [ 'a', 1 ], [ 'b/c', 2 ], [ 'l', 'p' ], [ 'l', 'q' ] ]
```

Good for streaming, sorting, and building data from rows. A one-item array can't be told apart from a single value in this format, so it comes back as a plain value.

## files

Aliases: `'files'`, `'file'`. A list of strings: the path followed by the value as the last segment.

```js
dtbox.convert ( x, { as: 'files' } )
// → [ 'a/1', 'b/c/2', 'l/p', 'l/q' ]

dtbox.convert ( [ 'a/1', 'b/c/2' ], { model: 'files', as: 'std' } )
// → { a: '1', b: { c: '2' } }
```

Everything is a string, so numbers and booleans come back as strings. Functions are written as `path/function:name` and DOM elements as `path/HtmlElement:tag`. Use it for display, logs, and path lists, not for typed data.

## midFlat

Aliases: `'midFlat'`, `'midflat'`. An object with one flat entry per nested object. Keys are paths, and the top level is under `root`.

```js
dtbox.convert ( x, { as: 'midFlat' } )
// → { root: { a: 1 }, b: { c: 2 }, l: [ 'p', 'q' ] }
```

A middle ground between `std` and DT-model that is easy to read and still flat per object.

## flat / dt-model

Aliases: `'flat'`, `'dt-model'`. The internal DT-model: an array of dt-lines `[ name, flatData, breadcrumbs, edges ]`.

```js
dtbox.flat ( x )
// → [
//     [ 'root', { a: 1 }, 'root', [ 'root/b', 'root/l' ] ],
//     [ 'b', { c: 2 }, 'root/b', [] ],
//     [ 'l', [ 'p', 'q' ], 'root/l', [] ]
//   ]
```

To turn a DT-model back into a dt-object, use `dtbox.load ( dtModel )`. `dtbox.init ( dtModel, { model: 'dt-model' } )` also works. An array of objects becomes a `root` array with numbered children:

```js
dtbox.flat ( [ { a: 1 }, { a: 2 } ] )
// → [
//     [ 'root', [], 'root', [ 'root/0', 'root/1' ] ],
//     [ '0', { a: 1 }, 'root/0', [] ],
//     [ '1', { a: 2 }, 'root/1', [] ]
//   ]
```

## Choosing a model

| Need | Model |
|---|---|
| Work with data normally | `std` |
| One flat key-value object | `breadcrumbs` |
| Ordered list of path/value rows | `tuples` |
| Human-readable path strings | `files` |
| One flat object per nested object | `midFlat` |
| Store/transfer a dt-object and reload it later | `flat` / `dt-model` (`dt.export()` → `dtbox.load()`) |

Round-trips through `std`, `breadcrumbs` and `midFlat` keep values and types. Key order may change. `tuples` and `files` have no array indexes, so a one-item array comes back as a plain value (`{ k: [ 'only' ] }` → `{ k: 'only' }`), and `files` also turns values into strings. Use `breadcrumbs` or `midFlat` when arrays must round-trip.
