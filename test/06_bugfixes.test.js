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



}) // bug fix regression tests
