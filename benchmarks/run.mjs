/**
 *  Benchmark worker. Runs in its own Node process and prints JSON.
 *
 *  Usage:
 *    node benchmarks/run.mjs <path-to-dtbox-module> speed
 *    node --expose-gc benchmarks/run.mjs <path-to-dtbox-module> memory
 *    node --expose-gc --max-semi-space-size=256 benchmarks/run.mjs <path-to-dtbox-module> allocation
 */



import { pathToFileURL } from 'node:url'
import { PerformanceObserver } from 'node:perf_hooks'
import path from 'node:path'
import { datasets } from './datasets.mjs'



const
      [ modulePath, mode ] = process.argv.slice ( 2 )
    , { default: dtbox } = await import ( pathToFileURL ( path.resolve ( modulePath ) ).href )
    ;



/** Median time in ms of `runs` calls, after a few warm-up calls. */
function time ( fn, runs = 15 ) {
        for ( let i = 0; i < 3; i++ )   fn ()
        const t = [];
        for ( let i = 0; i < runs; i++ ) {
                const start = performance.now ();
                fn ()
                t.push ( performance.now () - start )
            }
        t.sort ( ( a, b ) => a - b )
        return t[ Math.floor ( t.length / 2 ) ]
    } // time func.



/** The measured operations for one data set. */
function operations ( data ) {
        const
              dt    = dtbox.init ( data )
            , model = dt.export ()
            ;
        return {
                  'init'                 : () => dtbox.init ( data )
                , 'flat'                 : () => dtbox.flat ( data )
                , 'load'                 : () => dtbox.load ( model )
                , 'dt.copy()'            : () => dt.copy ()
                , "model as 'std'"       : () => dt.model ( () => ({ as: 'std' }) )
                , "model as 'dt-model'"  : () => dt.model ( () => ({ as: 'dt-model' }) )
            }
    } // operations func.



function speed () {
        const result = {};
        for ( const [ name, make ] of Object.entries ( datasets ) ) {
                result[ name ] = {}
                for ( const [ op, fn ] of Object.entries ( operations ( make () ) ) )   result[ name ][ op ] = time ( fn )
            }
        return result
    } // speed func.



/**
 * Memory allocated by one call (temporary + retained), in MiB.
 * Needs a young generation large enough that no garbage collection runs during the call
 * (`--max-semi-space-size=256`). Calls with a collection inside are not counted.
 */
async function allocation () {
        const
              gcTimes = []
            , tick = () => new Promise ( resolve => setImmediate ( resolve ) )   // Let the observer deliver entries
            , heap = () => process.memoryUsage ().heapUsed
            , result = {}
            ;
        new PerformanceObserver ( list => gcTimes.push ( ...list.getEntries ().map ( e => e.startTime ) ) ).observe ({ entryTypes: [ 'gc' ] })
        for ( const [ name, make ] of Object.entries ( datasets ) ) {
                result[ name ] = {}
                for ( const [ op, fn ] of Object.entries ( operations ( make () ) ) ) {
                        for ( let i = 0; i < 15; i++ )   globalThis.__warm = fn ()   // Let V8 finish optimizing: compiled code also counts as heap
                        const values = [];
                        for ( let i = 0; i < 7; i++ ) {
                                gc (); gc (); await tick ()
                                const before = heap (), t0 = performance.now ();
                                const keep = fn ();
                                const t1 = performance.now (), after = heap ();
                                await tick ()
                                if ( !gcTimes.some ( t => t >= t0 && t <= t1 ) )   values.push ( ( after - before ) / 1048576 )
                                globalThis.__keep = keep
                            }
                        values.sort ( ( a, b ) => a - b )
                        result[ name ][ op ] = values.length ? values[ Math.floor ( values.length / 2 ) ] : null
                    }
            }
        return result
    } // allocation func.



/**
 * Retained heap (MiB) of one dt-object, created with `init` and with `load`.
 * One warm-up instance is created first, then the average of 4 kept instances is measured.
 * A single measurement was unstable: one-time effects of the first call made it too small.
 */
function memory () {
        const
              heap = () => { gc (); gc (); return process.memoryUsage ().heapUsed }
            , K = 4
            , result = {}
            , keep = []
            ;
        for ( const [ name, make ] of Object.entries ( datasets ) ) {
                const data = make (), model = dtbox.flat ( data );
                keep.push ( dtbox.init ( data ), dtbox.load ( model ) )   // Warm-up instances
                let before = heap ();
                for ( let i = 0; i < K; i++ )   keep.push ( dtbox.init ( data ) )
                const init = ( heap () - before ) / K / 1048576;
                before = heap ()
                for ( let i = 0; i < K; i++ )   keep.push ( dtbox.load ( model ) )
                const load = ( heap () - before ) / K / 1048576;
                result[ name ] = { 'init': init, 'load': load }
            }
        globalThis.__keep = keep   // Keep the dt-objects reachable until the end
        return result
    } // memory func.



if ( [ 'memory', 'allocation' ].includes ( mode ) && typeof gc !== 'function' ) {
        console.error ( `Mode '${mode}' needs: node --expose-gc benchmarks/run.mjs <module> ${mode}` )
        process.exit ( 1 )
    }
const modes = { speed, memory, allocation };
console.log ( JSON.stringify ( await modes[ mode ] () ) )


