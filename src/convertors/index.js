'use strict'

const 
     breadcrumbs = require ( './breadcrumbs' )
   , std         = require ( './standard'    )
   , midFlat     = require ( './midflat'      )
   ;



const selectConvertorFrom = 
        ( format ) => 
        ( dependencies, inData ) => {
                    let 
                          { help } = dependencies
                        , vBuffer = []   // keep values during key's sanitize procedure
                        , rawKeys
                        , keyList
                        , rawValue
                        ;
                    switch ( format ) {
                                case 'std'     :
                                case 'standard':
                                                  return   std.toFlat ( dependencies, inData )
                                case 'tuple'   :
                                case 'tuples'  :
                                                  
                                                  break
                                case 'breadcrumb'  :
                                case 'breadcrumbs' :
                                                  rawKeys  = Object.keys ( inData )
                                                  vBuffer  = rawKeys.map ( k => inData[k] )
                                                  keyList  = help.sanitizeFlatKeys ( rawKeys )
                                                  rawValue = help.zipObject ( keyList, vBuffer )
                                                  return   breadcrumbs.toFlat ( dependencies, rawValue )
                                case 'file'    :
                                case 'files'   :
                                                  rawKeys = inData.map ( el => {  // extract keys from files
                                                                        let arr = el.split('/');
                                                                        vBuffer.push ( arr.pop() )
                                                                        return arr.join ( '/' )
                                                                })
                                                  keyList  = help.sanitizeFlatKeys ( rawKeys )
                                                  rawValue = help.zipObject ( keyList, vBuffer )
                                                  return   breadcrumbs.toFlat ( dependencies, rawValue )
                                case 'midFlat' :
                                                  return midFlat.toFlat ( dependencies, inData )
                            }
                    return [ ['object', 0], {} ]
            } // toFlat func.





function from ( format ) {   // convert from something to flat...
        return { toFlat: selectConvertorFrom (format)   }
    } // from func.





function to ( format, dependencies, inData ) {   // convert from flat to 'format'...
        switch ( format ) {
            case 'std' :
            case 'standard':
                             return std.toFormat ( dependencies, inData )
            case 'midFlat' : 
                             return midFlat.toFormat ( dependencies, inData )
            case 'breadcrumb' :
            case 'breadcrumbs':
                             return breadcrumbs.toFormat ( dependencies,inData )
            } //switch format
    } // to func.





module.exports = { from, to }




