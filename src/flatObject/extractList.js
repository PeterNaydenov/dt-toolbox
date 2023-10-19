'use strict'



function extractList ( dependencies, flatIO, indexFn ) {
return function extractList ( list, options ) {
            const 
                      root     = indexFn ( 'root' )
                    , { main:{load}, INIT_DATA_TYPES } = dependencies ()
                    , asTypes = [ ...INIT_DATA_TYPES, 'dt-object' ]
                    ;
            let 
                  error = false
                , errorMsg = ''
                ;
                
            if ( options ) {
                    if ( !options.as ) {
                            error = true
                            errorMsg = `Options should be an object and property "as" is required`
                        }
                    if ( !error && !asTypes.includes(options.as) ) {  
                            error = true
                            errorMsg = `Invalid option "as" value: ${options.as}.`
                        }
                    if ( error )  throw new Error ( errorMsg )
                }

            return list
                        .map ( name => {
                                            let lines = flatIO.export ( name );
                                            if ( lines.length === 0 )  return root[1].hasOwnProperty(name) ? root[1][name] : null
                                            else                       return lines
                                        })
                        .map ( item => {
                                            if ( item == null            )   return null
                                            if ( !(item instanceof Array))   return item
                                            return load(item).model(() => options )
                                        })
}} // extractList func.



export default extractList


