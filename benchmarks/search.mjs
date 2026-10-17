/**
 *  Search benchmark: the same data as a plain JS object and as a dt-object.
 *  The same tasks are solved three ways:
 *    - plain : hand-written JS that knows the data shape (the lower limit)
 *    - walk  : @peter.naydenov/walk 7 over the plain object, as a generic deep forEach
 *    - dt    : dt-toolbox store methods on a dt-object
 *  Each implementation's result is compared with the others before timing.
 *
 *  Usage:
 *    node benchmarks/search.mjs                        # sizes 2000,20000; 3 processes per size
 *    node benchmarks/search.mjs --sizes 1000,50000 --runs 5
 */



import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import dtbox from '../src/main.js'



const
      args = process.argv.slice ( 2 )
    , arg  = ( name, fallback ) => { const i = args.indexOf ( name ); return i >= 0 ? args[ i + 1 ] : fallback }
    , walk = dtbox.getWalk ()
    , WALK_SETTINGS = { copy:false, parentPath:false, detectCycles:false }   // The fastest settings that still give breadcrumbs
    , WALK_FAST     = { ...WALK_SETTINGS, breadcrumbs:false }                  // For callbacks that don't read breadcrumbs
    ;



// ---------- Data ----------

/** Deterministic records: user objects with nested profile, address, arrays and a variable number of orders. */
function makeData ( N ) {
        return {
                  meta  : { generated: '2026-10-16', version: 3 }
                , users : Array.from ( { length: N }, ( _, i ) => ({
                                  id      : i
                                , name    : 'user' + i
                                , active  : i % 3 !== 0
                                , profile : { age: i % 90, city: 'city' + ( i % 50 ), address: { zip: String ( 10000 + i ), geo: [ i % 180, i % 90 ] } }
                                , roles   : [ 'r' + ( i % 3 ), 'r' + ( i % 5 ) ]
                                , orders  : Array.from ( { length: i % 4 }, ( _, k ) => ({ id: i * 10 + k, total: ( i * 7 + k ) % 500, items: [ 'p' + k ] }) )
                            }))
            }
    } // makeData func.



// ---------- Tasks ----------

/**
 * Every task returns { name, note, impl: { label: fn } }.
 * `ctx` holds the plain object, the dt-object and the size.
 */
function tasks ( ctx ) {
        const
              { obj, dt, N } = ctx
            , k      = Math.floor ( N * 0.75 )             // Target record for point reads
            , mid    = Math.floor ( N * 0.5 )              // Target record for early exit
            , zipMid = String ( 10000 + mid )
            , dtq    = fn => { let r; dt.query ( store => { r = fn ( store ) } ); return r }   // Run scan methods, return own result
            ;

        return [
            {
                  name : 'Point read by path'
                , note : `users/${k}/profile/address/zip`
                , impl : {
                          'plain'    : () => obj.users[ k ].profile.address.zip
                        , 'walk'     : () => {
                                    const target = `root/users/${k}/profile/address/zip`;
                                    let found;
                                    walk ({
                                              data : obj
                                            , settings : WALK_SETTINGS
                                            , objectCallback : ({ value, breadcrumbs, IGNORE }) => target.startsWith ( breadcrumbs + '/' ) ? value : IGNORE ()   // Skip branches off the path
                                            , keyCallback : ({ value, breadcrumbs, FINISH }) => {
                                                        if ( breadcrumbs === target ) { found = value; return FINISH () }
                                                        return value
                                                    }
                                        })
                                    return found
                                }
                        , 'dt index' : () => dt.index ( `root/users/${k}/profile/address/zip` )[ 1 ]
                    }
            }
          , {
                  name : 'Collect a key anywhere'
                , note : `all 'city' values (${N})`
                , impl : {
                          'plain'        : () => obj.users.map ( u => u.profile.city )
                        , 'walk'         : () => {
                                    const r = [];
                                    walk ({ data: obj, settings: WALK_FAST, keyCallback: ({ key, value }) => { if ( key === 'city' ) r.push ( value ); return value } })
                                    return r
                                }
                        , 'walk pruned'  : () => {
                                    // Same knowledge as `find ( 'profile' )`: 'city' lives in 'profile'
                                    const r = [];
                                    walk ({
                                              data : obj
                                            , settings : WALK_FAST
                                            , objectCallback : ({ key, value, IGNORE }) => {
                                                        if ( key === 'profile' ) { r.push ( value.city ); return IGNORE () }
                                                        return value
                                                    }
                                        })
                                    return r
                                }
                        , 'dt look all'  : () => dtq ( store => {
                                    const r = [];
                                    store.look ( ({ key, value }) => { if ( key === 'city' ) r.push ( value ) } )
                                    return r
                                })
                        , 'dt find+look' : () => dtq ( store => {
                                    const r = [];
                                    store.find ( 'profile' ).look ( ({ key, value }) => { if ( key === 'city' ) r.push ( value ) } )
                                    return r
                                })
                    }
            }
          , {
                  name : 'Objects by name'
                , note : `zip of every 'address' object (${N})`
                , impl : {
                          'plain'        : () => obj.users.map ( u => u.profile.address.zip )
                        , 'walk'         : () => {
                                    const r = [];
                                    walk ({
                                              data : obj
                                            , settings : WALK_FAST
                                            , objectCallback : ({ key, value, IGNORE }) => {
                                                        if ( key === 'address' ) { r.push ( value.zip ); return IGNORE () }   // Collected: don't go deeper
                                                        return value
                                                    }
                                        })
                                    return r
                                }
                        , 'dt find+look' : () => dtq ( store => {
                                    const r = [];
                                    store.find ( 'address' ).look ( ({ key, value }) => { if ( key === 'zip' ) r.push ( value ) } )
                                    return r
                                })
                    }
            }
          , {
                  name : 'Filter records'
                , note : 'ids of active users with age >= 80'
                , impl : {
                          'plain'        : () => obj.users.filter ( u => u.active && u.profile.age >= 80 ).map ( u => u.id )
                        , 'walk'         : () => {
                                    const r = [];
                                    walk ({
                                              data : obj
                                            , settings : WALK_FAST
                                            , objectCallback : ({ value, IGNORE }) => {
                                                        if ( value.profile && 'active' in value ) {   // A user record: decide and skip its content
                                                                if ( value.active && value.profile.age >= 80 )   r.push ( value.id )
                                                                return IGNORE ()
                                                            }
                                                        return value
                                                    }
                                        })
                                    return r
                                }
                        , 'dt find+index' : () => dtq ( store => {
                                    // age is on the 'profile' line, active and id on the parent line: two steps
                                    const r = [];
                                    store.find ( 'profile' ).look ( ({ key, value, breadcrumbs }) => {
                                                if ( key !== 'age' || value < 80 )   return
                                                const [ , user ] = dt.index ( breadcrumbs.slice ( 0, breadcrumbs.lastIndexOf ( '/' ) ) );
                                                if ( user.active )   r.push ( user.id )
                                        })
                                    return r
                                })
                    }
            }
          , {
                  name : 'First match, early exit'
                , note : `path of zip '${zipMid}' (record in the middle)`
                , impl : {
                          'plain'        : () => {
                                    const i = obj.users.findIndex ( u => u.profile.address.zip === zipMid );
                                    return `root/users/${i}/profile/address/zip`
                                }
                        , 'walk'         : () => {
                                    let found;
                                    walk ({
                                              data : obj
                                            , settings : WALK_SETTINGS
                                            , keyCallback : ({ key, value, breadcrumbs, FINISH }) => {
                                                        if ( key === 'zip' && value === zipMid ) { found = breadcrumbs; return FINISH () }
                                                        return value
                                                    }
                                        })
                                    return found
                                }
                        , 'dt find+look' : () => dtq ( store => {
                                    let found;
                                    store.find ( 'address' ).look ( ({ key, value, breadcrumbs, finish }) => {
                                                if ( key === 'zip' && value === zipMid ) { found = breadcrumbs + '/zip'; return finish () }
                                        })
                                    return found
                                })
                        , 'dt look all'  : () => dtq ( store => {
                                    let found;
                                    store.look ( ({ key, value, breadcrumbs, finish }) => {
                                                if ( key === 'zip' && value === zipMid ) { found = breadcrumbs + '/zip'; return finish () }
                                        })
                                    return found
                                })
                    }
            }
          , {
                  name : 'Extract a subtree'
                , note : `deep copy of users/${k}`
                , impl : {
                          'plain'      : () => structuredClone ( obj.users[ k ] )
                        , 'walk'       : () => walk ({ data: obj.users[ k ] })
                        , 'dt from+set': () => dt.model ( store => {
                                    // No direct method: re-root the lines of `from()` as drafted lines
                                    const base = `root/users/${k}`;
                                    store.from ( base ).look ( ({ breadcrumbs, flatData, next }) => {
                                                store.set ( 'root' + breadcrumbs.slice ( base.length ), flatData )
                                                return next ()
                                        })
                                    return { as: 'std' }
                                })
                    }
            }
          , {
                  name : 'Aggregate'
                , note : 'sum of all order totals'
                , impl : {
                          'plain'          : () => {
                                    let s = 0;
                                    for ( const u of obj.users )   for ( const o of u.orders )   s += o.total
                                    return s
                                }
                        , 'walk'           : () => {
                                    let s = 0;
                                    walk ({ data: obj, settings: WALK_FAST, keyCallback: ({ key, value }) => { if ( key === 'total' ) s += value; return value } })
                                    return s
                                }
                        , 'walk pruned'    : () => {
                                    // Same knowledge as the custom filter: totals live in 'orders' items
                                    let s = 0;
                                    walk ({
                                              data : obj
                                            , settings : WALK_FAST
                                            , objectCallback : ({ key, value, IGNORE }) => {
                                                        if ( key === 'profile' || key === 'roles' )   return IGNORE ()
                                                        if ( key === 'orders' ) { for ( const o of value ) s += o.total; return IGNORE () }
                                                        return value
                                                    }
                                        })
                                    return s
                                }
                        , 'dt look all'    : () => dtq ( store => {
                                    let s = 0;
                                    store.look ( ({ key, value }) => { if ( key === 'total' ) s += value } )
                                    return s
                                })
                        , 'dt custom filter': () => dtq ( store => {
                                    let s = 0;
                                    store.use ( 'orderItems' ).look ( ({ key, value }) => { if ( key === 'total' ) s += value } )
                                    return s
                                })
                    }
            }
          , {
                  name : 'Full scan'
                , note : 'count every primitive value'
                , impl : {
                          'plain'       : () => {
                                    let c = 0;
                                    const visit = v => {
                                                if ( v === null || typeof v !== 'object' ) { c++; return }
                                                if ( Array.isArray ( v ) )   for ( const x of v ) visit ( x )
                                                else                         for ( const key in v ) visit ( v[ key ] )
                                        };
                                    visit ( obj )
                                    return c
                                }
                        , 'walk'        : () => {
                                    let c = 0;
                                    walk ({ data: obj, settings: WALK_FAST, keyCallback: ({ value }) => { c++; return value } })
                                    return c
                                }
                        , 'dt look all' : () => dtq ( store => {
                                    let c = 0;
                                    store.look ( ({ empty }) => { if ( !empty ) c++ } )
                                    return c
                                })
                    }
            }
        ]
    } // tasks func.



// ---------- Measuring (child process) ----------

/** Median time in ms of `runs` calls, after warm-up calls. */
function time ( fn, runs = 15, warm = 3 ) {
        for ( let i = 0; i < warm; i++ )   globalThis.__sink = fn ()
        const t = [];
        for ( let i = 0; i < runs; i++ ) {
                const start = performance.now ();
                globalThis.__sink = fn ()
                t.push ( performance.now () - start )
            }
        t.sort ( ( a, b ) => a - b )
        return t[ Math.floor ( t.length / 2 ) ]
    } // time func.



function retained ( make ) {
        const heap = () => { gc (); gc (); return process.memoryUsage ().heapUsed };
        const before = heap ();
        globalThis.__keep = make ()
        const r = ( heap () - before ) / 1048576;
        globalThis.__keep = null
        return r
    } // retained func.



function child ( N, rotate ) {
        const
              obj      = makeData ( N )
            , stdText  = JSON.stringify ( obj )
            , dtText   = JSON.stringify ( dtbox.flat ( obj ) )
            , dt       = dtbox.init ( obj )
            , result   = { prepare: {}, size: {}, memory: {}, tasks: {} }
            , rot      = list => list.map ( ( _, i ) => list[ ( i + rotate ) % list.length ] )   // Different order in each process
            ;

        // Preparation
        const filterFn = ({ breadcrumbs }) => /\/orders\/\d+$/.test ( breadcrumbs );
        const prepare = {
                  'JSON.parse (std text)'                   : () => JSON.parse ( stdText )
                , 'dtbox.init (object in memory)'           : () => dtbox.init ( obj )
                , 'JSON.parse + dtbox.init'                 : () => dtbox.init ( JSON.parse ( stdText ) )
                , 'JSON.parse (DT-model text) + dtbox.load' : () => dtbox.load ( JSON.parse ( dtText ) )
            };
        for ( const [ label, fn ] of rot ( Object.entries ( prepare ) ) )   result.prepare[ label ] = time ( fn, 9, 2 )
        // A filter name can be set once per dt-object: time it on fresh dt-objects (init is outside the timer)
        {
                const t = [];
                for ( let i = 0; i < 9; i++ ) {
                        const d = dtbox.init ( obj ), start = performance.now ();
                        d.setupFilter ( 'orderItems', filterFn )
                        t.push ( performance.now () - start )
                    }
                t.sort ( ( a, b ) => a - b )
                result.prepare[ "dt.setupFilter ('orderItems'), once" ] = t[ 4 ]
            }
        dt.setupFilter ( 'orderItems', filterFn )

        result.size = { 'std JSON': stdText.length / 1048576, 'DT-model JSON': dtText.length / 1048576, 'dt-lines': dt.export ().length }
        if ( typeof gc === 'function' ) {
                result.memory[ 'plain object' ] = retained ( () => JSON.parse ( stdText ) )
                result.memory[ 'dt-object' ]    = retained ( () => dtbox.init ( JSON.parse ( stdText ) ) )
                result.memory[ "dt-object + 'orderItems' filter" ] = retained ( () => { const d = dtbox.init ( JSON.parse ( stdText ) ); d.setupFilter ( 'orderItems', filterFn ); return d } )
            }

        // Search tasks: check correctness first, then time
        for ( const task of tasks ({ obj, dt, N }) ) {
                const
                      impls    = Object.entries ( task.impl )
                    , expected = JSON.stringify ( impls[ 0 ][ 1 ] () )
                    ;
                for ( const [ label, fn ] of impls ) {
                        const got = JSON.stringify ( fn () );
                        if ( got !== expected )   throw new Error ( `${task.name} / ${label}: result differs.\n  expected ${expected.slice ( 0, 200 )}\n  got      ${got.slice ( 0, 200 )}` )
                    }
                result.tasks[ task.name ] = { note: task.note, times: {} }
                for ( const [ label, fn ] of rot ( impls ) )   result.tasks[ task.name ].times[ label ] = time ( fn )
            }
        return result
    } // child func.



// ---------- Report (main process) ----------

const median = list => { const s = [ ...list ].sort ( ( a, b ) => a - b ); return s[ Math.floor ( s.length / 2 ) ] };
const ms  = v => v < 0.01 ? `${( v * 1000 ).toFixed ( 1 )} µs` : v < 10 ? `${v.toFixed ( 2 )} ms` : `${v.toFixed ( 1 )} ms`;
const mib = v => `${v.toFixed ( 1 )} MiB`;



function main () {
        const
              sizes = arg ( '--sizes', '2000,20000' ).split ( ',' ).map ( Number )
            , runs  = Number ( arg ( '--runs', 3 ) )
            , self  = fileURLToPath ( import.meta.url )
            , out   = []
            ;

        out.push ( `Node ${process.version}, ${os.cpus ()[ 0 ].model}, ${os.platform ()} ${os.arch ()}. Median of ${runs} processes; in each process the median of 15 calls after 3 warm-up calls.\n` )

        for ( const N of sizes ) {
                const samples = [];
                for ( let r = 0; r < runs; r++ ) {
                        console.error ( `size ${N}, process ${r + 1}/${runs} ...` )
                        const json = execFileSync ( process.execPath, [ '--expose-gc', '--stack-size=8000', self, '--child', String ( N ), String ( r ) ], { encoding: 'utf8', maxBuffer: 64 * 1048576 } );
                        samples.push ( JSON.parse ( json ) )
                    }
                const
                      pick = fn => median ( samples.map ( fn ) )
                    , first = samples[ 0 ]
                    , initCost = pick ( s => s.prepare[ 'JSON.parse + dtbox.init' ] ) - pick ( s => s.prepare[ 'JSON.parse (std text)' ] )
                    ;

                out.push ( `\n## ${N.toLocaleString ( 'en' )} users (${first.size[ 'dt-lines' ].toLocaleString ( 'en' )} dt-lines)\n` )

                out.push ( '### Preparation\n' )
                out.push ( '| Step | Time |' )
                out.push ( '|---|---:|' )
                for ( const label of Object.keys ( first.prepare ) )   out.push ( `| ${label} | ${ms ( pick ( s => s.prepare[ label ] ) )} |` )

                out.push ( '\n| Size | Value |' )
                out.push ( '|---|---:|' )
                out.push ( `| std JSON text | ${mib ( first.size[ 'std JSON' ] )} |` )
                out.push ( `| DT-model JSON text | ${mib ( first.size[ 'DT-model JSON' ] )} |` )
                for ( const label of Object.keys ( first.memory ) )   out.push ( `| heap kept by ${label} | ${mib ( pick ( s => s.memory[ label ] ) )} |` )

                out.push ( '\n### Search\n' )
                out.push ( `Break-even: how many queries the dt version needs before the conversion (JSON.parse + dtbox.init minus JSON.parse = ${ms ( initCost )}) is paid back by faster queries, compared with the fastest walk version of the same task. \`never\` means the dt query itself is not faster.\n` )
                out.push ( '| Task | Implementation | Time | vs plain | vs best walk | Break-even vs best walk |' )
                out.push ( '|---|---|---:|---:|---:|---:|' )
                for ( const [ name, { note } ] of Object.entries ( first.tasks ) ) {
                        const labels = Object.keys ( first.tasks[ name ].times );
                        const t = Object.fromEntries ( labels.map ( l => [ l, pick ( s => s.tasks[ name ].times[ l ] ) ] ) );
                        const bestWalk = Math.min ( ...labels.filter ( l => l.startsWith ( 'walk' ) ).map ( l => t[ l ] ) );
                        t[ 'best walk' ] = bestWalk
                        labels.forEach ( ( l, i ) => {
                                    const
                                          rel  = base => {
                                                    if ( l === base )   return ''
                                                    const r = t[ l ] / t[ base ];
                                                    return r >= 1 ? `${r.toFixed ( 1 )}× slower` : `${( 1 / r ).toFixed ( 1 )}× faster`
                                                }
                                        , gain = bestWalk - t[ l ]
                                        , even = !l.startsWith ( 'dt' ) ? '' : gain <= 0 ? 'never' : String ( Math.ceil ( initCost / gain ) )
                                        ;
                                    out.push ( `| ${i === 0 ? `${name}<br><sub>${note}</sub>` : ''} | ${l} | ${ms ( t[ l ] )} | ${rel ( 'plain' )} | ${l.startsWith ( 'walk' ) ? '' : rel ( 'best walk' )} | ${even} |` )
                            })
                    }
            }
        console.log ( out.join ( '\n' ) )
    } // main func.



if ( args[ 0 ] === '--child' )   console.log ( JSON.stringify ( child ( Number ( args[ 1 ] ), Number ( args[ 2 ] ) ) ) )
else                             main ()
