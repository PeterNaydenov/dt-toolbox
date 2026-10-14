'use strict'



import walk      from '@peter.naydenov/walk'    // Docs: https://github.com/PeterNaydenov/walk#readme
import walkSettings from './walkSettings.js'
import copyDtModel  from './copyDtModel.js'

import flatObject from './flatObject/index.js'     // Flat data api.
import flatData   from './flatData/index.js'       // Query data api. Used in model functions 
import convert   from './convertors/index.js'    // Convertors
import draft     from './draft/index.js'         // Build a dt-model api



const INIT_DATA_TYPES = [
                  'std', 'standard'
                , 'tuple', 'tuples'
                , 'breadcrumb', 'breadcrumbs'
                , 'file', 'files'
                , 'midFlat', 'midflat'
                , 'flat', 'dt-model'
            ]
    ;

/**
 * Values that walk copies by reference (leaves). They can't create a cycle that walk follows.
 * @param {*} v - value to check
 * @returns {boolean} true if walk descends into the value
 */
const isContainer = v => v !== null && typeof v === 'object' && !v.nodeType
        && !( v instanceof Date || v instanceof RegExp || v instanceof Map || v instanceof Set
              || v instanceof WeakMap || v instanceof WeakSet || v instanceof ArrayBuffer
              || v instanceof DataView || ArrayBuffer.isView ( v ) );

/**
 * Detect circular references in data before it gets walked.
 * Only objects on the current path count, so shared references on separate
 * branches (e.g. `{ a: shared, b: shared }`) are valid data. Before the fix,
 * any repeated object was reported as circular.
 * Iterative, so very deep data can't overflow the call stack.
 * @param {*} data - data to scan
 * @returns {boolean} true if a cycle is detected
 */
const hasCircularRef = data => {
        if ( !isContainer ( data ) )   return false
        const
              onPath = new Set ([ data ])
            , stack  = [ { obj: data, keys: Object.keys ( data ), i: 0 } ]
            ;
        while ( stack.length ) {
                const top = stack[ stack.length - 1 ];
                if ( top.i >= top.keys.length ) {   // All children checked: leave this object
                        onPath.delete ( top.obj )
                        stack.pop ()
                        continue
                    }
                const v = top.obj[ top.keys[ top.i++ ] ];
                if ( !isContainer ( v ) )   continue
                if ( onPath.has ( v ) )     return true
                onPath.add ( v )
                stack.push ({ obj: v, keys: Object.keys ( v ), i: 0 })
            }
        return false
    };

/**
 * Throw a clear error for circular data. dt-toolbox can't represent cycles,
 * and walk's own cycle detection is switched off (see walkSettings.js).
 * @param {*} data - data to check
 */
const assertNoCircularRef = data => {
        if ( hasCircularRef ( data ) ) {
                throw new Error ( 'Circular reference detected in data. dt-toolbox cannot initialise a self-referencing object.' )
            }
    };

/**
 * Create a dt-object from a DT-model.
 * Before the fix, the dt-object kept the caller's arrays as its data, so changing
 * the DT-model after `load` also changed the dt-object.
 * @param {Array} inData - DT-model
 * @param {boolean} shared - `true` when the DT-model comes from the user and must be copied.
 *                           `false` when dt-toolbox just built it (query/model results).
 * @returns {DTObject} - dt-object
 */
const loadDtModel = ( inData, shared ) => {
        const
              lines = shared ? copyDtModel ( inData ) : inData
            , index = {}
            ;
        lines.forEach ( line => {
                                const [ , ,breadcrumbs ] = line;
                                index[breadcrumbs] = line
                        })
        return flatObject ( mainLib.dependencies, [ index, lines ] )
    };

/**
 * Convert data from the given data-model to a DT-model.
 * Before the fix, `flat` and `convert` ignored `options.model` and
 * always treated the input as 'std'.
 * @param {string} model - data-model of the source data
 * @param {(Array|Object)} inData - data source
 * @returns {Array} - DT-model
 */
const toDtModel = ( model, inData ) => {
        if ( ['flat', 'dt-model'].includes ( model ) )   return copyDtModel ( inData )
        assertNoCircularRef ( inData )
        const [ , dt ] = convert.from ( model ).toFlat ( mainLib.dependencies, inData );
        return dt
    };



/**
* @typedef {(number|string|boolean)} Primitives
* @typedef {('std'|'tuples'|'breadcrumbs'|'files'|'midFlat'|'flat'|'dt-model')} DtmodelNames
* @typedef {(filterName:string,fn:function)=>void} setupFilterFn
* @typedef {(segmentName:string, segment:DTObject)=>void} insertSegmentFn
* @typedef {(request:Array<string>,options:{as:DtmodelNames}=) => Array<RequestedModel>} extractListFn;
* @typedef {(fn:queryFunction, ...args)=>DTObject} QueryFn
* @typedef {(breadcrumbs:string) => dtLine } IndexFn
*
*
*
* @typedef {Object} DTObject
* @property {insertSegmentFn} insertSegment - Extends available data with new data segment;
* @property {(segmentName:string)=>Dtmodel} export - Returns a dt-model of the data;
* @property {Function} copy - Creates deep copy of original data segment;
* @property {Function} model - Arrange data according specific data-model. Model should come as a function;
* @property {QueryFn} query - Request, and evaluate data. Returns a new flat object;
* @property {setupFilterFn} setupFilter - Functions should filter content according some criteria. Generated indexes will help for data search in;
* @property {Function} listSegments - Returns list of segments in flat data;
* @property {IndexFn} index - Returns dt-line by breadcrumbs;
* @property {extractListFn} extractList - Extracts list of data segments;
*
*
*
*
*
* @typedef {{0:string,1:(Array<Primitives>|Object<string,Primitives>),2:string,3:string[]}} Dtmodel - dt-model
* @param Dtmodel[]0 - name of the dt-line;
* @param Dtmodel[]1 - flat data;
* @param Dtmodel[]2 - breadcrumbs of the dt-line;
* @param Dtmodel[]3 - children breadcrumbs(edges);
*
*
*
* @typedef {Object} Initoptions
* @description dtbox.init options
* @property {string} [model='std'] model - data model according library's data models.(Look at the documentation)
*/



const mainLib = {

    dependencies () {
                    return {
                              walk
                            , flatData
                            , convert
                            , INIT_DATA_TYPES
                            , main : { load : d => loadDtModel ( d, false ) }   // Internal: query/model results are new, acyclic and not shared
                            , assertNoCircularRef
                            , copyDtModel
                            , isDTO : d  => typeof d.insertSegment  === 'function'
                            , isDTM : d => {
                                                if ( !(d    instanceof Array))   return false
                                                if ( !(d[0] instanceof Array))   return false
                                                if ( d[0].length !== 4       )   return false
                                                if ( d[0][0] !== 'root'      )   return false
                                                return true
                                        }
                            , draft
                        }
            },   // dependencies func.



/**
 * @function init
 * @description Create a dt-object from data source
 * @param {(Array|Object)} inData - data source
 * @param {Object} options - options {}
 * @param {('std'|'tuples'|'breadcrumbs'|'files'|'midFlat'|'flat'|'dt-model')} options.model - model of the data source
 * @returns {DTObject} - dt-object
 */
    init ( inData, options={} ) {
                    let
                          { model = 'std' } = options || {}   // Defaults also apply when a value is explicitly `undefined`
                        , dependencies = mainLib.dependencies
                        ;
                    if ( !INIT_DATA_TYPES.includes(model) ) {
                            // Since v.8.0.0 throws like `flat` and `convert` (was: console.error + return null)
                            throw new Error ( `Can't understand your data-model: ${model}. Supported: ${INIT_DATA_TYPES.join(', ')}` )
                        }
                    // Primitive inputs (number, string, boolean, null, undefined) are
                    // wrapped in { value: <primitive> } so the data is preserved
                    // and round-trippable. Before the fix, primitives silently
                    // produced empty dt-objects and the value was lost.
                    let actualData = inData
                    if ( inData === null || inData === undefined || typeof inData !== 'object' ) {
                            actualData = { value: inData }
                        }
                    // Before the fix, 'flat' and 'dt-model' wrapped an already created dt-object
                    // again and threw "d is not iterable".
                    if ( ['flat', 'dt-model'].includes ( model ) )   return loadDtModel ( actualData, true )
                    assertNoCircularRef ( actualData )
                    const d = convert.from ( model ).toFlat ( dependencies, actualData );
                    return flatObject ( dependencies, d )
            }, // init func.

/**
 * @function load
 * @description Load data from dt-model
 * @param {{0:string,1:(Array<Primitives>|Object<string,Primitives>),2:string,3:string[]}} inData - dt-model:
 * @param inData[]0 - name of the dt-line;
 * @param inData[]1 - flat data;
 * @param inData[]2 - breadcrumbs of the dt-line;
 * @param inData[]3 - children breadcrumbs(edges);
 * @returns {DTObject} - dt-object
 */
    load ( inData ) {
                return loadDtModel ( inData, true )
            }, // load func.



/**
 * 
 * @function flating
 * @description Create a dt-model from data source
 * @param {(Array|Object)} inData - data source. Object or array.
 * @param {Object} options - options.
 * @param {('std'|'tuples'|'breadcrumbs'|'files'|'midFlat'|'flat'|'dt-model')} options.model - model of the data source
 * @returns {Dtmodel[]} - dt-model
 */
     flating ( inData, options={} ) {
                let
                       { model = 'std' } = options || {}   // Defaults also apply when a value is explicitly `undefined`
                    ;
                    if ( !INIT_DATA_TYPES.includes(model) ) {
                            throw new Error ( `Can't understand your data-model: ${model}. Supported: ${INIT_DATA_TYPES.join(', ')}` )
                        }
                    // Reject non-object input with a clear error.
                    // Before the fix, flat(null)/flat(undefined)/flat(42) silently
                    // returned [].
                    if ( inData === null || inData === undefined || typeof inData !== 'object' ) {
                            throw new Error ( `flat(data, options) requires an object or array. Got: ${inData === null ? 'null' : typeof inData}${inData === null ? '' : ' (' + inData + ')'}` )
                        }
                    return toDtModel ( model, inData )
            }, // flating func.

/**
 * @function converting
 * @description Convert data from one model to another
 * @param {Array|Object} inData - data source
 * @param {Object} options
 * @param {string} options.model - model of the data source
 * @param {string} options.as - model to be converted to
 * @returns {Array|Object} - converted data
 */
     converting ( inData, options={} ) {
                let
                       { model = 'std', as = 'std' } = options || {}   // Defaults also apply when a value is explicitly `undefined`
                    ;
                    if ( !INIT_DATA_TYPES.includes(model) ) {
                            throw new Error ( `Can't understand source data-model: ${model}. Supported: ${INIT_DATA_TYPES.join(', ')}` )
                        }
                    if ( !INIT_DATA_TYPES.includes(as) ) {
                            throw new Error ( `Can't understand target data-model: ${as}. Supported: ${INIT_DATA_TYPES.join(', ')}` )
                        }
                    if ( inData === null || inData === undefined || typeof inData !== 'object' ) {
                            throw new Error ( `convert(data, options) requires an object or array. Got: ${inData === null ? 'null' : typeof inData}` )
                        }
                    const dt = toDtModel ( model, inData );
                    return convert.to ( as, mainLib.dependencies, dt )
            }, // flating func.



/**
 * @function getWalk
 * @description Extract the 'walk' (@peter.naydenov/walk) dependency from dt-toolbox library
 * @returns {Function} - the 'walk' function
 */
    getWalk : () => walk

} // mainLib



export default mainLib


