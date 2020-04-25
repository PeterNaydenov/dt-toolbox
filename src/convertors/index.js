'use strict'

const 
     breadcrumbs = require ( './breadcrumbs' )
   , std         = require  ( './standard' )
   , midFlat     = require ('./midflat' )
   ;



const selectConvertorFrom = 
        ( format ) => 
        ( dependencies, inData ) => {
                    let 
                          { sanitizeFlatKeys } = dependencies.help
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
                                                  vBuffer  = rawKeys.forEach ( k => inData[k] )
                                                  keyList  = sanitizeFlatKeys ( rawKeys )
                                                  rawValue = keyList.reduce ( (res,k,i)  => {
                                                                            let  val = Number (vBuffer[i])? parseInt(vBuffer[i]) : vBuffer[i];
                                                                            res[k]   = val
                                                                            return res
                                                                    }, {} )
                                                  return   breadcrumbs.toFlat ( dependencies, rawValue )
                                case 'file'    :
                                case 'files'   :
                                                  // TODO: Move this manipulations in help file
                                                  //  extractKeys, sanitaze, buildRawValue
                                                  rawKeys = inData.map ( el => {  // extract keys from files
                                                                        let arr = el.split('/');
                                                                        vBuffer.push ( arr.pop() )
                                                                        return arr.join ( '/' )
                                                                })
                                                  keyList  = sanitizeFlatKeys ( rawKeys )
                                                  rawValue = keyList.reduce ( (res,k,i)  => {
                                                                            let  val = Number (vBuffer[i])? parseInt(vBuffer[i]) : vBuffer[i];
                                                                            res[k]   = val
                                                                            return res
                                                                    }, {} )
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
            case 'midFlat' : return midFlat.toStandard ( dependencies, inData )
            } //switch format
    } // to func.





module.exports = { from, to }




