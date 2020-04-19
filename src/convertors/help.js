'use strict'



const findType =  d =>  ( d instanceof Array ) ? 'array' : 'object'



function isItPrimitive (d) {
            if     ( typeof d == 'function' )     return false
            return ( typeof d != 'object'   )  ?  true : false
} // isItPrimitive func.




function hasNumbers ( arr ) {
    return !arr.every ( el => !Number(el) ? true : false )            
} // hasNumbers func.




function* generateList ( id, val) {
            for ( let k in val ) {
                    yield [ id, k, val[k] ]
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





function toFolderFile ( target ) {
// *** Find hidden arrays and update keys. Like in folders/files.
            let 
                folderKeys = []
              , duplicates = []
              , counters   = []
              , result
              ;
           
            // Find repeating folder names
            target.forEach ( el => {
                                        let file    = el.split('/').pop()
                                        let folder = el.replace ( `/${file}`, '' )
            
                                        folderKeys.forEach ( key => {
                                                    if ( folder.includes(key) && !duplicates.includes(key) ) { 
                                                            duplicates.push ( key )
                                                            counters.push ( 0 )
                                                        }
                                                })
                                        if      ( !folderKeys.includes(folder) )   folderKeys.push ( folder )
                            })
            result = target.reduce ( (res,item) => {
                                                            let 
                                                                  file      = item.split('/').pop()
                                                                , folder   = item.replace(`/${file}`,'')
                                                                , dupIndex = duplicates.findIndex ( el => el == folder )
                                                                ;
                                                            if ( dupIndex > -1 ) {
                                                                    res[`${folder}/${counters[dupIndex]++}`] = file;
                                                                }
                                                            else    res[ folder ] = file
                                                            return res
                                            }, value() )
            return result
      } // toFolderFile func.





module.exports = { 
                      findType
                    , hasNumbers
                    , isItPrimitive
                    , generateObject
                    , generateList 
                    , toFolderFile
                }




                