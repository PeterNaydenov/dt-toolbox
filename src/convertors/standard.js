'use strict'



function toFlat ( dependencies, d ) {   // Convert data to 'dt' model
        const
              { walk } = dependencies ()
            , dt = []
            , index = {}
            , dtDATA = 1   // Const: Flat data object in store record line;
            , dtEDGES = 3  // Const: Edges in store record line;
            ;

        function objCallbackFn ({ value, key, breadcrumbs }) {
                        const 
                              isRoot = (breadcrumbs === 'root' ) && ( key === 'root' )
                            , isArray = value instanceof Array ? true : false
                            , dataType = isArray ? [] : {}
                            , objectName = key
                            , search = new RegExp (  `\/${key}$` )
                            , parentName = breadcrumbs.replace ( search, '' )
                            , newObject = [ objectName, dataType, breadcrumbs, [] ]
                            ;
                       
                        if ( !isRoot )   index[ parentName][dtEDGES].push ( breadcrumbs )
                        dt.push ( newObject )
                        index [ breadcrumbs ] = dt.at(-1)
                        return value
                } // objCallbackFn

        function keyCallbackFn ({ value, key, breadcrumbs }) {
                        const
                              search = new RegExp (  `\/${key}$` )
                            , parentName = breadcrumbs.replace ( search, '' )
                            ; 
                        index [parentName][dtDATA][key] = value
                        return value
                } // keyCallbackFn

        const copy = walk ({
                              data : d
                            , keyCallback    : keyCallbackFn
                            , objectCallback : objCallbackFn 
                        })
            return [ { root:copy }, index, dt ]   
    } // getFlat func.










function toType ( dt ) {
            let 
                  result = {}
                , revDT = dt.reverse ()
                ;
            revDT.forEach ( ([ name, d, breadcrumbs, edges ]) => {
                        const copy = d instanceof Array ? [...d] : {...d};
                        
                        result[breadcrumbs] = copy
                        edges.forEach ( edge => {
                                        if ( result[edge] ) {
                                                const name = edge.replace (`${breadcrumbs}/`, '' );
                                                result[breadcrumbs][name] = result[edge]
                                            }  
                                })
                    })
            return result['root']
    } // toType func.













export default { toFlat, toType }

