'use strict'


import std     from './standard.js'
import midFlat from './midflat.js'
import tuples  from './tuples.js'



const selectConvertorFrom = 
        ( type ) => 
        ( dependencies, inData ) => {
                    switch ( type ) {
                                case 'std'     :
                                case 'standard':
                                                  return   std.toFlat ( dependencies, inData )
                                case 'tuple'   :
                                case 'tuples'  :
                                                  return tuples.toFlat ( dependencies, inData )
                                case 'breadcrumb'  :
                                case 'breadcrumbs' :
                                                  const br = Object.entries ( inData );
                                                  return tuples.toFlat ( dependencies, br )
                                case 'file'    :
                                case 'files'   :
                                                  const tups = inData.map ( el => {
                                                                                let ar = el.split ( '/' );
                                                                                if ( ar.length === 1 )  ar = [ 'root'].concat(ar)
                                                                                const v = ar.pop ()
                                                                                return [ ar.join('/'), v ]
                                                                        })
                                                  return tuples.toFlat ( dependencies, tups )
                                case 'midflat' :
                                case 'midFlat' :
                                                  return midFlat.toFlat ( dependencies, inData )
                            }
                    return [ {}, [] ]   // Unreachable: model names are validated before conversion
            } // toFlat func.





function from ( type ) {   // convert from something to flat...
        return { toFlat: selectConvertorFrom (type)   }
    } // from func.





/**
 * Convert a DT-model to the 'breadcrumbs' model: one flat object with paths as keys.
 * Paths come from the dt-lines, so array items always get their index.
 * Before the fix, arrays were guessed by counting repeated paths: a one-item array lost
 * its index (`{ k: [1] }` → `{ k: 1 }`), and arrays with objects between values got
 * wrong indexes, so values were lost on the way back.
 * @param {Array} dt - DT-model
 * @returns {Object} - breadcrumbs model
 */
function toBreadcrumbs ( dt ) {
        const result = {};
        dt.forEach ( ([ , flatData, breadcrumbs ]) => {
                    const prefix = breadcrumbs === 'root' ? ''
                                 : breadcrumbs.startsWith ( 'root/' ) ? `${breadcrumbs.slice ( 5 )}/`
                                 : `${breadcrumbs}/`   // Segments outside 'root'
                    // Object.keys skips array holes: objects inside arrays are dt-lines of their own
                    Object.keys ( flatData ).forEach ( k => result[`${prefix}${k}`] = flatData[k] )
            })
        return result
    } // toBreadcrumbs func.



function to ( type, dependencies, inData ) {   // convert from flat to 'data-type'...
        const { copyDtModel } = dependencies ();
        let tups;
        switch ( type ) {
            case 'flat':
            case 'dt-model':
                             return copyDtModel ( inData )
            case 'std' :
            case 'standard':
                             return std.toType ( inData )
            case 'midflat'  :
            case 'midFlat' : 
                             return midFlat.toType ( inData )
            case 'tuple':
            case 'tuples':
                            return tuples.toType ( inData )
            case 'file':
            case 'files':
                           tups = tuples.toType ( inData );
                           return tups.map ( ([k,v]) => { 
                                            if ( typeof v === 'function' )   return `${k}/function:${v.name}`
                                            if ( v?.nodeType )               return `${k}/HtmlElement:${v.tagName? v.tagName.toLowerCase() : 'notSpecified'}`
                                            return (( k === 'root' ) ? v : `${k}/${v}`)   
                                        })
            case 'breadcrumb' :
            case 'breadcrumbs':
                           return toBreadcrumbs ( inData )
            } //switch type
    } // to func.



export default { from, to }


