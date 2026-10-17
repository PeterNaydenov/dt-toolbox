# API reference

## Contents
- [dtbox (library)](#dtbox-library)
- [dt-object](#dt-object)
- [Store: scan methods](#store-scan-methods)
- [Store: draft methods](#store-draft-methods)
- [Filters](#filters)
- [Errors](#errors)

Model names used below: `'std' | 'standard' | 'breadcrumbs' | 'breadcrumb' | 'tuples' | 'tuple' | 'files' | 'file' | 'midFlat' | 'midflat' | 'flat' | 'dt-model'`. Shapes are described in [data-models.md](data-models.md).

## dtbox (library)

### `dtbox.init ( data, { model = 'std' }? )` → dt-object
Creates a dt-object from data in any model. `data` is copied, so later changes to `data` don't affect the dt-object. Primitives are wrapped: `init ( 42 )` holds `{ value: 42 }`. Shared references (the same object in two places) are fine. Circular references and an unsupported `model` throw. A dt-object as `data` gives a new, independent dt-object with a copy of its data (all segments).

```js
const original = dtbox.init ({ name: 'Peter' })
const copy = dtbox.init ( original )
copy.model ( () => ({ as: 'std' }) )
// → { name: 'Peter' }
copy === original
// → false
```

### `dtbox.load ( dtModel )` → dt-object
Creates a dt-object from a DT-model, e.g. the output of `dt.export()` or `dtbox.flat()`. No conversion is done. The DT-model is copied, so later changes to it don't affect the dt-object.

### `dtbox.flat ( data, { model = 'std' }? )` → DT-model
Converts data to a DT-model without creating a dt-object. Throws on non-object or circular `data`, or an unsupported `model`.

### `dtbox.convert ( data, { model = 'std', as = 'std' }? )` → data in the `as` model
Converts data between models in one step. Throws on non-object or circular `data`, or unsupported names.

### `dtbox.getWalk ()` → walk function
Returns the `@peter.naydenov/walk` v.7 function bundled with dt-toolbox: a deep copy with callbacks, `walk ({ data, keyCallback?, objectCallback?, settings? })`. In callbacks, `IGNORE`, `PASS` and `FINISH` are functions and must be called: `return IGNORE ()`.

```js
const walk = dtbox.getWalk ()
const safe = walk ({
          data : { user: 'peter', password: 'secret', meta: { token: 'x' } }
        , keyCallback : ({ key, value, IGNORE }) => [ 'password', 'token' ].includes ( key ) ? IGNORE () : value
    })
// safe → { user: 'peter', meta: {} }
```

## dt-object

### `dt.query ( fn, ...args )` → dt-object
Calls `fn ( store, ...args )`. If `fn` drafted dt-lines (`set`, …), it returns a new dt-object made of them. Otherwise it returns `dt` itself. The return value of `fn` is ignored.

### `dt.model ( fn, ...args )` → depends on `as`
Calls `fn ( store, ...args )`, then reads `{ as }` from its return value:

| `fn` returns | Result |
|---|---|
| nothing, or `{}` | a dt-object |
| `{ as: 'dt-object' }` | a dt-object |
| `{ as: <model name> }` | data in that model |

The source is the drafted dt-lines, or all current data if nothing was drafted. An unsupported or non-string `as` throws.

### `dt.export ( name? )` → DT-model
With no argument, returns a copy of the whole DT-model, including inserted segments. With a segment name, returns that segment re-rooted: its first line is renamed `'root'` and its breadcrumbs start with `root/`. An unknown name returns `[]`, and a non-string name throws.

### `dt.copy ( name = 'root' )` → data | null
Returns a deep copy of a segment's data in `std` shape, rebuilt from its dt-lines. Object keys come in the same order as `std` output: primitive values first, then nested objects. A missing segment returns `null`, and a non-string name throws.

### `dt.index ( breadcrumbs )` → dt-line | null
Returns a copy of one dt-line, e.g. `dt.index ( 'root/personal' )`. For a scalar property it returns a synthetic line `[ key, value, breadcrumbs, [] ]`, e.g. `dt.index ( 'root/name' )` → `[ 'name', 'Peter', 'root/name', [] ]`. Not found → `null`.

### `dt.setupFilter ( name, fn )` → void
Runs `fn ({ name, flatData, breadcrumbs, edges })` once for every dt-line and stores the lines where it returned `true` as a named scan-list. Lines added later with `insertSegment` are filtered too. If the name already exists (including the built-in ones), it logs an error and keeps the first definition.

### `dt.insertSegment ( name, data )` → void
Adds an independent data block under breadcrumbs `name/...`. `data` can be a dt-object, a DT-model, or plain object/array data. Plain data works but logs a warning. Throws if `name` is empty, contains `/`, or already exists, or if `data` is missing or a primitive.

### `dt.listSegments ()` → string[]
Returns `[ 'root', ...insertedSegmentNames ]`.

### `dt.extractList ( names, { as }? )` → any[]
Resolves each name in order:
1. A segment name returns the segment in the `as` shape, or a dt-object when there are no options.
2. Otherwise, a property of the root object returns its value.
3. Otherwise, a path (`'c/d'`, `'root/c/d'`, `'l/0'`) returns the value at that path.
4. If nothing matches, the item is `null`.

When `options` are given, `as` is required and must be a model name or `'dt-object'`. Otherwise it throws.

```js
const st = dtbox.init ( { name: 'first', data: 'first data', c: { d: 5 } } )
st.insertSegment ( 'second', dtbox.init ( { name: 'second' } ) )
st.extractList ( [ 'second', 'data', 'c', 'missing' ], { as: 'std' } )
// → [ { name: 'second' }, 'first data', { d: 5 }, null ]
```

## Store: scan methods

The store is the first argument of `query`/`model` functions. Scan methods replace the current **scan-list** and return the store, so they chain. The scan-list starts as all dt-lines and resets to all dt-lines after each `look`.

| Method | Scan-list after the call |
|---|---|
| `from ( breadcrumbs )` | that dt-line plus all descendants (`[]` if not found) |
| `get ( breadcrumbs )` | only the dt-line with exactly these breadcrumbs |
| `find ( name )` | dt-lines (within the current scan-list) whose name equals `name` |
| `like ( text )` / `like ( [ texts ] )` | dt-lines whose name contains any of the texts |
| `use ( filterName )` | the filter's list. An unknown filter name leaves the scan-list unchanged |

Example with `{ name: 'Peter', friends: [ … ], personal: { age: 49, hobbies: { music: [ … ] } } }`:

```
from ( 'root/personal' ) → root/personal, root/personal/hobbies, root/personal/hobbies/music
find ( 'music' )         → root/personal/hobbies/music
like ( 's' )             → root/friends, root/personal, root/personal/hobbies, root/personal/hobbies/music
use ( 'list' )           → root/friends, root/personal/hobbies/music
```

### `look ( fn )` → void
Calls `fn` once per property of each dt-line in the scan-list, with:

| Field | Meaning |
|---|---|
| `value`, `key` | the property (`key` is a number for arrays) |
| `name`, `breadcrumbs`, `flatData` | the dt-line being visited |
| `links` | `[ [ name, childKey ], … ]` for the line's child objects |
| `empty` | `true` when the line has no primitive properties. Then `fn` runs once with `key: null`, `value: null` |
| `next` | `return next ()` to skip the rest of this dt-line |
| `finish` | `return finish ()` to stop the whole `look`. No further properties or dt-lines are visited |

A dt-line whose properties are all objects (e.g. a `root` that only contains nested objects) has empty `flatData`, so it is visited once with `empty: true`.

```js
const firstAdult = dtbox.init ({
      kids   : { tom: { age: 9 }, ann: { age: 12 } }
    , adults : { peter: { age: 49 }, maria: { age: 47 } }
  }).model ( store => {
        store.set ( 'root', [] )
        store.look ( ({ key, value, name, finish }) => {
                if ( key === 'age' && value >= 18 ) {
                        store.push ( 'root', name )
                        return finish ()   // found one: stop scanning
                    }
            })
        return { as: 'std' }
    })
// firstAdult → [ 'peter' ]
```

## Store: draft methods

Drafted dt-lines form the result of `query`/`model`. Names identify lines, and `connect` creates the nesting. A path (`'root/users/0'`) identifies a line by its place: it needs no `connect`, and lines with the same name in different places don't clash.

| Method | Effect | Returns |
|---|---|---|
| `set ( name, data )` | new dt-line. `data`: object or array of primitives (copied) | store |
| `set ( path, data )` | new dt-line on this place, attached to the parent line (the parent must be set first). An existing path: replaces the data, keeps the children | store |
| `save ( name or path, key, value )` | `flatData[key] = value` on a drafted line, if the key isn't set yet | store |
| `push ( name or path, value )` | appends to a drafted array line. Objects and arrays are ignored | store |
| `connect ( [ 'parent/child', … ] )` | nests drafted line `child` under drafted line `parent`, in any order | void |

In `std` output, lines that were never connected are added to the top level under their own name.

```js
const res = dt.model ( store => {
        store.set ( 'root', { name: 'X' } )
        store.set ( 'tags', [ 'a' ] )
        store.push ( 'tags', 'b' )
        store.save ( 'root', 'age', 1 )
        store.connect ( [ 'root/tags' ] )
        return { as: 'std' }
    })
// res → { name: 'X', age: 1, tags: [ 'a', 'b' ] }
```

Build by path when the same names repeat in different places (e.g. every user has `tags`):

```js
const users = dt.model ( store => {
        store.set ( 'root', {} )
        store.set ( 'root/users', [] )
        store.set ( 'root/users/0', { id: 0 } )
        store.set ( 'root/users/0/tags', [ 'a' ] )
        store.set ( 'root/users/1', { id: 1 } )
        store.set ( 'root/users/1/tags', [ 'b' ] )
        store.push ( 'root/users/1/tags', 'c' )
        return { as: 'std' }
    })
// users → { users: [ { id: 0, tags: [ 'a' ] }, { id: 1, tags: [ 'b', 'c' ] } ] }
```

A path whose parent line doesn't exist is a plain name with `/`, as before: it is not attached anywhere.

## Filters

Built-in filters, available through `store.use ( name )`:

| Name | Selects |
|---|---|
| `'root'` | top dt-line of each segment |
| `'object'` | dt-lines whose flatData is an object |
| `'list'` | dt-lines whose flatData is an array |
| `'listObject'` | objects that are items of an array (numeric names) |

Custom filters are created with `dt.setupFilter`. Prefer them when the same selection is used in many queries: the predicate runs once, not on every scan.

Speed of the scan methods: `get` and `from` use the index by breadcrumbs, so their time doesn't depend on the data size. `find` on all dt-lines builds an index by name on its second call; later calls don't scan. `like`, and `find` after another scan method, check every dt-line of the current scan-list.

## Errors

| Call | Bad input | Behaviour |
|---|---|---|
| `init` | unsupported model, circular data | throws |
| `flat`, `convert` | unsupported model / `as`, non-object or circular data | throws |
| `model` | unsupported or non-string `as` | throws |
| `extractList` | options without a valid `as` | throws |
| `export`, `copy` | non-string name | throws |
| `insertSegment` | bad / duplicate / `/`-containing name, primitive or circular data | throws |
| `setupFilter` | existing name | logs an error, keeps the first definition |
