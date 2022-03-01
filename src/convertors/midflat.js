'use strict'



function toFlat ( dependencies, d ) {   // Converts data to shortFlat
        if ( Object.keys(d).length === 0 ) {
                let 
                      structure = [ [ 'object', 0 ]   ]
                    , value = {}
                    ;
                return [ structure, value ]
          }
        let 
              structure = []
            , value     = {}
            , { help }  = dependencies
            , keyList   = Object            // Provides keys in order: from larger to shorter 
                                .keys ( d )
                                .map ( x => x.trim().replace(/\/$/,'').split('/')  )
                                .sort ( (a,b) => b.length - a.length   )
            , tProps    = {}                // { objectLocation<string> : childObjectNames<set> }
            , structRaw = [ 'root' ]        // objectLocation strings
            , propDone  = []
            ;

        keyList.forEach ( keyArr => {   // Setup our temp structures: tProps and structRaw
                                keyArr.forEach ( (k,i) => {
                                                let parent = keyArr.slice( 0, i ).join ( '/' );
                                                if ( !parent         )   return
                                                if ( !tProps[parent] ) { 
                                                        tProps[parent] = new Set()
                                                        structRaw.push ( parent )
                                                        }
                                                tProps[parent].add ( k )
                                        })
                })

        Array.from ( structRaw.reduce ((res,ls)=> {   // Add flat objects paths
                                                res.add ( ls )
                                                let flatList;
                                                const spot = tProps[ls];
                                                if ( spot == null )   return res
                                                flatList = Array.from ( spot )
                                                flatList.forEach ( el => res.add ( `${ls}/${el}` )   )
                                                return res
                                }, new Set()   )
                )
             .sort ()
             .forEach ( (path,i) => {   // Build the structure rows    
                                                let position;
                                                if ( !structure[i]       ) {  
                                                                structure[i] = [ 'object', i ]
                                                                propDone [i] = path
                                                        }
                                                if ( propDone[i]  )   path = propDone[i]
                                                if ( path == null )   return

                                                const flatList = tProps[path];
                                                if ( !flatList ) return
                                                flatList.forEach ( name => {
                                                                let flat = Array.from ( flatList );
                                                                position = structure.length
                                                                let type = help.hasNumbers (flat) ? 'array' : 'object';
                                                                propDone[position] = `${path}/${name}`
                                                                structure.push ( [type , position])
                                                        })
                        })

        propDone.forEach ( (k,i) => {   // Setup values
                                let 
                                     keyList = Object.keys ( d[k] ).map ( k => k.trim().replace (/\/$/,'')   )   // Prevents key to end on empty-space or '/'
                                   , isArray = help.hasNumbers ( keyList )
                                   , kSplit  = k.split ( '/' )
                                   , kProp  
                                   , breadcrumbs
                                   ;

                                kProp = kSplit.pop()
                                breadcrumbs = kSplit.join('/')

                                let ix = propDone.indexOf (breadcrumbs);
                                if ( ix >= 0 )   structure[ix].push ( [i, kProp] )
                                
                                if ( isArray )   structure[i][0] = 'array'
                                else             structure[i][0] = 'object'

                                propDone [i] = k
                                for (let el in d[k] ) {
                                                value [`root/${i}/${el}` ] = d[k][el]
                                        }
            }) // keys foreach
        return [ structure, value ]
    } // toFlat func.





function toType ( dependencies, [structure, value] ) {   // Converts data to midFlat
          let
              result = { 'root': {} }
            , keys   = {'0':'root'}
            , activeKey
            ;
        structure.forEach ( (row,i) => {   // Define relation between structure number and midkeys. Var 'keys'.
                        if ( keys[i] != null )   activeKey = keys[i]
                        else                     activeKey = 'root'

                        row.forEach ( (el,j) => {   // Collect all defined sub structures
                                        if ( j < 2 )   return
                                        let 
                                            [ objNumber, objName ] = el
                                           , midKey = `${activeKey}/${objName}`
                                           ;
                                        result [ midKey  ] = {}
                                        keys [ objNumber ] = midKey
                                })
                })
        let valueKeys = Object.keys ( value );
        for (let k of valueKeys ) {    // Organize values per midFlat object
                        let 
                              [ , n ,prop ] = k.split ( '/' )
                            , midKey = keys[n]
                            ;
                        result[midKey][prop] = value[k]
                    }
        return result
} // toType func.



module.exports = { toFlat, toType }


