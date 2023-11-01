'use strict'



import walk from '@peter.naydenov/walk'

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
* @typedef {(number|string|boolean)} Primitives
*
* @typedef {Object} Line
* @description dt-model line
* @property {string} 0 - name of the dt-line.
* @property {(Primitives[]|Object<string,Primitives>)} 1 - object or array with primitive values only
* @property {string} 2 - breadcrumbs of the dt-line
* @property {Array<string>} 3 - children breadcrumbs(edges).
*
*
*
* @typedef {Line[]} Dtmodel
* @description dt-model
*
*
*
* @typedef {Object} Initoptions
* @description dtbox.init options
* @default '{ "model" : "std" }'
* @property {string} model - data model according library's data models.(Look at the documentation)
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
 * @param {Array|Object} inData - data source
 * @param {Initoptions} options - options {}
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
                    const d  = ['flat', 'dt-model'].includes ( model ) ? 
                                                mainLib.load ( inData ) : 
                                                convert.from ( model ).toFlat ( dependencies, inData );
                    return flatObject ( dependencies, d )
            }, // init func.



/**
 * @function load
 * @description Load data from dt-model
 * @param {Dtmodel} inData - dt-model data to be loaded
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
 * @param {Array|Object} inData - data source
 * @param {Initoptions} options - options. Example: { model : 'std' }
 * @returns {Dtmodel} - dt-model
 */
     flating ( inData, options={} ) {
                let 
                       defaultOptions = { model : 'std' }
                    ,  { model } = Object.assign ( {}, defaultOptions, options )
                    ;
                    if ( !INIT_DATA_TYPES.includes(model) )   return null
                    let [,,dt] = convert.from ('std').toFlat ( mainLib.dependencies, inData );
                    return dt
            }, // flating func.

     converting ( inData, options={} ) {
                let 
                       defaultOptions = { model : 'std', as: 'std' }
                    ,  { model, as } = Object.assign ( {}, defaultOptions, options )
                    ;
                    if ( !INIT_DATA_TYPES.includes(model) )   return null
                    if ( !INIT_DATA_TYPES.includes(as)    )   return null
                    let [,,dt] = convert.from ('std').toFlat ( mainLib.dependencies, inData );

                    return convert.to ( as, mainLib.dependencies, dt )
            }, // flating func.



/**
 * @function getWalk
 * @description Extract the 'walk' (@peter.naydenov/walk) from dt-toolbox library
 * @returns {Function} - walk function
 */
    getWalk : () => walk

} // mainLib



export default mainLib


