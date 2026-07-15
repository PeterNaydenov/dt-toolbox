'use strict'



function extractList ( dependencies, flatIO, indexFn ) {
return function extractList ( list, options ) {
            const
                      root     = indexFn ( 'root' )
                    , { main:{load}, INIT_DATA_TYPES } = dependencies ()
                    , asTypes = [ ...INIT_DATA_TYPES, 'dt-object' ]
                    ;
            let
                  error = false
                , errorMsg = ''
                ;

            if ( options ) {
                    if ( !options.as ) {
                            error = true
                            errorMsg = `Options should be an object and property "as" is required`
                        }
                    if ( !error && !asTypes.includes(options.as) ) {
                            error = true
                            errorMsg = `Invalid option "as" value: ${options.as}.`
                        }
                    if ( error )  throw new Error ( errorMsg )
                }

            // Helper: resolve a name (which can be a single key, a segment
            // name, or a 'breadcrumbs-style' path like 'c/d') against the
            // dt-object. Before the fix, this only checked root[1] directly,
            // so nested paths like 'c/d' returned null even when they exist.
            //
            // Strategy:
            //   1. Try flatIO.export(name) — handles segments (returns dt-lines)
            //      and returns [] for properties.
            //   2. Try the index function for the exact breadcrumbs.
            //   3. Walk the dt-model via index breadcrumbs to resolve the path.
            const resolveByIndex = ( name ) => {
                        if ( !name )   return undefined
                        const ix = indexFn ( name )
                        return ix ? ix[1] : undefined
                    };

            return list
                        .map ( name => {
                                            let lines = flatIO.export ( name );
                                            if ( lines.length === 0 ) {
                                                    // 1. Try direct property lookup on root flatData
                                                    if ( root && root[1] && Object.prototype.hasOwnProperty.call ( root[1], name ) ) {
                                                            return root[1][name]
                                                        }
                                                    // 2. Try the index function with the full path
                                                    const v = resolveByIndex ( name )
                                                    if ( v !== undefined )   return v
                                                    // 3. Walk the path manually across the dt-model
                                                    return walkPath ( name, indexFn )
                                                }
                                            else   return lines
                                        })
                        .map ( item => {
                                            if ( item == null            )   return null
                                            if ( !(item instanceof Array))   return item
                                            return load(item).model(() => options )
                                        })
}} // extractList func.

/**
 * Walk a breadcrumbs-style path (e.g. 'root/c/d') across the dt-model
 * and return the value at the end. Used by `extractList` to resolve
 * nested property paths that don't correspond to a single dt-line.
 *
 * The caller may pass the path with or without a leading 'root/' —
 * both forms are tried.
 * @param {string} name - breadcrumbs-style path
 * @param {function} indexFn - index function for looking up dt-lines
 * @returns {*} value at the path, or undefined if not found
 */
function walkPath ( name, indexFn ) {
        const candidates = name.startsWith ( 'root/' ) ? [ name ] : [ name, `root/${name}` ]
        for ( const fullPath of candidates ) {
                const segments = fullPath.split ( '/' )
                // Build up the breadcrumbs one segment at a time
                for ( let i = segments.length; i > 0; i-- ) {
                        const br = segments.slice ( 0, i ).join ( '/' )
                        const dtLine = indexFn ( br )
                        if ( dtLine ) {
                                // Found a parent dt-line. If the path ends here,
                                // return its data; otherwise look up the remaining
                                // keys as properties of the parent's data.
                                if ( i === segments.length )   return dtLine[1]
                                const tail = segments.slice ( i )
                                let cur = dtLine[1]
                                for ( const k of tail ) {
                                        if ( cur == null )   return undefined
                                        if ( Array.isArray ( cur ) ) {
                                                const idx = parseInt ( k, 10 )
                                                if ( isNaN ( idx ) )   return undefined
                                                cur = cur[idx]
                                            }
                                        else if ( typeof cur === 'object' ) {
                                                cur = cur[k]
                                            }
                                        else   return undefined
                                    }
                                return cur
                            }
                    }
            }
        return undefined
    }



export default extractList


