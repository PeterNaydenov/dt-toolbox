'use strict'



const findType =  d =>  ( d instanceof Array ) ? 'array' : 'object'





function isItPrimitive (d) {
            if     ( typeof d == 'function' )     return false
            return ( typeof d != 'object'   )  ?  true : false
} // isItPrimitive func.





function hasNumbers ( arr ) {
    return !arr.every ( el => !Number(el) ? true : false )            
} // hasNumbers func.





function* generateList ( id, value) {
// *** Generates array description for every property of object 'value'.
            for ( let key in value ) {
                    yield [ id, key, value[key] ]
                }
    } // generateList func*.





function* generateObject ( kList ) {
        let 
              places = {}
            , usedObjKeys = new Set()
            ;
        for ( let el of kList ) {
                    let 
                          prop = el.pop ()
                        , key  = el.join('/')
                        ;
                    if ( usedObjKeys.has(key) ) {
                                places[key].push ( prop )        
                        }
                    else {
                                usedObjKeys.add ( key )
                                places[key] = []
                                places[key].push ( prop )
                        }   
            } // for kList
        yield places
    } // generateObject func*.





function sanitizeFlatKeys ( list ) {   // fn(string[]) -> string[]
// *** Sanitize 'file' and 'breadcrumb' format keys. Adds 'root/' and indexes where it is needed
        let keys = list.map ( x => {  // Keys should start with 'root/'
                        let key = x.split ( '/' )
                        if ( key[0] != 'root' )   return [ 'root', ...key].join('/')
                        else                      return key.join ( '/' )
                })
        let 
              usedKeys = []
            , duplicatedKeys = new Set()
            ;
        keys.forEach ( k => {
                        if ( usedKeys.includes(k) )    duplicatedKeys.add(k)
                        else                           usedKeys.push ( k )
                })
        for (const marker of duplicatedKeys ) {
                        let counter = 0;
                        keys = keys.map ( k => {
                                            if ( k == marker )   return `${k}/${counter++}`
                                            else                 return k
                                    })
                }
        return keys
} // sanitizeFlatKeys func.





function copyStructure ( structure ) {
 // *** Returns copy of the structure and preserve immutability
    let result = []
    structure.forEach ( (row,i) => {
                        result.push ( [] )
                        row.forEach ( item =>  result[i].push ( item )   )
            })
    return result
} // copyStructure func.





function zipObject ( keys, values ) {   // (string[], string[] ) -> object
// *** Conect two arrays in a single object
    return keys.reduce ( (res,k,i)  => {
                            let  val = Number (values[i]) ? parseInt(values[i]) : values[i];
                            res[k] = val
                            return res
                }, {} )
} // zipObject func.





module.exports = { 
                      findType            // Is it array or object. Returns strings: 'array' | 'object'
                    , hasNumbers         // Check if array contain number members. Returns boolean
                    , isItPrimitive      // Returns boolean
                    , generateObject
                    , generateList 
                    , sanitizeFlatKeys   // Sanitize 'file' format keys
                    , copyStructure      // Creates a structure copy. Immutability matters
                    , zipObject          // Conect two arrays in a single object
                }


                