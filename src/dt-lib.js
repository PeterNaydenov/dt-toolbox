const dtlib = {



    loadData ( dependencies, flatData ) {
                let res = dependencies.empty ();
                for ( let k in flatData ) {   res[k] = flatData[k]   }
                return res
        } // loadData func.





    , transform ( dependencies, dt ) {
      // *** Transformer for DT object. Reverse object key and values, or get only keys/values
            let 
                  { instruction } = dependencies
                , keyList = Object.keys ( dt.value )
                , result
                ;

            switch ( instruction  ) {
                       case 'reverse':
                                        result = keyList.reduce ( (res,item) => {
                                                                        let value = dt.value[item];
                                                                        res[`root/${value}`] = item.substr(5) // remove 'root/' from the item
                                                                        return res
                                                       }, {} )
                                        break
                       case 'key':
                       case 'keys':
                                        result = keyList.reduce ( (res,item) => {
                                                                        res[item] = item.substr(5) // remove 'root/' from the item
                                                                        return res
                                                       },{})
                                        break
                       case 'value' :
                       case 'values':
                                        const 
                                              temp = lib._toFolderFile  ( dtValue.valueList().map(el=>`root/${el}`) )
                                            , next = simple.getIterator ( temp )
                                                           .reduce ( (res,el) => {
                                                                                     let 
                                                                                          val = temp[el]
                                                                                        , isNumber = isNaN ( parseInt(val)) ? false : true
                                                                                        , newKey  = ( isNumber ) ? `${el}/0` : `${el}/${val}`
                                                                                        ;
                                                                                     res[newKey] = val
                                                                                     return res
                                                                         },{})
                                            ;
                                        result = exportlib.build ( next )
                                        break
                       case 'file'     :
                       case 'files'    :
                       case 'folders' :
                       case 'folder'  :
                                        // Value and key in one '/' separated string. Last element will become a value
                                        result = lib._toFolderFile ( dtValue.valueList().map(el=>`root/${el}`)  ).build()
                                        break
                       default:
                                        result = {}
                 } //   switch instructions
                 dt.value = result
                 return dt
        } // transform func.

} // dtlib



module.exports = dtlib


