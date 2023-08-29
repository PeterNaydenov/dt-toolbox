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
                                case 'midFlat' :
                                                  return midFlat.toFlat ( dependencies, inData )
                            }
                    return [ ['object', 0], {} ]
            } // toFlat func.





function from ( type ) {   // convert from something to flat...
        return { toFlat: selectConvertorFrom (type)   }
    } // from func.





function to ( type, dependencies, inData ) {   // convert from flat to 'data-type'...
        const 
              breadcrumbs = {}
            , check = new Set()
            , extend = new Set()
            ;
        let tups, count = 0;
        switch ( type ) {
            case 'std' :
            case 'standard':
                             return std.toType ( inData )
            case 'midFlat' : 
                             return midFlat.toType ( inData )
            case 'tuple':
            case 'tuples':
                            return tuples.toType ( inData )
            case 'files':
                           tups = tuples.toType ( inData );
                           return tups.map ( ([k,v]) =>  (( k === 'root' ) ? v : `${k}/${v}`)   )
            case 'breadcrumb' :
            case 'breadcrumbs':
                           let current;
                           tups = tuples.toType ( inData )
                           tups.forEach ( ([k,v]) => check.has(k) ? extend.add(k) : check.add(k)  )
                           tups.forEach ( ([k,v]) => {
                                                if ( extend.has(k) ) {
                                                        if ( current !== k ) {
                                                                        current = k
                                                                        count = 0
                                                            }
                                                        let key = ( k === 'root' ) ? count : `${k}/${count}` 
                                                        breadcrumbs[key] = v
                                                        count++
                                                    }
                                                else {
                                                        breadcrumbs[k] = v
                                                    }
                                        })
                           return breadcrumbs
            } //switch type
    } // to func.



export default { from, to }


