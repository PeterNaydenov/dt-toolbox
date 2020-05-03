'use strict'



const findType =  d =>  ( d instanceof Array ) ? 'array' : 'object'





function isItPrimitive (d) {
            if     ( typeof d == 'function' )     return true // it's not really primitive but we want function to be treated as primitive
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





function filterObject ( id, keySelection, value={} ) {
// *** Filter object with by id
        let 
              local = {}            // Filtered object
            , localSelection = []   // List of filtered object props
            ;
        keySelection.forEach ( key => {
                    let 
                          splited = key.split ( '/' )
                        , num     = splited [ 1 ]
                        , prop    = splited.pop()
                        ;
                    if ( num == id ) {  
                                local[prop] = value[key]
                                localSelection.push ( key )
                        }
            })
        return [ local, localSelection ]
} // filterObject



function toBreadcrumbKeys ( keys, structure ) {   // (flatKey[], structure ) => breadcrumbKeys[]
 // *** Map convertion of flat keys to breadcrumb keys.
        let containerNames = [ 'root' ];
        structure.forEach ( level => { 
        level.forEach ( (obj,i) => {   // Find container names
                        let 
                              objectID = level[1]
                            , container = containerNames[objectID]
                            ;
                        if ( i > 1 )   containerNames.push ( `${container}/${obj[1]}`)
                })
                })
        return keys.map ( k => {
                                let 
                                      splited     = k.split ( '/' )
                                    , containerID = splited [ 1 ]
                                    , prop        = splited [ 2 ]
                                    , long        = containerNames [ containerID ]
                                    ;
                                return `${long}/${prop}`
                        })
} // toBreadcrumbKeys func.


function updateSelection ( [...selection], updates ) {
    updates.forEach ( key => {
                if ( !selection.includes(key) )   selection.push ( key )
            })
    return selection
} // updateSelection



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
                    , filterObject        // Find object and object props in a value
                    , toBreadcrumbKeys   // Breadcrumbs keys
                    , updateSelection    // Updates selection list. Checks if element is already selected
                    , zipObject          // Conect two arrays in a single object
                }


                