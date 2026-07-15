'use strict'



import walk      from '@peter.naydenov/walk'    // Docs: https://github.com/PeterNaydenov/walk#readme

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
 * Detect circular references in data before it gets walked.
 * Without this, `init()` enters infinite recursion and crashes Node
 * with "JavaScript heap out of memory".
 * @param {*} data - data to scan
 * @param {WeakSet} [seen] - internal set of already-visited objects
 * @returns {boolean} true if a cycle is detected
 */
const hasCircularRef = ( data, seen = new WeakSet() ) => {
        if ( data === null || typeof data !== 'object' )   return false
        if ( seen.has ( data ) )                            return true
        seen.add ( data )
        if ( Array.isArray ( data ) ) {
                for ( const v of data ) {
                        if ( hasCircularRef ( v, seen ) )   return true
                    }
            }
        else {
                for ( const k in data ) {
                        if ( hasCircularRef ( data[k], seen ) )   return true
                    }
            }
        return false
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
                            , flatObject
                            , convert
                            , INIT_DATA_TYPES
                            , main : { load : mainLib.load }
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
                          defaultOptions = { model : 'std' }
                        , { model } = Object.assign ( {}, defaultOptions, options )
                        , dependencies = mainLib.dependencies
                        ;
                    if ( !INIT_DATA_TYPES.includes(model) ) {
                            console.error ( `Can't understand your data-model: ${model}. Please, find what is possible on https://github.com/PeterNaydenov/dt-toolbox` )
                            return null
                        }
                    // Circular reference guard: `walk` recurses without tracking, so
                    // cycles cause a fatal OOM crash. Catch them up-front.
                    if ( inData && typeof inData === 'object' && hasCircularRef ( inData ) ) {
                            throw new Error ( 'Circular reference detected in data. dt-toolbox cannot initialise a self-referencing object.' )
                        }
                    // Primitive inputs (number, string, boolean, null, undefined) are
                    // wrapped in { value: <primitive> } so the data is preserved
                    // and round-trippable. Before the fix, primitives silently
                    // produced empty dt-objects and the value was lost.
                    let actualData = inData
                    if ( inData === null || inData === undefined || typeof inData !== 'object' ) {
                            actualData = { value: inData }
                        }
                    const d  = ['flat', 'dt-model'].includes ( model ) ?
                                                mainLib.load ( actualData ) :
                                                convert.from ( model ).toFlat ( dependencies, actualData );
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
                const index = {};
                inData.forEach ( line => {
                                        const [ , ,breadcrumbs ] = line;
                                        index[breadcrumbs] = line
                                })
                const copy = walk ({data: inData });
                return flatObject ( mainLib.dependencies, [copy, index, inData ] )
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
                       defaultOptions = { model : 'std' }
                    ,  { model } = Object.assign ( {}, defaultOptions, options )
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
                    let [,,dt] = convert.from ('std').toFlat ( mainLib.dependencies, inData );
                    return dt
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
                       defaultOptions = { model : 'std', as: 'std' }
                    ,  { model, as } = Object.assign ( {}, defaultOptions, options )
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
                    let [,,dt] = convert.from ('std').toFlat ( mainLib.dependencies, inData );

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


