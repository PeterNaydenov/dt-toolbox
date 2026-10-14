# Recipes

Each recipe is a complete, runnable program. Expected results are shown as `// name → value`.

## Contents
- [Group records by a field](#group-records-by-a-field)
- [Collect values from one branch](#collect-values-from-one-branch)
- [Process every item of an array of objects](#process-every-item-of-an-array-of-objects)
- [Reuse a selection with a filter](#reuse-a-selection-with-a-filter)
- [Chain query and model](#chain-query-and-model)
- [Build a nested result](#build-a-nested-result)
- [Combine data sources with segments](#combine-data-sources-with-segments)
- [Save and reload a dt-object](#save-and-reload-a-dt-object)
- [Flatten for a form and rebuild](#flatten-for-a-form-and-rebuild)

## Group records by a field

```js
import dtbox from 'dt-toolbox'

const people = {
      alice : { age: 34, city: 'Varna' }
    , bob   : { age: 51, city: 'Sofia' }
    , carol : { age: 28, city: 'Varna' }
  }

const byCity = dtbox.init ( people ).model ( store => {
        const seen = new Set ()
        store.set ( 'root', {} )
        store.look ( ({ key, value, name }) => {
                if ( key !== 'city' )   return
                if ( !seen.has ( value ) ) {
                        seen.add ( value )
                        store.set ( value, [] )
                        store.connect ( [ `root/${value}` ] )
                    }
                store.push ( value, name )
            })
        return { as: 'std' }
    })
// byCity → { Varna: [ 'alice', 'carol' ], Sofia: [ 'bob' ] }
```

`set` creates a group line the first time a city appears, and `connect` nests it under `root`.

## Collect values from one branch

```js
import dtbox from 'dt-toolbox'

const data = {
      name     : 'Peter'
    , personal : { age: 49, hobbies: { music: [ 'punk', 'ska' ], sport: [ 'fencing' ] } }
  }

const hobbies = dtbox.init ( data ).model ( store => {
        store.set ( 'root', [] )
        store.from ( 'root/personal/hobbies' ).look ( ({ value, flatData }) => {
                if ( Array.isArray ( flatData ) )   store.push ( 'root', value )
            })
        return { as: 'std' }
    })
// hobbies → [ 'punk', 'ska', 'fencing' ]
```

`from` limits the scan to one branch. The `hobbies` line itself only contains arrays, so it is visited once as `empty`. The array check skips that visit.

## Process every item of an array of objects

```js
import dtbox from 'dt-toolbox'

const orders = [
      { id: 'A1', total: 120, status: 'paid' }
    , { id: 'A2', total:  80, status: 'open' }
    , { id: 'A3', total: 200, status: 'paid' }
  ]

const paidIds = dtbox.init ( orders ).model ( store => {
        store.set ( 'root', [] )
        store.use ( 'listObject' ).look ( ({ flatData, next }) => {
                if ( flatData.status === 'paid' )   store.push ( 'root', flatData.id )
                return next ()   // decision is made from flatData; skip the remaining properties
            })
        return { as: 'std' }
    })
// paidIds → [ 'A1', 'A3' ]
```

The built-in `listObject` filter selects the objects inside arrays. Reading `flatData` and returning `next()` handles each order exactly once.

## Reuse a selection with a filter

```js
import dtbox from 'dt-toolbox'

const team = dtbox.init ({
      alice : { eyes: 'blue',  role: 'dev' }
    , bob   : { eyes: 'green', role: 'qa'  }
    , carol : { eyes: 'blue',  role: 'qa'  }
  })

team.setupFilter ( 'blueEyes', ({ flatData }) => flatData.eyes === 'blue' )

const names = team.model ( store => {
        store.set ( 'root', [] )
        store.use ( 'blueEyes' ).look ( ({ name, next }) => {
                store.push ( 'root', name )
                return next ()
            })
        return { as: 'std' }
    })
// names → [ 'alice', 'carol' ]
```

The predicate runs once in `setupFilter`, and every later `store.use ( 'blueEyes' )` reuses the stored list. Double-check filter names: an unknown name silently scans everything.

## Chain query and model

```js
import dtbox from 'dt-toolbox'

const shop = dtbox.init ({
      fruits     : { apple: 1.2, kiwi: 0.5 }
    , vegetables : { carrot: 0.4, potato: 0.3 }
  })

const cheap = shop.query ( ( store, max ) => {
        store.set ( 'root', {} )
        store.look ( ({ key, value }) => {
                if ( typeof value === 'number' && value <= max )   store.save ( 'root', key, value )
            })
    }, 0.5 )

const asRows = cheap.model ( () => ({ as: 'tuples' }) )
// asRows → [ [ 'kiwi', 0.5 ], [ 'carrot', 0.4 ], [ 'potato', 0.3 ] ]
```

`query` returns a new dt-object, so you can query it again or output it in any model.

## Build a nested result

```js
import dtbox from 'dt-toolbox'

const result = dtbox.init ( { x: 1 } ).model ( store => {
        store.set ( 'root', { title: 'Report' } )
        store.set ( 'summary', { count: 2 } )
        store.set ( 'items', [ 'a', 'b' ] )
        store.connect ( [ 'root/summary', 'summary/items' ] )
        return { as: 'std' }
    })
// result → { title: 'Report', summary: { count: 2, items: [ 'a', 'b' ] } }
```

`connect` takes `'parent/child'` pairs of drafted line names, in any order.

## Combine data sources with segments

```js
import dtbox from 'dt-toolbox'

const dt = dtbox.init ( { user: 'peter' } )
dt.insertSegment ( 'settings', dtbox.init ( { theme: 'dark', layout: { cols: 2 } } ) )

const segments = dt.listSegments ()
// segments → [ 'root', 'settings' ]

const settings = dt.copy ( 'settings' )
// settings → { theme: 'dark', layout: { cols: 2 } }

const both = dt.extractList ( [ 'root', 'settings' ], { as: 'std' } )
// both → [ { user: 'peter' }, { theme: 'dark', layout: { cols: 2 } } ]

const all = dt.model ( () => ({ as: 'std' }) )
// all → { user: 'peter', settings: { theme: 'dark', layout: { cols: 2 } } }
```

`copy` and `extractList` read single segments. `std` output returns everything, with each segment under its own key. Inside query/model functions, a segment's breadcrumbs start with its name (`'settings/layout'`), so `store.from ( 'settings' )` scans only that segment.

## Save and reload a dt-object

```js
import dtbox from 'dt-toolbox'

const original = dtbox.init ( { a: 1, b: { c: [ 1, 2 ] } } )
const json     = JSON.stringify ( original.export () )

const restored = dtbox.load ( JSON.parse ( json ) )
const data = restored.model ( () => ({ as: 'std' }) )
// data → { a: 1, b: { c: [ 1, 2 ] } }
```

`export` gives a plain DT-model array that serializes cleanly. Note that Date and RegExp values don't survive `JSON.stringify`.

## Flatten for a form and rebuild

```js
import dtbox from 'dt-toolbox'

const profile = { name: 'Peter', address: { city: 'Varna', zip: '9000' } }

const fields = dtbox.convert ( profile, { as: 'breadcrumbs' } )
// fields → { name: 'Peter', 'address/city': 'Varna', 'address/zip': '9000' }

fields [ 'address/city' ] = 'Sofia'
const updated = dtbox.convert ( fields, { model: 'breadcrumbs', as: 'std' } )
// updated → { name: 'Peter', address: { city: 'Sofia', zip: '9000' } }
```
