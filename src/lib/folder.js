function folder ( dependencies, me ) {
    const { help, prop, walk, where } = dependencies;
    let 
          usedNumbers = []
        , selectedKeys = []
        , result = []
        ;
    if ( prop == 'root' )   usedNumbers.push ( 0 )

    me.structure.forEach ( row => {   // Find if structures
    row.forEach ( (item,i) => {
                  if ( i > 1 ) {
                        let [id, name] = item;
                        if ( name==prop )   usedNumbers.push(id)
                    }
        })})

    selectedKeys = usedNumbers.reduce ( (res,number) => {
                                for (let key in me.value ) {
                                            let splited = key.split('/');
                                            if ( splited[1] == number )   res.push ( key )
                                    }
                                return res
                          },[])
    if ( where ) { // TODO: Still not tested. May be 'where' should receive (key,value)
          result = usedNumbers.reduce ( (res, number) => {
                                let [localObject, localKeysSelection] = help.filterObject ( number, selectedKeys, me.value )
                                let success = where ( localObject )
                                if ( success )   res.push ( ...localKeysSelection )
                                return res
                        },[])
        } // if where
    else  result = selectedKeys
    me._select.value     = help.updateSelection ( me._select.value, result )
    me._select.structure = walk ( me.structure )
    return me
} // folder func.



module.exports = folder


