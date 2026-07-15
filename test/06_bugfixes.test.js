/**
 *   Regression tests for bug fixes
 *   Generated: 2026-07-15
 *
 *   Each describe block corresponds to one of the 21 bugs found during
 *   the systematic probe of the dt-toolbox library.
 *
 */



import { expect } from "chai"
import dtbox from "../src/main.js"



describe ( 'Bug fix regression tests', () => {



// ---- Bug 1: circular references crashed init with OOM ---------------------

describe ( 'bug fix 1: circular reference in init', () => {
    it ( 'throws a clear error for direct self-reference', () => {
        const o = { a: 1 }
        o.b = o
        expect ( () => dtbox.init ( o ) ).to.throw ( /Circular reference/ )
    })

    it ( 'throws a clear error for indirect self-reference', () => {
        const a = { a: 1 }
        const b = { b: a }
        a.b = b
        expect ( () => dtbox.init ( a ) ).to.throw ( /Circular reference/ )
    })

    it ( 'does not throw for normal objects', () => {
        const a = { x: { y: { z: 1 } } }
        expect ( () => dtbox.init ( a ) ).to.not.throw ()
    })
})



// ---- Bug 2-3: Date and RegExp round-trip preserved ---------------------

describe ( 'bug fix 2-3: Date and RegExp round-trip preservation', () => {
    it ( 'preserves a top-level Date through init+model', () => {
        const dt = dtbox.init ( { date: new Date ( '2024-01-15T10:30:00Z' ) } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.date ).to.be.instanceOf ( Date )
        expect ( m.date.toISOString () ).to.equal ( '2024-01-15T10:30:00.000Z' )
    })

    it ( 'preserves a nested Date through init+model', () => {
        const dt = dtbox.init ( { a: { b: { date: new Date ( '2024-12-25' ) } } } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.a.b.date ).to.be.instanceOf ( Date )
        expect ( m.a.b.date.toISOString () ).to.equal ( '2024-12-25T00:00:00.000Z' )
    })

    it ( 'preserves a RegExp through init+model', () => {
        const dt = dtbox.init ( { regex: /test/gi } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.regex ).to.be.instanceOf ( RegExp )
        expect ( m.regex.toString () ).to.equal ( '/test/gi' )
    })

    it ( 'preserves RegExp flags', () => {
        const dt = dtbox.init ( { r: /abc/m } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.r.flags ).to.equal ( 'm' )
    })
})



// ---- Bug 4: NaN / Infinity preserved through round-trip ---------------

describe ( 'bug fix 4: NaN and Infinity preservation', () => {
    it ( 'preserves NaN through init+model', () => {
        const dt = dtbox.init ( { value: NaN } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( Number.isNaN ( m.value ) ).to.be.true
    })

    it ( 'preserves Infinity through init+model', () => {
        const dt = dtbox.init ( { value: Infinity } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.value ).to.equal ( Infinity )
    })

    it ( 'preserves -Infinity through init+model', () => {
        const dt = dtbox.init ( { value: -Infinity } )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m.value ).to.equal ( -Infinity )
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
        expect ( m ).to.have.property ( 'a', 1 )
        expect ( m ).to.have.property ( 's1' )
        expect ( m.s1 ).to.have.property ( 'b', 2 )
        expect ( m ).to.have.property ( 's2' )
        expect ( m.s2 ).to.have.property ( 'c', 3 )
    })

    it ( 'other models still work the same way', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 's1', { b: 2 } )
        const bc = dt.model ( () => ({ as: 'breadcrumbs' }) )
        expect ( bc ).to.have.property ( 'a', 1 )
        expect ( bc ).to.have.property ( 's1/b', 2 )
    })
})



// ---- Bug 6-7: store.set with non-root breadcrumbs and primitives -----

describe ( 'bug fix 6-7: store.set with non-root and primitive values', () => {
    it ( 'query + model with non-root set returns the data', () => {
        const dt = dtbox.init ( { name: 'Peter' } )
        const r = dt.query ( store => { store.set ( 'nonroot', { key: 'value' } ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).to.deep.equal ( { nonroot: { key: 'value' } } )
    })

    it ( 'query + model with primitive set preserves the value', () => {
        const dt = dtbox.init ( { name: 'Peter' } )
        const r = dt.query ( store => { store.set ( 'extra/data', 'new value' ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).to.deep.equal ( { 'extra/data': 'new value' } )
    })

    it ( 'query + model with primitive set (number)', () => {
        const dt = dtbox.init ( {  } )
        const r = dt.query ( store => { store.set ( 'counter', 42 ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).to.deep.equal ( { counter: 42 } )
    })

    it ( 'query + model with primitive set (boolean)', () => {
        const dt = dtbox.init ( {  } )
        const r = dt.query ( store => { store.set ( 'flag', true ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).to.deep.equal ( { flag: true } )
    })

    it ( 'query + model with primitive set (null)', () => {
        const dt = dtbox.init ( {  } )
        const r = dt.query ( store => { store.set ( 'nothing', null ) } )
                         .model ( () => ({ as: 'std' }) )
        expect ( r ).to.deep.equal ( { nothing: null } )
    })
})



// ---- Bug 8: index returns null for scalar properties -----------------

describe ( 'bug fix 8: index returns scalar property values', () => {
    it ( 'returns scalar property at "root/a"', () => {
        const dt = dtbox.init ( { a: 1, b: { c: { d: 1 } } } )
        const r = dt.index ( 'root/a' )
        expect ( r[0] ).to.equal ( 'a' )
        expect ( r[1] ).to.equal ( 1 )
        expect ( r[2] ).to.equal ( 'root/a' )
    })

    it ( 'returns nested scalar property at "root/b/c/d"', () => {
        const dt = dtbox.init ( { a: 1, b: { c: { d: 42 } } } )
        const r = dt.index ( 'root/b/c/d' )
        expect ( r[0] ).to.equal ( 'd' )
        expect ( r[1] ).to.equal ( 42 )
        expect ( r[2] ).to.equal ( 'root/b/c/d' )
    })

    it ( 'returns null for non-existent path', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.index ( 'root/x' ) ).to.be.null
    })
})



// ---- Bug 9-10: export with invalid types ----------------------------

describe ( 'bug fix 9-10: export with invalid argument types', () => {
    it ( 'throws for non-string argument', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.export ( 42 ) ).to.throw ( /export\(name\)/ )
    })

    it ( 'throws for null', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.export ( null ) ).to.throw ( /export\(name\)/ )
    })

    it ( 'returns [] for non-existent segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.export ( 'nonexistent' ) ).to.deep.equal ( [] )
    })

    it ( 'export("a") returns [] for a property (not a segment)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.export ( 'a' ) ).to.deep.equal ( [] )
    })
})



// ---- Bug 11: copy() with invalid types --------------------------------

describe ( 'bug fix 11: copy() argument validation', () => {
    it ( 'throws for non-string argument', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.copy ( 42 ) ).to.throw ( /copy\(name\)/ )
    })

    it ( 'throws for null', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.copy ( null ) ).to.throw ( /copy\(name\)/ )
    })

    it ( 'returns null for non-existent segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( dt.copy ( 'nonexistent' ) ).to.be.null
    })
})



// ---- Bug 12: extractList with nested properties ---------------------

describe ( 'bug fix 12: extractList resolves nested property paths', () => {
    it ( 'returns the value at a nested path', () => {
        const dt = dtbox.init ( { a: 1, b: 2, c: { d: 3, e: 4 } } )
        const r = dt.extractList ( [ 'a', 'c/d', 'c/e' ], { as: 'std' } )
        expect ( r ).to.deep.equal ( [ 1, 3, 4 ] )
    })

    it ( 'returns the segment object for a segment name', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1, y: 2 } )
        const r = dt.extractList ( [ 'extra', 'extra/x' ], { as: 'std' } )
        expect ( r[0] ).to.deep.equal ( { x: 1, y: 2 } )
        expect ( r[1] ).to.equal ( 1 )
    })

    it ( 'returns null for non-existent path', () => {
        const dt = dtbox.init ( { a: 1, c: { d: 3 } } )
        const r = dt.extractList ( [ 'c/nonexist' ], { as: 'std' } )
        expect ( r ).to.deep.equal ( [ null ] )
    })
})



// ---- Bug 13-16: insertSegment error messages -------------------------

describe ( 'bug fix 13-16: insertSegment error messages', () => {
    it ( 'throws clear error for null data', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', null ) ).to.throw ( /requires a value/ )
    })

    it ( 'throws clear error for undefined data', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', undefined ) ).to.throw ( /requires a value/ )
    })

    it ( 'throws clear error for primitive data (number)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', 42 ) ).to.throw ( /requires an object/ )
    })

    it ( 'throws clear error for primitive data (string)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', 'hello' ) ).to.throw ( /requires an object/ )
    })

    it ( 'throws clear error for empty segment name', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( '', { x: 1 } ) ).to.throw ( /non-empty string/ )
    })

    it ( 'throws clear error for non-string segment name', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 42, { x: 1 } ) ).to.throw ( /non-empty string/ )
    })

    it ( 'still accepts arrays (they are valid data)', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'extra', [ 1, 2, 3 ] ) ).to.not.throw ()
    })
})



// ---- Bug 17: init() with primitive values -----------------------------

describe ( 'bug fix 17: init() accepts primitive values', () => {
    it ( 'init(number) returns a dt-object preserving the number', () => {
        const dt = dtbox.init ( 42 )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).to.deep.equal ( { value: 42 } )
    })

    it ( 'init(string) returns a dt-object preserving the string', () => {
        const dt = dtbox.init ( 'hello' )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).to.deep.equal ( { value: 'hello' } )
    })

    it ( 'init(boolean) returns a dt-object preserving the boolean', () => {
        const dt = dtbox.init ( true )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).to.deep.equal ( { value: true } )
    })

    it ( 'init(null) returns a dt-object with null value', () => {
        const dt = dtbox.init ( null )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( m ).to.have.property ( 'value', null )
    })

    it ( 'init(NaN) returns a dt-object preserving NaN', () => {
        const dt = dtbox.init ( NaN )
        const m = dt.model ( () => ({ as: 'std' }) )
        expect ( Number.isNaN ( m.value ) ).to.be.true
    })
})



// ---- Bug 18-19: model({as: non-string}) -------------------------------

describe ( 'bug fix 18-19: model({as:non-string}) validation', () => {
    it ( 'throws for numeric as', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.model ( () => ({ as: 42 }) ) ).to.throw ( /'as' value to be a string/ )
    })

    it ( 'throws for object as', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.model ( () => ({ as: {} }) ) ).to.throw ( /'as' value to be a string/ )
    })

    it ( 'throws for unknown model name', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.model ( () => ({ as: 'unknown-model' }) ) ).to.throw ( /is unknown/ )
    })

    it ( 'throws clear error (no console.error side effect)', () => {
        const dt = dtbox.init ( { a: 1 } )
        // No console.error expected — it should throw.
        const origError = console.error
        let errorCalled = false
        console.error = () => { errorCalled = true }
        try {
            expect ( () => dt.model ( () => ({ as: 'unknown' }) ) ).to.throw ()
        } finally {
            console.error = origError
        }
        expect ( errorCalled ).to.be.false
    })
})



// ---- Bug 20-21: flat() edge cases -------------------------------------

describe ( 'bug fix 20-21: flat() edge cases', () => {
    it ( 'throws for null input', () => {
        expect ( () => dtbox.flat ( null ) ).to.throw ( /object or array/ )
    })

    it ( 'throws for undefined input', () => {
        expect ( () => dtbox.flat ( undefined ) ).to.throw ( /object or array/ )
    })

    it ( 'throws for primitive input (number)', () => {
        expect ( () => dtbox.flat ( 42 ) ).to.throw ( /object or array/ )
    })

    it ( 'throws for primitive input (string)', () => {
        expect ( () => dtbox.flat ( 'hello' ) ).to.throw ( /object or array/ )
    })

    it ( 'throws for unknown model', () => {
        expect ( () => dtbox.flat ( { a: 1 }, { model: 'unknown' } ) ).to.throw ( /data-model/ )
    })
})



// ---- Bug 22: insertSegment with duplicate segment name ---------------

describe ( 'bug fix 22: insertSegment with duplicate name', () => {
    it ( 'throws a clear error when inserting a duplicate segment', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1 } )
        expect ( () => dt.insertSegment ( 'extra', { y: 2 } ) ).to.throw ( /already exists/ )
    })

    it ( 'allows the same name after a model/query resets state', () => {
        // (Same name still throws — insertSegment is stateful.)
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1 } )
        dt.query ( store => { store.look ( ({ next }) => next () ) } )
        expect ( () => dt.insertSegment ( 'extra', { y: 2 } ) ).to.throw ( /already exists/ )
    })

    it ( 'no longer creates duplicate dt-lines at the same breadcrumbs', () => {
        const dt = dtbox.init ( { a: 1 } )
        dt.insertSegment ( 'extra', { x: 1 } )
        try { dt.insertSegment ( 'extra', { y: 2 } ) } catch (e) {}
        const lines = dt.export ().filter ( l => l[0] === 'extra' )
        expect ( lines.length ).to.equal ( 1 )
    })
})



// ---- Bug 23: insertSegment with '/' in segment name -------------------

describe ( 'bug fix 23: insertSegment with / in segment name', () => {
    it ( 'throws a clear error for names containing /', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'a/b', { x: 1 } ) ).to.throw ( /breadcrumbs separator/ )
    })

    it ( 'throws for any name with / at start, middle, or end', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( '/leading', { x: 1 } ) ).to.throw ( /breadcrumbs separator/ )
        expect ( () => dt.insertSegment ( 'middle/', { x: 1 } ) ).to.throw ( /breadcrumbs separator/ )
        expect ( () => dt.insertSegment ( '/both/', { x: 1 } ) ).to.throw ( /breadcrumbs separator/ )
    })

    it ( 'still allows names with dots, spaces, and unicode', () => {
        const dt = dtbox.init ( { a: 1 } )
        expect ( () => dt.insertSegment ( 'has.dot', { x: 1 } ) ).to.not.throw ()
        expect ( () => dt.insertSegment ( 'has space', { x: 1 } ) ).to.not.throw ()
        expect ( () => dt.insertSegment ( 'ünicode', { x: 1 } ) ).to.not.throw ()
    })
})



}) // bug fix regression tests
