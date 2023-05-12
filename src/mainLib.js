'use strict'



import walk from '@peter.naydenov/walk'

import flatObject from './flatObject/index.js'             // Flat data api.
import flatData from './flatData/index.js'            // Query data api. Used in model functions 
import convert  from './convertors/index.js'          // Convertors



const INIT_DATA_TYPES = [
                  'std', 'standard'
                , 'tuple', 'tuples'
                , 'breadcrumb', 'breadcrumbs'
                , 'file', 'files'
                , 'midFlat'
                , 'flat'
            ]
    ;



const mainLib = {

    dependencies () {
                    return {
                              walk
                            , flatData
                            , flatObject
                            , convert
                            , INIT_DATA_TYPES
                            , main : () => ({ load : mainLib.load })
                        }
            } // dependencies func.



    , init ( inData, options={} ) {
                    let 
                          defaultOptions = { model : 'std' }
                        , { model } = Object.assign ( {}, defaultOptions, options )
                        , dependencies = mainLib.dependencies
                        ;
                    if ( !INIT_DATA_TYPES.includes(model) ) {
                            console.error ( `Can't understand your data-model: ${model}. Please, find what is possible on https://github.com/PeterNaydenov/dt-toolbox` )
                            return null
                        }
                    const 
                          d  = convert.from(model).toFlat ( dependencies, inData )
                        , flat =  flatObject ( dependencies, d )
                        ;
                    return flat
            } // init func.



    , load ( inData ) {
                const index = {};
                inData.forEach ( line => {
                                        const [ , ,breadcrumbs ] = line;
                                        index[breadcrumbs] = line
                                })
                const copy = walk ({data: inData });
                return flatObject ( mainLib.dependencies, [copy, index, inData ] )
            } // load func.



    , flating ( inData, options={} ) {
                let 
                       defaultOptions = { model : 'std' }
                    ,  { model } = Object.assign ( {}, defaultOptions, options )
                    ;
                    if ( !INIT_DATA_TYPES.includes(model) )   return null
                    let [,,dt] = convert.from ('std').toFlat ( mainLib.dependencies, inData );
                    return dt
            } // flating func.



    , converting ( inData, options={} ) {
                let 
                       defaultOptions = { model : 'std', as: 'std' }
                    ,  { model, as } = Object.assign ( {}, defaultOptions, options )
                    ;
                    if ( !INIT_DATA_TYPES.includes(model) )   return null
                    if ( !INIT_DATA_TYPES.includes(as)    )   return null
                    let [,,dt] = convert.from ('std').toFlat ( mainLib.dependencies, inData );

                    return convert.to ( as, mainLib.dependencies, dt )
            } // flating func.


            
    , getWalk : () => walk

} // mainLib



export default mainLib


