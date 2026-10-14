/**
 *  Compare the current source with a published dt-toolbox version.
 *  Prints markdown tables (speed and memory) ready to paste into benchmarks/README.md.
 *
 *  Usage:
 *    node benchmarks/compare.mjs                          # baseline: dt-toolbox@7.5.1 from npm
 *    node benchmarks/compare.mjs --baseline-version 7.4.9
 *    node benchmarks/compare.mjs --baseline path/to/dtbox.esm.mjs
 *    node benchmarks/compare.mjs --runs 7                 # processes per version (default 5)
 *    node benchmarks/compare.mjs --label '8.0.0'          # column title for the current source
 */



import { execFileSync } from 'node:child_process'
import fs   from 'node:fs'
import os   from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'



const
      here = path.dirname ( fileURLToPath ( import.meta.url ) )
    , args = process.argv.slice ( 2 )
    , arg  = ( name, fallback ) => { const i = args.indexOf ( name ); return i >= 0 ? args[ i + 1 ] : fallback }
    , runs = Number ( arg ( '--runs', 5 ) )
    , current = path.resolve ( here, '../src/main.js' )
    ;



/** Install a published version into a temp folder (with its own dependencies) and return its ESM entry. */
function installPublished ( version ) {
        const dir = path.join ( os.tmpdir (), `dt-toolbox-bench-${version}` );
        const entry = path.join ( dir, 'node_modules', 'dt-toolbox', 'dist', 'dtbox.esm.mjs' );
        if ( !fs.existsSync ( entry ) ) {
                fs.mkdirSync ( dir, { recursive: true } )
                fs.writeFileSync ( path.join ( dir, 'package.json' ), '{ "private": true }' )
                console.error ( `Installing dt-toolbox@${version} into ${dir} ...` )
                execFileSync ( 'npm', [ 'install', '--silent', '--no-audit', '--no-fund', `dt-toolbox@${version}` ], { cwd: dir, stdio: 'inherit' } )
            }
        return entry
    } // installPublished func.



function walkVersion ( entry ) {
        // Resolve the walk package next to the dt-toolbox entry it belongs to
        let dir = path.dirname ( entry );
        while ( dir !== path.dirname ( dir ) ) {
                const pkg = path.join ( dir, 'node_modules', '@peter.naydenov', 'walk', 'package.json' );
                if ( fs.existsSync ( pkg ) )   return JSON.parse ( fs.readFileSync ( pkg, 'utf8' ) ).version
                dir = path.dirname ( dir )
            }
        return '?'
    } // walkVersion func.



const
      baselineVersion = arg ( '--baseline-version', '7.5.1' )
    , baseline = arg ( '--baseline' ) ? path.resolve ( arg ( '--baseline' ) ) : installPublished ( baselineVersion )
    , labels   = {
                    baseline : arg ( '--baseline' ) ? 'baseline' : `${baselineVersion} (walk ${walkVersion ( baseline )})`
                  , current  : arg ( '--label', `current source (walk ${walkVersion ( current )})` )
              }
    ;



function run ( entry, mode ) {
        const flags = { speed: [], memory: [ '--expose-gc' ], allocation: [ '--expose-gc', '--max-semi-space-size=256' ] }[ mode ];
        const out = execFileSync ( process.execPath, [ ...flags, path.join ( here, 'run.mjs' ), entry, mode ], { encoding: 'utf8', maxBuffer: 1 << 26 } );
        return JSON.parse ( out )
    } // run func.



/** Median of each value across the samples. Versions alternate so machine load affects both equally. */
function measure ( mode ) {
        const samples = { baseline: [], current: [] };
        for ( let i = 0; i < runs; i++ ) {
                console.error ( `${mode} run ${i + 1}/${runs}` )
                samples.baseline.push ( run ( baseline, mode ) )
                samples.current.push ( run ( current, mode ) )
            }
        const median = list => { const s = list.filter ( x => x != null ).sort ( ( a, b ) => a - b ); return s.length ? s[ Math.floor ( s.length / 2 ) ] : null };
        const result = {};
        for ( const key of [ 'baseline', 'current' ] ) {
                result[ key ] = {}
                for ( const [ data, ops ] of Object.entries ( samples[ key ][ 0 ] ) ) {
                        result[ key ][ data ] = {}
                        for ( const op of Object.keys ( ops ) ) {
                                result[ key ][ data ][ op ] = median ( samples[ key ].map ( s => s[ data ][ op ] ) )
                            }
                    }
            }
        return result
    } // measure func.



const
      change = ( b, c ) => { const p = Math.round ( ( c / b - 1 ) * 100 ); return p === 0 ? '±0%' : ( p > 0 ? `+${p}%` : `${p}%` ) }
    , table  = ( result, unit, digits ) => {
                    const rows = [ `| Data | Operation | ${labels.baseline} | ${labels.current} | Change |`, '|---|---|---:|---:|---:|' ];
                    for ( const [ data, ops ] of Object.entries ( result.baseline ) ) {
                            for ( const [ op, b ] of Object.entries ( ops ) ) {
                                    const c = result.current[ data ][ op ];
                                    const v = x => x == null ? 'n/a' : `${x.toFixed ( digits )} ${unit}`;   // n/a: every sample had a GC inside
                                    rows.push ( `| ${data} | ${op} | ${v ( b )} | ${v ( c )} | **${b == null || c == null ? 'n/a' : change ( b, c )}** |` )
                                }
                        }
                    return rows.join ( '\n' )
                }
    ;

const speed      = measure ( 'speed' );
const memory     = measure ( 'memory' );
const allocation = measure ( 'allocation' );

console.log ( `Node ${process.version}, ${os.cpus ()[ 0 ].model}, ${Math.round ( os.totalmem () / 1073741824 )} GiB RAM, ${os.platform ()} ${os.arch ()}. Median of ${runs} processes per version.\n` )
console.log ( '### Speed (median time per call, lower is better)\n' )
console.log ( table ( speed, 'ms', 2 ) )
console.log ( '\n### Memory (heap retained by one dt-object, lower is better)\n' )
console.log ( table ( memory, 'MiB', 1 ) )
console.log ( '\n### Memory allocated per call (temporary + retained, lower is better)\n' )
console.log ( table ( allocation, 'MiB', 1 ) )


