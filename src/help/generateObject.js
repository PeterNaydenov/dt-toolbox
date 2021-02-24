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



module.exports = generateObject


