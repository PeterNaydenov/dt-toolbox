'use strict'



function toFlat ( dependencies, d ) {   // Converts data to shortFlat
        let 
              keys = Object.keys(d).sort ( (a,b) => a.split('/').length - b.split('/').length )
            , structure = []
            , { help, empty } = dependencies
            , value = empty ()
            ;
        keys.forEach ( (k,i) => {
                    let 
                          keyList = Object.keys ( d[k] )
                        , isArray = help.hasNumbers ( keyList )
                        , kSplit  = k.split ('/' )
                        , kLength = kSplit.length
                        , kProp  
                        ;
                    if ( kLength > 1 ) {
                            kProp = kSplit.pop ()
                            structure[kLength-2].push ( [i, kProp] )
                        }

                    if ( isArray )   structure.push ( [ 'array', i  ])
                    else             structure.push ( [ 'object', i ])
                    
                    for (let el in d[k] ) {
                                value [`root/${i}/${el}` ] = d[k][el]
                        }
            }) // keys foreach
        return [ structure, value ]
    } // toFlat func.





function toType ( dependencies, [structure, value] ) {   // Converts data to midFlat
        let
              result = {}
            , keys   = {}
            , activeKey
            ;
        structure.forEach ( (row,i) => {
                        let 
                              v = {}
                            , testKey
                            ;
                        // setup activeKey
                        if ( keys[i] )   activeKey = keys[i]
                        else             activeKey = 'root'

                        row.forEach ( (el,j) => {   // collect all defined sub structures
                                        if ( j < 2 )   return
                                        let [objNumber, objName ] = el;
                                        keys[objNumber] = `${activeKey}/${objName}`
                                })
                        testKey = `root/${row[1]}`
                        for (let k in value ) {    // collect values per object
                                if ( k.includes(testKey) ) {
                                            let prop = k.split('/').pop();
                                            v[prop] = value[k]
                                    }
                            }
                        result [activeKey] = v
                })
        return result
} // toType func.



module.exports = { toFlat, toType }


