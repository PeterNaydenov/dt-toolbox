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



module.exports = filterObject
    

