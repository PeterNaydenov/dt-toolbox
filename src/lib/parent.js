function parent ( dependencies, me ) {
    const { help, prop, walk, where } = dependencies;
    let 
          usedNumbers = []
        , selectedKeys = []
        , result
        ;
    for (let key in me.value ) {   // Collect used parent object(ids) from value
            let splited = key.split('/');
            if ( splited[2] == prop )   usedNumbers.push ( splited[1] )
        }
    function findUsedNumbers (obj, breadcrumbs ) {
                    if ( breadcrumbs === 'root' )   return obj  // Ignore top object
                    let isRow = typeof obj[0] == 'string';      // Ignore row objects
                    if ( isRow                  )   return obj                  
                    let [ location, name ] = obj;               // Here are only property descriptions
                    if ( name === prop )    usedNumbers.push ( location )
                    return null
        }
    walk ( me.structure,[null, findUsedNumbers])
    
    selectedKeys = usedNumbers.reduce ( (res,location) => {   // Collect props of used parent objects
                                for (let key in me.value ) {
                                            let objectID = key.split('/')[1];
                                            if ( objectID == location )   res.push ( key )
                                    }
                                return res
                            },[] )
                            
    if ( where ) {   // Apply where fn if is defined
            result = usedNumbers.reduce ( (res, number) => {
                                let [localObject, localKeysSelection] = help.filterObject ( number, selectedKeys, me.value )
                                let success = where ( localObject )
                                if ( success )   res.push ( ...localKeysSelection )
                                return res
                            },[])
        } // if where
    else    result = selectedKeys
    me._select.value     = help.updateSelection ( me._select.value, result )
    me._select.structure = walk ( me.structure )
    return me
} // parent func.



module.exports = parent


