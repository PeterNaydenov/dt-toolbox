'use strict'

import walkSettings from '../walkSettings.js'



/**
 * Deep-copy a value while preserving special JS types.
 * Plain objects and arrays are spread-copied (matching the old behaviour).
 * Date, RegExp, and other non-plain objects are returned by reference so
 * they round-trip intact — the previous `{...d}` silently dropped them to
 * `{}` because their own properties are non-enumerable.
 * NaN / Infinity / -Infinity are also returned as-is (was: coerced to null
 * somewhere down the pipeline).
 * @param {*} v - value to copy
 * @returns {*} deep copy of the value
 */
const deepCopy = ( v ) => {
            if ( v === null || v === undefined )   return v
            if ( typeof v !== 'object' )            return v
            if ( Array.isArray ( v ) )              return v.map ( deepCopy )
            if ( v instanceof Date )               return new Date ( v.getTime () )
            if ( v instanceof RegExp )              return new RegExp ( v.source, v.flags )
            // DOM nodes and functions are returned by reference (see Changelog 7.2.0)
            if ( typeof v === 'function' )          return v
            if ( v.nodeType )                       return v
            // plain object
            const out = {};
            for ( const k in v )   out[k] = deepCopy ( v[k] )
            return out
        };



// Sentinel for Date/RegExp encoding.
// dt-toolbox 7.4.7 - 7.5.1 encoded Date/RegExp as plain sentinel objects
// because older versions of the walk library collapsed them to `{}`.
// Since walk 6.1.0 they are treated as leaf values and are stored as-is in
// flatData, so no encoding is needed anymore. Decoding is kept in `toType`
// so dt-models exported by those versions still convert back correctly.
const SENTINEL_KEY    = '__dtSentinel__'
const SENTINEL_DATE   = 'date'
const SENTINEL_REGEXP = 'regexp'

const isSentinel = ( v, kind ) =>
        v !== null && typeof v === 'object' && v[SENTINEL_KEY] === kind

const decodeSentinel = ( v ) => {
        if ( isSentinel ( v, SENTINEL_DATE ) )   return new Date ( v.iso )
        if ( isSentinel ( v, SENTINEL_REGEXP ) )  return new RegExp ( v.source, v.flags )
        return v
    };

/**
 * Breadcrumbs of the parent: walk builds breadcrumbs as `parent + '/' + key`.
 * Before the fix, a RegExp was built from the key for every value. Keys with
 * special characters like `(`, `+`, `$` or `[` crashed or found a wrong parent,
 * and creating a RegExp per value was slow.
 * @param {string} breadcrumbs - breadcrumbs of the current value
 * @param {string} key - key of the current value
 * @returns {string} breadcrumbs of the parent
 */
const parentOf = ( breadcrumbs, key ) => breadcrumbs.slice ( 0, breadcrumbs.length - key.length - 1 );



function toFlat ( dependencies, d ) {   // Convert data to 'dt' model
        const
              { walk } = dependencies ()
            , dt = []
            , index = {}
            , dtDATA = 1   // Const: Flat data object in store record line;
            , dtEDGES = 3  // Const: Edges in store record line;
            ;

        function objCallbackFn ({ value, key, breadcrumbs }) {
                        const
                              isRoot = (breadcrumbs === 'root' ) && ( key === 'root' )
                            , isArray = value instanceof Array ? true : false
                            , dataType = isArray ? [] : {}
                            , objectName = key
                            , parentName = parentOf ( breadcrumbs, key )
                            , newObject = [ objectName, dataType, breadcrumbs, [] ]
                            ;

                        if ( !isRoot )   index[ parentName][dtEDGES].push ( breadcrumbs )
                        dt.push ( newObject )
                        index [ breadcrumbs ] = dt.at(-1)
                        return value
                } // objCallbackFn

        function keyCallbackFn ({ value, key, breadcrumbs }) {
                        index [ parentOf ( breadcrumbs, key ) ][dtDATA][key] = value
                        return value
                } // keyCallbackFn

        // Only the callbacks matter: they build the dt-lines. No result copy is needed (`copy:false`).
        walk ({
                              data : d
                            , settings       : walkSettings.toFlat
                            , keyCallback    : keyCallbackFn
                            , objectCallback : objCallbackFn
                        })
            return [ index, dt ]
    } // getFlat func.










function toType ( dt ) {
            let
                  result = {}
                , revDT = dt.reverse ()
                , extraSegments = []   // Top dt-lines outside 'root' (segments like 'extra', or unconnected drafted lines);
                , children = new Set ( dt.flatMap ( ([ , , , edges ]) => edges ) )   // Breadcrumbs that have a parent dt-line
                ;
            // Children come after their parents in a DT-model, so in reverse order
            // every child is built before the parent attaches it through `edges`.
            // Segments are built the same way as 'root'. Before the fix, nested
            // dt-lines of a segment (e.g. 'extra/y') were moved to the top level.
            revDT.forEach ( ([ name, d, breadcrumbs, edges ]) => {
                        const copy = deepCopy ( d );
                        result[breadcrumbs] = copy
                        edges.forEach ( edge => {
                                        if ( result[edge] ) {
                                                const name = edge.slice ( breadcrumbs.length + 1 );   // edge is `breadcrumbs + '/' + name`
                                                result[breadcrumbs][name] = result[edge]
                                            }
                                })
                        if ( breadcrumbs !== 'root' && !children.has ( breadcrumbs ) ) {
                                extraSegments.push ( { name, data: copy } )
                            }
                    })
            // Merge the segments into the root result. Each becomes a top-level key,
            // matching the shape the user would get if all the data were in a single nested object.
            const root = result['root'] || {}
            extraSegments.forEach ( ({ name, data }) => {
                        const existing = root[name]
                        if ( existing && typeof existing === 'object' && !Array.isArray(existing) && typeof data === 'object' && !Array.isArray(data) ) {
                                // Same name as an existing root property: merge.
                                root[name] = { ...existing, ...data }
                            }
                        else   root[name] = data
                    })
            // Decode any Date/RegExp sentinels back to their original types.
            return decodeSpecialTypesInResult ( root )
    } // toType func.

/**
 * Walk a model result and replace any Date/RegExp sentinel objects
 * with real Date/RegExp instances.
 * @param {*} v - value to walk (typically result['root'])
 * @returns {*} same shape with sentinels decoded
 */
const decodeSpecialTypesInResult = ( v ) => {
        if ( v === null || v === undefined )   return v
        if ( typeof v !== 'object' )            return v
        // Sentinel?
        const decoded = decodeSentinel ( v )
        if ( decoded !== v )                    return decoded
        if ( v instanceof Date || v instanceof RegExp || v.nodeType )   return v   // leaf values, keep as-is
        if ( Array.isArray ( v ) )              return v.map ( decodeSpecialTypesInResult )
        const out = {};
        for ( const k in v )   out[k] = decodeSpecialTypesInResult ( v[k] )
        return out
    };













export default { toFlat, toType }

