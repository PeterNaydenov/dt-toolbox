'use strict'

const 
     breadcrumbs = require ( './breadcrumbs' )
   , std         = require ( './standard'    )
   , midFlat     = require ( './midflat'      )
   ;



const selectConvertorFrom = 
        ( model ) => 
        ( dependencies, inData ) => {
                    let 
                          { help } = dependencies
                        , vBuffer = []   // keep values during key's sanitize procedure
                        , rawKeys
                        , keyList
                        , rawValue
                        ;
                    switch ( model ) {
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





function from ( model ) {   // convert from something to flat...
        return { toFlat: selectConvertorFrom (model)   }
    } // from func.





function to ( model, dependencies, inData ) {   // convert from flat to 'data-model'...
        switch ( model ) {
            case 'std' :
            case 'standard':
                             return std.toModel ( dependencies, inData )
            case 'midFlat' : 
                             return midFlat.toModel ( dependencies, inData )
            case 'breadcrumb' :
            case 'breadcrumbs':
                             return breadcrumbs.toModel ( dependencies,inData )
            } //switch model
    } // to func.





module.exports = { from, to }




