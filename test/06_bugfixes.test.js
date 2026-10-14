/**
 *   Regression tests for bug fixes
 *   Generated: 2026-07-15
 *
 *   Each describe block corresponds to one of the 21 bugs found during
 *   the systematic probe of the dt-toolbox library.
 *
 */



import { expect } from "vitest"
import dtbox from "../src/main.js"



describe ( 'Bug fix regression tests', () => {



// ---- Bug 1: circular references crashed init with OOM ---------------------

describe ( 'bug fix 1: circular reference in init', () => {
    it ( 'throws a clear error for direct self-reference', () => {
        const o = { a: 1 }
        o.b = o
        expect ( () => dtbox.init ( o ) ).toThrow ( /Circular reference/ )
    })

    it ( 'throws a clear error for indirect self-reference', () => {
        const a = { a: 1 }
        const b = { b: a }
        a.b = b
        expect ( () => dtbox.init ( a ) ).toThrow ( /Circular reference/ )
    })

    it ( 'does not throw for normal objects', () => {
        const a = { x: { y: { z: 1 } } }
        expect ( () => dtbox.init ( a ) ).not.toThrow ()
    })
})



// ---- Bug 2-3: Date and RegExp round-trip preserved ---------------------

describe ( 'bug fix 2-3: Date and RegExp round-trip preservation', () => {
    it ( 'preserves a top-level Date through init+model', () => {
        const dt = dtbox.init ( { date: new Date ( '2024-01-15T10:30:00Z' ) } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.date ).toBeInstanceOf ( Date )
        expect ( m.date.toISOString () ).toEqual ( '2024-01-15T10:30:00.000Z' )
    })

    it ( 'preserves a nested Date through init+model', () => {
        const dt = dtbox.init ( { a: { b: { date: new Date ( '2024-12-25' ) } } } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.a.b.date ).toBeInstanceOf ( Date )
        expect ( m.a.b.date.toISOString () ).toEqual ( '2024-12-25T00:00:00.000Z' )
    })

    it ( 'preserves a RegExp through init+model', () => {
        const dt = dtbox.init ( { regex: /test/gi } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.regex ).toBeInstanceOf ( RegExp )
        expect ( m.regex.toString () ).toEqual ( '/test/gi' )
    })

    it ( 'preserves RegExp flags', () => {
        const dt = dtbox.init ( { r: /abc/m } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.r.flags ).toEqual ( 'm' )
    })
})



// ---- Bug 4: NaN / Infinity preserved through round-trip ---------------

describe ( 'bug fix 4: NaN and Infinity preservation', () => {
    it ( 'preserves NaN through init+model', () => {
        const dt = dtbox.init ( { value: NaN } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( Number.isNaN ( m.value ) ).toBe ( true )
    })

    it ( 'preserves Infinity through init+model', () => {
        const dt = dtbox.init ( { value: Infinity } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.value ).toEqual ( Infinity )
    })

    it ( 'preserves -Infinity through init+model', () => {
        const dt = dtbox.init ( { value: -Infinity } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.value ).toEqual ( -Infinity )
    })
})



// ---- Bug 5: model({as:'std'}) with multiple segments ------------------

describe ( 'bug fix 5: model({as:std}) preserves extra segments', () => {
    it ( 'merges extra segments into the std result', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 's1', { b: 2 } )
        dt.insertSegment ( 's2', { c: 3 } )
        const m = dt.model ( () => ({ as: 'std' }) )
        // Root and segments are all present
        expect ( m ).toHaveProperty ( 'a', 1 )
        expect ( m ).toHaveProperty ( 's1' )
        expect ( m.s1 ).toHaveProperty ( 'b', 2 )
        expect ( m ).toHaveProperty ( 's2' )
        expect ( m.s2 ).toHaveProperty ( 'c', 3 )
    })

    it ( 'other models still work the same way', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 's1', { b: 2 } )
        const bc = dt.model ( () => ({ as: 'breadcrumbs' }) )
        expect ( bc ).toHaveProperty ( 'a', 1 )
        expect ( bc ).toHaveProperty ( 's1/b', 2 )
    })
})



// ---- Bug 6-7: store.set with non-root breadcrumbs and primitives -----

describe ( 'bug fix 6-7: store.set with non-root and primitive values', () => {
    it ( 'query + model with non-root set returns the data', () => {
        const dt = dtbox.init ( { name: 'Peter' } )
        const r = dt.query ( store => { store.set ( 'nonroot', { key: 'value' } ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).toEqual ( { nonroot: { key: 'value' } } )
    })

    it ( 'query + model with primitive set preserves the value', () => {
        const dt = dtbox.init ( { name: 'Peter' } )
        const r = dt.query ( store => { store.set ( 'extra/data', 'new value' ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).toEqual ( { 'extra/data': 'new value' } )
    })

    it ( 'query + model with primitive set (number)', () => {
        const dt = dtbox.init ( {  } )
        const r = dt.query ( store => { store.set ( 'counter', 42 ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).toEqual ( { counter: 42 } )
    })

    it ( 'query + model with primitive set (boolean)', () => {
        const dt = dtbox.init ( {  } )
        const r = dt.query ( store => { store.set ( 'flag', true ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).toEqual ( { flag: true } )
    })

    it ( 'query + model with primitive set (null)', () => {
        const dt = dtbox.init ( {  } )
        const r = dt.query ( store => { store.set ( 'nothing', null ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).toEqual ( { nothing: null } )
    })
})



// ---- Bug 8: index returns null for scalar properties -----------------

describe ( 'bug fix 8: index returns scalar property values', () => {
    it ( 'returns scalar property at "root/a"', () => {
        const dt = dtbox.init ( { a: 1, b: { c: { d: 1 } } } )
        const r = dt.index ( 'root/a' )
        expect ( r[0] ).toEqual ( 'a' )
        expect ( r[1] ).toEqual ( 1 )
        expect ( r[2] ).toEqual ( 'root/a' )
    })

    it ( 'returns nested scalar property at "root/b/c/d"', () => {
        const dt = dtbox.init ( { a: 1, b: { c: { d: 42 } } } )
        const r = dt.index ( 'root/b/c/d' )
        expect ( r[0] ).toEqual ( 'd' )
        expect ( r[1] ).toEqual ( 42 )
        expect ( r[2] ).toEqual ( 'root/b/c/d' )
    })

    it ( 'returns null for non-existent path', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.index ( 'root/x' ) ).toBeNull ()
    })
})



// ---- Bug 9-10: export with invalid types ----------------------------

describe ( 'bug fix 9-10: export with invalid argument types', () => {
    it ( 'throws for non-string argument', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.export ( 42 ) ).toThrow ( /export\(name\)/ )
    })

    it ( 'throws for null', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.export ( null ) ).toThrow ( /export\(name\)/ )
    })

    it ( 'returns [] for non-existent segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.export ( 'nonexistent' ) ).toEqual ( [] )
    })

    it ( 'export("a") returns [] for a property (not a segment)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.export ( 'a' ) ).toEqual ( [] )
    })
})



// ---- Bug 11: copy() with invalid types --------------------------------

describe ( 'bug fix 11: copy() argument validation', () => {
    it ( 'throws for non-string argument', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.copy ( 42 ) ).toThrow ( /copy\(name\)/ )
    })

    it ( 'throws for null', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.copy ( null ) ).toThrow ( /copy\(name\)/ )
    })

    it ( 'returns null for non-existent segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.copy ( 'nonexistent' ) ).toBeNull ()
    })
})



// ---- Bug 12: extractList with nested properties ---------------------

describe ( 'bug fix 12: extractList resolves nested property paths', () => {
    it ( 'returns the value at a nested path', () => {
        const dt = dtbox.init ( { a: 1, b: 2, c: { d: 3, e: 4 } } )
        const r = dt.extractList ( [ 'a', 'c/d', 'c/e' ], { as: 'std' } )
        expect ( r ).toEqual ( [ 1, 3, 4 ] )
    })

    it ( 'returns the segment object for a segment name', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1, y: 2 } )
        const r = dt.extractList ( [ 'extra', 'extra/x' ], { as: 'std' } )
        expect ( r[0] ).toEqual ( { x: 1, y: 2 } )
        expect ( r[1] ).toEqual ( 1 )
    })

    it ( 'returns null for non-existent path', () => {
        const dt = dtbox.init ( { a: 1, c: { d: 3 } } )
        const r = dt.extractList ( [ 'c/nonexist' ], { as: 'std' } )
        expect ( r ).toEqual ( [ null ] )
    })
})



// ---- Bug 13-16: insertSegment error messages -------------------------

describe ( 'bug fix 13-16: insertSegment error messages', () => {
    it ( 'throws clear error for null data', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', null ) ).toThrow ( /requires a value/ )
    })

    it ( 'throws clear error for undefined data', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', undefined ) ).toThrow ( /requires a value/ )
    })

    it ( 'throws clear error for primitive data (number)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', 42 ) ).toThrow ( /requires an object/ )
    })

    it ( 'throws clear error for primitive data (string)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', 'hello' ) ).toThrow ( /requires an object/ )
    })

    it ( 'throws clear error for empty segment name', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( '', { x: 1 } ) ).toThrow ( /non-empty string/ )
    })

    it ( 'throws clear error for non-string segment name', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 42, { x: 1 } ) ).toThrow ( /non-empty string/ )
    })

    it ( 'still accepts arrays (they are valid data)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', [ 1, 2, 3 ] ) ).not.toThrow ()
    })
})



// ---- Bug 17: init() with primitive values -----------------------------

describe ( 'bug fix 17: init() accepts primitive values', () => {
    it ( 'init(number) returns a dt-object preserving the number', () => {
        const dt = dtbox.init ( 42 )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).toEqual ( { value: 42 } )
    })

    it ( 'init(string) returns a dt-object preserving the string', () => {
        const dt = dtbox.init ( 'hello' )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).toEqual ( { value: 'hello' } )
    })

    it ( 'init(boolean) returns a dt-object preserving the boolean', () => {
        const dt = dtbox.init ( true )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).toEqual ( { value: true } )
    })

    it ( 'init(null) returns a dt-object with null value', () => {
        const dt = dtbox.init ( null )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).toHaveProperty ( 'value', null )
    })

    it ( 'init(NaN) returns a dt-object preserving NaN', () => {
        const dt = dtbox.init ( NaN )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( Number.isNaN ( m.value ) ).toBe ( true )
    })
})



// ---- Bug 18-19: model({as: non-string}) -------------------------------

describe ( 'bug fix 18-19: model({as:non-string}) validation', () => {
    it ( 'throws for numeric as', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.model ( () => ({ as: 42 }) ) ).toThrow ( /'as' value to be a string/ )
    })

    it ( 'throws for object as', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.model ( () => ({ as: {} }) ) ).toThrow ( /'as' value to be a string/ )
    })

    it ( 'throws for unknown model name', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.model ( () => ({ as: 'unknown-model' }) ) ).toThrow ( /is unknown/ )
    })

    it ( 'throws clear error (no console.error side effect)', () => {
        const dt = dtbox.init ( { a: 1 } )
        // No console.error expected — it should throw.
        const origError = console.error
        let errorCalled = false
        console.error = () => { errorCalled = true }
        try {
            expect ( () => dt.model ( () => ({ as: 'unknown' }) ) ).toThrow ()
        } finally {
            console.error = origError
        }
        expect ( errorCalled ).toBe ( false )
    })
})



// ---- Bug 20-21: flat() edge cases -------------------------------------

describe ( 'bug fix 20-21: flat() edge cases', () => {
    it ( 'throws for null input', () => {
        expect ( () => dtbox.flat ( null ) ).toThrow ( /object or array/ )
    })

    it ( 'throws for undefined input', () => {
        expect ( () => dtbox.flat ( undefined ) ).toThrow ( /object or array/ )
    })

    it ( 'throws for primitive input (number)', () => {
        expect ( () => dtbox.flat ( 42 ) ).toThrow ( /object or array/ )
    })

    it ( 'throws for primitive input (string)', () => {
        expect ( () => dtbox.flat ( 'hello' ) ).toThrow ( /object or array/ )
    })

    it ( 'throws for unknown model', () => {
        expect ( () => dtbox.flat ( { a: 1 }, { model: 'unknown' } ) ).toThrow ( /data-model/ )
    })
})



// ---- Bug 22: insertSegment with duplicate segment name ---------------

describe ( 'bug fix 22: insertSegment with duplicate name', () => {
    it ( 'throws a clear error when inserting a duplicate segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1 } )
        expect ( () => dt.insertSegment ( 'extra', { y: 2 } ) ).toThrow ( /already exists/ )
    })

    it ( 'allows the same name after a model/query resets state', () => {
        // (Same name still throws — insertSegment is stateful.)
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1 } )
        dt.query ( store => { store.look ( ({ next }) => next () ) } )
        expect ( () => dt.insertSegment ( 'extra', { y: 2 } ) ).toThrow ( /already exists/ )
    })

    it ( 'no longer creates duplicate dt-lines at the same breadcrumbs', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1 } )
        try { dt.insertSegment ( 'extra', { y: 2 } ) } catch (e) {}
        const lines = dt.export ().filter ( l => l[0] === 'extra' )
        expect ( lines.length ).toEqual ( 1 )
    })
})



// ---- Bug 23: insertSegment with '/' in segment name -------------------

describe ( 'bug fix 23: insertSegment with / in segment name', () => {
    it ( 'throws a clear error for names containing /', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'a/b', { x: 1 } ) ).toThrow ( /breadcrumbs separator/ )
    })

    it ( 'throws for any name with / at start, middle, or end', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( '/leading', { x: 1 } ) ).toThrow ( /breadcrumbs separator/ )
        expect ( () => dt.insertSegment ( 'middle/', { x: 1 } ) ).toThrow ( /breadcrumbs separator/ )
        expect ( () => dt.insertSegment ( '/both/', { x: 1 } ) ).toThrow ( /breadcrumbs separator/ )
    })

    it ( 'still allows names with dots, spaces, and unicode', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'has.dot', { x: 1 } ) ).not.toThrow ()
        expect ( () => dt.insertSegment ( 'has space', { x: 1 } ) ).not.toThrow ()
        expect ( () => dt.insertSegment ( 'ünicode', { x: 1 } ) ).not.toThrow ()
    })
})



describe ( 'bug fix 24: flat and convert respect options.model', () => {
    const std = { a: 1, b: { c: 2 } }

    it ( 'convert reads midFlat source data', () => {
        const mid = dtbox.convert ( std, { as: 'midFlat' } )
        expect ( dtbox.convert ( mid, { model: 'midFlat', as: 'std' } ) ).toEqual ( std )
    })

    it ( 'convert reads breadcrumbs source data', () => {
        const res = dtbox.convert ( { a: 1, 'b/c': 2 }, { model: 'breadcrumbs', as: 'std' } )
        expect ( res ).toEqual ( std )
    })

    it ( 'convert reads tuples and files source data', () => {
        const tups = dtbox.convert ( std, { as: 'tuples' } )
        expect ( dtbox.convert ( tups, { model: 'tuples', as: 'std' } ) ).toEqual ( std )
        // 'files' is a string format, so use string values for the round-trip
        const strData = { a: 'x', b: { c: 'y' } }
        const files = dtbox.convert ( strData, { as: 'files' } )
        expect ( dtbox.convert ( files, { model: 'files', as: 'std' } ) ).toEqual ( strData )
    })

    it ( 'convert and flat read dt-model source data', () => {
        const model = dtbox.flat ( std )
        expect ( dtbox.convert ( model, { model: 'dt-model', as: 'std' } ) ).toEqual ( std )
        expect ( dtbox.flat ( model, { model: 'flat' } ) ).toEqual ( model )
    })

    it ( 'flat reads breadcrumbs source data', () => {
        const res = dtbox.flat ( { a: 1, 'b/c': 2 }, { model: 'breadcrumbs' } )
        expect ( res ).toEqual ( dtbox.flat ( std ) )
    })
})



describe ( 'v.8: init throws on unsupported data-model', () => {
    it ( 'throws with the list of supported models, without console output', () => {
        const origError = console.error
        let errorCalled = false
        console.error = () => { errorCalled = true }
        try {
                expect ( () => dtbox.init ( { a: 1 }, { model: 'halo' } ) ).toThrow ( /data-model: halo\. Supported: std, standard/ )
            }
        finally {
                console.error = origError
            }
        expect ( errorCalled ).toBe ( false )
    })
})



describe ( 'bug fix 25b: explicit undefined options fall back to defaults', () => {
    const std = { a: 1, b: { c: 2 } }

    it ( 'init with { model: undefined } or null options uses "std"', () => {
        expect ( dtbox.init ( std, { model: undefined } ).model ( () => ({ as: 'std' }) ) ).toEqual ( std )
        expect ( dtbox.init ( std, null ).model ( () => ({ as: 'std' }) ) ).toEqual ( std )
    })

    it ( 'flat with { model: undefined } uses "std"', () => {
        expect ( dtbox.flat ( std, { model: undefined } ) ).toEqual ( dtbox.flat ( std ) )
    })

    it ( 'convert with undefined model and/or as uses "std"', () => {
        expect ( dtbox.convert ( std, { model: undefined, as: undefined } ) ).toEqual ( std )
        expect ( dtbox.convert ( std, { model: undefined, as: 'breadcrumbs' } ) ).toEqual ( { a: 1, 'b/c': 2 } )
    })
})



describe ( 'bug fix 26: "file" and "midflat" aliases', () => {
    const std = { a: 1, b: { c: 2 } }

    it ( 'model as "file" returns the same result as "files"', () => {
        const dt = dtbox.init ( std )
        const files = dt.model ( () => ({ as: 'files' }) )
        expect ( dt.model ( () => ({ as: 'file' }) ) ).toEqual ( files )
        expect ( dtbox.convert ( std, { as: 'file' } ) ).toEqual ( files )
    })

    it ( 'init with "midflat" works like "midFlat"', () => {
        const mid = dtbox.convert ( std, { as: 'midFlat' } )
        const a = dtbox.init ( mid, { model: 'midflat' } ).model ( () => ({ as: 'std' }) )
        const b = dtbox.init ( mid, { model: 'midFlat' } ).model ( () => ({ as: 'std' }) )
        expect ( a ).toEqual ( std )
        expect ( a ).toEqual ( b )
    })
})



describe ( 'bug fix 27: store.push ignores object values', () => {
    it ( 'pushes primitives and null, ignores objects and arrays', () => {
        const res = dtbox.init ( { a: 1 } )
                         .query ( store => {
                                    store.set ( 'root', [] )
                                    store.push ( 'root', 'x' )
                                    store.push ( 'root', null )
                                    store.push ( 'root', { y: 1 } )
                                    store.push ( 'root', [ 2 ] )
                            })
                         .model ( () => ({ as: 'std' }) )
        expect ( res ).toEqual ( [ 'x', null ] )
    })

    it ( 'push and save ignore unknown targets; push ignores non-array dt-lines', () => {
        const res = dtbox.init ( { a: 1 } )
                         .query ( store => {
                                    store.set ( 'root', { k: 1 } )
                                    store.push ( 'missing', 'x' )
                                    store.push ( 'root', 'x' )        // root is an object -> ignored
                                    store.save ( 'missing', 'k', 2 )
                                    store.save ( 'root', 'k', 2 )     // existing key -> not overwritten
                            })
                         .model ( () => ({ as: 'std' }) )
        expect ( res ).toEqual ( { k: 1 } )
    })
})



describe ( 'bug fix 28: store.connect a dt-line that already has children', () => {
    it ( 'bottom-up connect re-parents descendants (was: crash)', () => {
        const res = dtbox.init ( { x: 1 } )
                         .query ( store => {
                                    store.set ( 'root', { name: 'top' } )
                                    store.set ( 'mid' , { m: 1 } )
                                    store.set ( 'leaf', { l: 2 } )
                                    store.connect ( [ 'mid/leaf' ] )
                                    store.connect ( [ 'root/mid' ] )
                            })
                         .model ( () => ({ as: 'std' }) )
        expect ( res ).toEqual ( { name: 'top', mid: { m: 1, leaf: { l: 2 } } } )
    })

    it ( 'works three levels deep and updates breadcrumbs and edges', () => {
        const dt = dtbox.init ( { x: 1 } )
                         .query ( store => {
                                    store.set ( 'root', { name: 'top' } )
                                    store.set ( 'a', { v: 'a' } )
                                    store.set ( 'b', { v: 'b' } )
                                    store.set ( 'c', [ 1, 2 ] )
                                    store.connect ( [ 'b/c' ] )
                                    store.connect ( [ 'a/b' ] )
                                    store.connect ( [ 'root/a' ] )
                            })
        expect ( dt.index ( 'root/a' )[3] ).toEqual ( [ 'root/a/b' ] )
        expect ( dt.index ( 'root/a/b' )[3] ).toEqual ( [ 'root/a/b/c' ] )
        expect ( dt.index ( 'root/a/b/c' )[1] ).toEqual ( [ 1, 2 ] )
        expect ( dt.model ( () => ({ as: 'std' }) ) ).toEqual ( { name: 'top', a: { v: 'a', b: { v: 'b', c: [ 1, 2 ] } } } )
    })
})



describe ( 'bug fix 29: Date/RegExp are leaf values in every data-model', () => {
    const data = { when: new Date ( 5 ), re: /a/gi, sub: { d: new Date ( 6 ) } }
    const hasSentinel = v => JSON.stringify ( v ).includes ( '__dtSentinel__' )

    it ( 'no internal sentinel objects leak into any output', () => {
        const dt = dtbox.init ( data )
        expect ( hasSentinel ( dt.export () ) ).toBe ( false )
        expect ( hasSentinel ( dtbox.flat ( data ) ) ).toBe ( false )
        expect ( hasSentinel ( dt.extractList ( [ 'when' ] ) ) ).toBe ( false )
        ;[ 'tuples', 'breadcrumbs', 'midFlat', 'files' ].forEach ( as => {
                expect ( hasSentinel ( dtbox.convert ( data, { as } ) ) ).toBe ( false )
            })
    })

    it ( 'Date/RegExp stay native in index, extractList, look, tuples and breadcrumbs', () => {
        const dt = dtbox.init ( data )
        expect ( dt.index ( 'root/when' )[1] ).toBeInstanceOf ( Date )
        expect ( dt.extractList ( [ 'when', 're' ] )[1] ).toBeInstanceOf ( RegExp )
        const looked = []
        dt.query ( store => store.look ( ({ value }) => { looked.push ( value ) }) )
        expect ( looked.every ( v => v instanceof Date || v instanceof RegExp ) ).toBe ( true )
        expect ( dtbox.convert ( data, { as: 'tuples' } ) ).toEqual ( [ [ 'when', data.when ], [ 're', data.re ], [ 'sub/d', data.sub.d ] ] )
        expect ( dtbox.convert ( data, { as: 'breadcrumbs' } ) ).toEqual ( { when: data.when, re: data.re, 'sub/d': data.sub.d } )
    })

    it ( 'std round-trip returns copies of Date/RegExp', () => {
        const res = dtbox.init ( data ).model ( () => ({ as: 'std' }) )
        expect ( res.when ).toBeInstanceOf ( Date )
        expect ( res.when.getTime () ).toBe ( 5 )
        expect ( res.when ).not.toBe ( data.when )
        expect ( String ( res.re ) ).toBe ( '/a/gi' )
        expect ( res.sub.d.getTime () ).toBe ( 6 )
    })

    it ( 'dt-models exported by 7.4.7 - 7.5.1 (with sentinels) still decode', () => {
        const legacy = [
                  [ 'root', {}, 'root', [ 'root/when' ] ]
                , [ 'when', { __dtSentinel__: 'date', iso: '1970-01-01T00:00:00.005Z' }, 'root/when', [] ]
            ]
        const res = dtbox.load ( legacy ).model ( () => ({ as: 'std' }) )
        expect ( res.when ).toBeInstanceOf ( Date )
        expect ( res.when.getTime () ).toBe ( 5 )
    })
})



describe ( 'bug fix 30: store.look finish() stops the whole look', () => {
    const data = { name: 'Peter', friends: [ 'Ivan', 'Stefan' ], personal: { age: 49, hobbies: { music: [ 'punk' ] } } }

    it ( 'no dt-lines are visited after finish()', () => {
        const visited = []
        dtbox.init ( data ).query ( store => store.look ( ({ name, key, finish }) => {
                    visited.push ( `${name}:${key}` )
                    if ( key === 'age' )   return finish ()
                }))
        expect ( visited ).toEqual ( [ 'root:name', 'friends:0', 'friends:1', 'personal:age' ] )
    })

    it ( 'next() still moves to the next dt-line', () => {
        const visited = []
        dtbox.init ( data ).query ( store => store.look ( ({ name, next }) => { visited.push ( name ); return next () }) )
        expect ( visited ).toEqual ( [ 'root', 'friends', 'personal', 'hobbies', 'music' ] )
    })

    it ( 'finish() returned from an empty dt-line stops the look', () => {
        const visited = []
        dtbox.init ( { e: {}, f: { x: 1 } } ).query ( store => store.look ( ({ name, empty, finish }) => {
                    visited.push ( name )
                    if ( empty )   return finish ()
                }))
        expect ( visited ).toEqual ( [ 'root' ] )
    })

    it ( 'scan-list resets after a look on an empty selection', () => {
        const visited = []
        dtbox.init ( data ).query ( store => {
                    store.from ( 'root/missing' ).look ( () => {} )
                    store.look ( ({ name, next }) => { visited.push ( name ); return next () })
            })
        expect ( visited ).toEqual ( [ 'root', 'friends', 'personal', 'hobbies', 'music' ] )
    })
})



describe ( 'bug fix 31: std output keeps the nested structure of inserted segments', () => {
    it ( 'nested segment data stays inside the segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', dtbox.init ( { x: 1, y: { z: 2, deep: { w: [ 1, 2 ] } } } ) )
        expect ( dt.model ( () => ({ as: 'std' }) ) ).toEqual ( { a: 1, extra: { x: 1, y: { z: 2, deep: { w: [ 1, 2 ] } } } } )
    })

    it ( 'matches copy() and extractList() of the segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', dtbox.init ( { x: 1, y: { z: 2 } } ) )
        const std = dt.model ( () => ({ as: 'std' }) )
        expect ( std.extra ).toEqual ( dt.copy ( 'extra' ) )
        expect ( std.extra ).toEqual ( dt.extractList ( [ 'extra' ], { as: 'std' } )[0] )
    })

    it ( 'segment with the same name as a root property is merged', () => {
        const dt = dtbox.init ( { a: 1, extra: { k: 1 } } )
        dt.insertSegment ( 'extra', dtbox.init ( { x: 1, y: { z: 2 } } ) )
        expect ( dt.model ( () => ({ as: 'std' }) ) ).toEqual ( { a: 1, extra: { k: 1, x: 1, y: { z: 2 } } } )
    })
})



describe ( 'bug fix 32: circular references and shared references', () => {
    const cyclic = () => { const c = { n: 1, inner: { list: [] } }; c.inner.list.push ( c ); return c }

    it ( 'init accepts shared (non-circular) references', () => {
        const shared = { x: 1 }
        const res = dtbox.init ( { a: shared, b: shared, list: [ shared, shared ] } ).model ( () => ({ as: 'std' }) )
        expect ( res ).toEqual ( { a: { x: 1 }, b: { x: 1 }, list: [ { x: 1 }, { x: 1 } ] } )
    })

    it ( 'flat, convert and insertSegment throw on circular data like init', () => {
        expect ( () => dtbox.init ( cyclic () ) ).toThrow ( /Circular reference/ )
        expect ( () => dtbox.flat ( cyclic () ) ).toThrow ( /Circular reference/ )
        expect ( () => dtbox.convert ( cyclic (), { as: 'breadcrumbs' } ) ).toThrow ( /Circular reference/ )
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 's', cyclic () ) ).toThrow ( /Circular reference/ )
    })

    it ( 'Date, RegExp and other built-ins referenced twice are not circular', () => {
        const when = new Date ( 0 )
        expect ( () => dtbox.init ( { a: when, b: { c: when } } ) ).not.toThrow ()
    })

    it ( 'very deep data does not overflow the stack', () => {
        let deep = { v: 0 }, cur = deep
        for ( let i = 1; i < 20000; i++ ) { cur.child = { v: i }; cur = cur.child }
        expect ( dtbox.flat ( deep ).length ).toBe ( 20000 )
    })

    it ( 'load with a malformed cyclic dt-model does not hang', () => {
        const line = [ 'root', {}, 'root', [] ]
        line[1].self = line
        expect ( () => dtbox.load ( [ line ] ) ).not.toThrow ()
    })
})



describe ( 'bug fix 33: init with model "dt-model" or "flat"', () => {
    it ( 'creates a dt-object from a DT-model (was: "d is not iterable")', () => {
        const data  = { a: 1, b: { c: [ 1, 2 ] } }
        const model = dtbox.flat ( data )
        expect ( dtbox.init ( model, { model: 'dt-model' } ).model ( () => ({ as: 'std' }) ) ).toEqual ( data )
        expect ( dtbox.init ( model, { model: 'flat' } ).export () ).toEqual ( model )
    })
})



describe ( 'bug fix 34: load keeps its own copy, copy() works for loaded dt-objects', () => {
    it ( 'changing the DT-model after load does not change the dt-object', () => {
        const model = dtbox.flat ( { a: 1, b: { c: 2 } } )
        const dt = dtbox.load ( model )
        model[0][1].a = 999
        model[1][1].c = 'changed'
        model.push ( [ 'x', { x: 1 }, 'root/x', [] ] )
        expect ( dt.model ( () => ({ as: 'std' }) ) ).toEqual ( { a: 1, b: { c: 2 } } )
        expect ( dt.index ( 'root/b' ) ).toEqual ( [ 'b', { c: 2 }, 'root/b', [] ] )
        expect ( dt.index ( 'root/x' ) ).toBeNull ()
    })

    it ( 'copy() returns the data of dt-objects created by load, init "dt-model" and query', () => {
        expect ( dtbox.load ( dtbox.flat ( { a: 1, b: { c: [ 1, 2 ] } } ) ).copy () ).toEqual ( { a: 1, b: { c: [ 1, 2 ] } } )
        expect ( dtbox.init ( dtbox.flat ( { k: 1 } ), { model: 'dt-model' } ).copy () ).toEqual ( { k: 1 } )
        const q = dtbox.init ( { a: 1 } ).query ( store => {
                        store.set ( 'root', { z: 1 } )
                        store.set ( 'list', [ 1 ] )
                        store.connect ( [ 'root/list' ] )
                })
        expect ( q.copy () ).toEqual ( { z: 1, list: [ 1 ] } )
        expect ( q.copy ( 'missing' ) ).toBeNull ()
    })

    it ( 'copy() of a loaded dt-object is independent', () => {
        const dt = dtbox.load ( dtbox.flat ( { a: 1, b: { c: 2 } } ) )
        const first = dt.copy ()
        first.b.c = 'mutated'
        expect ( dt.copy () ).toEqual ( { a: 1, b: { c: 2 } } )
    })

    it ( 'a loaded dt-object inserted as a segment keeps its data', () => {
        const dt = dtbox.init ( { r: 1 } )
        dt.insertSegment ( 'loaded', dtbox.load ( dtbox.flat ( { s: { t: 1 } } ) ) )
        expect ( dt.copy ( 'loaded' ) ).toEqual ( { s: { t: 1 } } )
        expect ( dt.model ( () => ({ as: 'std' }) ) ).toEqual ( { r: 1, loaded: { s: { t: 1 } } } )
    })
})



describe ( 'bug fix 35: keys and names with RegExp special characters', () => {
    it ( 'init, flat and convert handle keys like "a(b", "x+", "k$", "["', () => {
        const data = { 'a(b': 1, 'x+': { y: 1 }, 'k$': [ 1, 2 ], '[': 'v', 'a.b': { c: 1 }, aXb: 2 }
        expect ( dtbox.init ( data ).model ( () => ({ as: 'std' }) ) ).toEqual ( data )
        expect ( dtbox.convert ( data, { as: 'breadcrumbs' } ) ).toEqual ( { 'a(b': 1, 'x+/y': 1, 'k$/0': 1, 'k$/1': 2, '[': 'v', 'a.b/c': 1, aXb: 2 } )
    })

    it ( 'export and copy of segments with special names match only that segment', () => {
        const dt = dtbox.init ( { r: 1 } )
        dt.insertSegment ( 'a.b', dtbox.init ( { c: { d: 1 } } ) )
        dt.insertSegment ( 'aXb', dtbox.init ( { z: { w: 2 } } ) )
        dt.insertSegment ( 's(1)', dtbox.init ( { q: 1 } ) )
        expect ( dt.export ( 'a.b' ) ).toEqual ( [ [ 'root', {}, 'root', [ 'root/c' ] ], [ 'c', { d: 1 }, 'root/c', [] ] ] )
        expect ( dt.copy ( 'aXb' ) ).toEqual ( { z: { w: 2 } } )
        expect ( dt.copy ( 's(1)' ) ).toEqual ( { q: 1 } )
    })

    it ( 'store.connect works with special drafted names', () => {
        const res = dtbox.init ( { x: 1 } ).model ( store => {
                    store.set ( 'root', {} )
                    store.set ( 'm+', { m: 1 } )
                    store.set ( 'l(', [ 1 ] )
                    store.connect ( [ 'm+/l(' ] )
                    store.connect ( [ 'root/m+' ] )
                    return { as: 'std' }
            })
        expect ( res ).toEqual ( { 'm+': { m: 1, 'l(': [ 1 ] } } )
    })
})



describe ( 'bug fix 36: insertSegment with a DT-model', () => {
    it ( 'copy(name) returns the data, not the DT-model', () => {
        const dt = dtbox.init ( { r: 1 } )
        dt.insertSegment ( 'm', dtbox.flat ( { a: { b: 1 } } ) )
        expect ( dt.copy ( 'm' ) ).toEqual ( { a: { b: 1 } } )
    })

    it ( 'changing the DT-model after insertSegment does not change the dt-object', () => {
        const model = dtbox.flat ( { a: { b: 1 } } )
        const dt = dtbox.init ( { r: 1 } )
        dt.insertSegment ( 'm', model )
        model[1][1].b = 'changed'
        expect ( dt.copy ( 'm' ) ).toEqual ( { a: { b: 1 } } )
    })
})



describe ( 'bug fix 37: copy() returns the full data for every input model', () => {
    const data = { a: 1, b: { c: 2 }, l: [ 'p', 'q' ] }

    it ( 'midFlat, tuples, breadcrumbs input', () => {
        ;[ 'midFlat', 'tuples', 'breadcrumbs' ].forEach ( model => {
                const src = dtbox.convert ( data, { as: model } )
                expect ( dtbox.init ( src, { model } ).copy () ).toEqual ( data )   // midFlat was: { a: 1 }
            })
    })

    it ( 'copy() is independent of the dt-object', () => {
        const dt = dtbox.init ( data )
        const first = dt.copy ()
        first.b.c = 'changed'
        first.l.push ( 'x' )
        expect ( dt.copy () ).toEqual ( data )
    })
})



describe ( 'bug fix 38: breadcrumbs output keeps array indexes', () => {
    it ( 'one-item arrays keep their index and round-trip', () => {
        const data = { k: [ 1 ], m: [ 1, 2 ] }
        const out = dtbox.convert ( data, { as: 'breadcrumbs' } )
        expect ( out ).toEqual ( { 'k/0': 1, 'm/0': 1, 'm/1': 2 } )   // was: { k: 1, ... }
        expect ( dtbox.convert ( out, { model: 'breadcrumbs', as: 'std' } ) ).toEqual ( data )
    })

    it ( 'arrays with objects between values keep correct indexes (was: values lost)', () => {
        const data = { m: [ 'first', { a: 1 }, 'third' ] }
        const out = dtbox.convert ( data, { as: 'breadcrumbs' } )
        expect ( out ).toEqual ( { 'm/0': 'first', 'm/1/a': 1, 'm/2': 'third' } )
        expect ( dtbox.convert ( out, { model: 'breadcrumbs', as: 'std' } ) ).toEqual ( data )
    })

    it ( 'a one-item array at the top level', () => {
        expect ( dtbox.convert ( [ 'only' ], { as: 'breadcrumbs' } ) ).toEqual ( { 0: 'only' } )   // was: { root: 'only' }
        expect ( dtbox.convert ( { 0: 'only' }, { model: 'breadcrumbs', as: 'std' } ) ).toEqual ( [ 'only' ] )
    })
})



describe ( 'bug fix 39: midFlat input without top-level primitive values', () => {
    it ( 'keeps the data (7.5.1 returned {})', () => {
        ;[ { k: [ 'only' ] }, { b: { c: 2 } }, { a: 1, k: [ 'only' ] } ].forEach ( data => {
                const mid = dtbox.init ( data ).model ( () => ({ as: 'midFlat' }) )
                expect ( dtbox.init ( mid, { model: 'midFlat' } ).model ( () => ({ as: 'std' }) ) ).toEqual ( data )
            })
    })
})



describe ( 'coverage: previously untested paths', () => {
    const data = { a: 1, c: { d: [ 10, 20 ] }, when: new Date ( 0 ) }

    it ( 'model as "flat" / "dt-model" returns a DT-model copy', () => {
        const dt = dtbox.init ( data )
        expect ( dt.model ( () => ({ as: 'flat' }) ) ).toEqual ( dt.export () )
        expect ( dt.model ( () => ({ as: 'dt-model' }) ) ).toEqual ( dt.export () )
    })

    it ( 'convert rejects non-object input', () => {
        expect ( () => dtbox.convert ( null ) ).toThrow ( /object or array/ )
        expect ( () => dtbox.convert ( 42 ) ).toThrow ( /object or array/ )
    })

    it ( 'getWalk returns the walk function', () => {
        const walk = dtbox.getWalk ()
        expect ( typeof walk ).toBe ( 'function' )
        expect ( walk ({ data: { a: [ 1 ] } }) ).toEqual ( { a: [ 1 ] } )
    })

    it ( 'index returns a copy of a Date property', () => {
        const dt = dtbox.init ( data )
        const [ name, value, breadcrumbs ] = dt.index ( 'root/when' )
        expect ( name ).toBe ( 'when' )
        expect ( breadcrumbs ).toBe ( 'root/when' )
        expect ( value ).toBeInstanceOf ( Date )
        expect ( value.getTime () ).toBe ( 0 )
    })

    it ( 'extractList validates options', () => {
        const dt = dtbox.init ( data )
        expect ( () => dt.extractList ( [ 'a' ], {} ) ).toThrow ( /"as" is required/ )
        expect ( () => dt.extractList ( [ 'a' ], { as: 'nope' } ) ).toThrow ( /Invalid option/ )
    })

    it ( 'extractList resolves array indexes in nested paths', () => {
        const dt = dtbox.init ( data )
        expect ( dt.extractList ( [ 'c/d/1', 'c/d/x', 'c/d/1/deeper' ] ) ).toEqual ( [ 20, null, null ] )
    })

    it ( 'setupFilter keeps the first definition of a filter name', () => {
        const dt = dtbox.init ( data )
        const origError = console.error
        let msg = ''
        console.error = m => { msg = m }
        try {
                dt.setupFilter ( 'list', () => false )   // 'list' is a built-in filter
            }
        finally {
                console.error = origError
            }
        expect ( msg ).toMatch ( /already defined/ )
        const names = []
        dt.query ( store => { store.use ( 'list' ).look ( ({ name, next }) => { names.push ( name ); return next () }) })
        expect ( names ).toEqual ( [ 'd' ] )
    })
})



}) // bug fix regression tests
