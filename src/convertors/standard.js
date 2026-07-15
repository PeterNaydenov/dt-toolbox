'use strict'



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



// Sentinel for Date/RegExp encoding (see toFlat below).
// The walk library treats Date/RegExp as plain objects and copies them to
// empty `{}` (because their own properties are non-enumerable). To preserve
// them across the walk, we encode them as plain sentinel objects BEFORE
// walking and decode them back AFTER.
// The sentinel is a plain object with a known key shape so `toType` (and
// any future code that walks the dt-model) can decode it without needing
// a side-channel store.
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

const encodeSpecialTypes = ( v ) => {
        if ( v === null || v === undefined )   return v
        if ( typeof v !== 'object' )            return v
        if ( Array.isArray ( v ) )              return v.map ( encodeSpecialTypes )
        if ( v instanceof Date ) {
                return { [SENTINEL_KEY]: SENTINEL_DATE, iso: v.toISOString () }
            }
        if ( v instanceof RegExp ) {
                return { [SENTINEL_KEY]: SENTINEL_REGEXP, source: v.source, flags: v.flags }
            }
        if ( typeof v === 'function' || v.nodeType )   return v  // pass through
        const out = {};
        for ( const k in v )   out[k] = encodeSpecialTypes ( v[k] )
        return out
    };



function toFlat ( dependencies, d ) {   // Convert data to 'dt' model
        const
              { walk } = dependencies ()
            , dt = []
            , index = {}
            , dtDATA = 1   // Const: Flat data object in store record line;
            , dtEDGES = 3  // Const: Edges in store record line;
            ;

        // Encode Date/RegExp as plain sentinels so they survive the walk
        // (the walk library collapses them to `{}` otherwise).
        const encodedInput = encodeSpecialTypes ( d );

        function objCallbackFn ({ value, key, breadcrumbs }) {
                        const
                              isRoot = (breadcrumbs === 'root' ) && ( key === 'root' )
                            , isArray = value instanceof Array ? true : false
                            , dataType = isArray ? [] : {}
                            , objectName = key
                            , search = new RegExp (  `\/${key}$` )
                            , parentName = breadcrumbs.replace ( search, '' )
                            , newObject = [ objectName, dataType, breadcrumbs, [] ]
                            ;

                        if ( !isRoot )   index[ parentName][dtEDGES].push ( breadcrumbs )
                        dt.push ( newObject )
                        index [ breadcrumbs ] = dt.at(-1)
                        return value
                } // objCallbackFn

        function keyCallbackFn ({ value, key, breadcrumbs }) {
                        const
                              search = new RegExp (  `\/${key}$` )
                            , parentName = breadcrumbs.replace ( search, '' )
                            ;
                        index [parentName][dtDATA][key] = value
                        return value
                } // keyCallbackFn

        const copy = walk ({
                              data : encodedInput
                            , keyCallback    : keyCallbackFn
                            , objectCallback : objCallbackFn
                        })
            return [ { root:copy }, index, dt ]
    } // getFlat func.










function toType ( dt ) {
            let
                  result = {}
                , revDT = dt.reverse ()
                , extraSegments = []   // dt-lines outside the root hierarchy;
                ;
            revDT.forEach ( ([ name, d, breadcrumbs, edges ]) => {
                        const copy = deepCopy ( d );

                        // A dt-line is "extra" if its breadcrumbs don't start
                        // with 'root/' (i.e. it's a top-level segment like 'extra1').
                        if ( breadcrumbs !== 'root' && !breadcrumbs.startsWith ( 'root/' ) ) {
                                extraSegments.push ( { name, breadcrumbs, data: copy } )
                                return
                            }
                        result[breadcrumbs] = copy
                        edges.forEach ( edge => {
                                        if ( result[edge] ) {
                                                const name = edge.replace (`${breadcrumbs}/`, '' );
                                                result[breadcrumbs][name] = result[edge]
                                            }
                                })
                    })
            // Merge any extra segments into the root result. Each becomes
            // a top-level key, matching the same shape the user would get
            // if all the data were in a single nested object.
            const root = result['root'] || {}
            extraSegments.forEach ( ({ name, breadcrumbs, data }) => {
                        const existing = root[name]
                        if ( existing && typeof existing === 'object' && !Array.isArray(existing) && typeof data === 'object' && !Array.isArray(data) ) {
                                // Same name as an existing root property: merge.
                                root[name] = { ...existing, ...data }
                            }
                        else {
                                // Use segment name; if name collides with a key on
                                // 'breadcrumbs' path, store under breadcrumbs key.
                                root[ name === breadcrumbs ? name : name ] = data
                            }
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
        if ( Array.isArray ( v ) )              return v.map ( decodeSpecialTypesInResult )
        const out = {};
        for ( const k in v )   out[k] = decodeSpecialTypesInResult ( v[k] )
        return out
    };













export default { toFlat, toType }

