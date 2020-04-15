'use strict'



const dtlib = {



    loadLong ( dependencies, flatData ) {
                let { structure, value } = flatData;
                return dtlib._loadData ( dependencies, structure, value )
        } // loadLong func.

    , loadShort ( dependencies, flatData ) {
                let [structure, value] = flatData;
                return dtlib._loadData ( dependencies, structure, value )
        } // loadShort func.

    , _loadData ( dependencies, structure, value ) {
                let res = dependencies.simpleDT ();
                for ( const el of structure ) {
                          res.structure.push ( [...el] )
                    }
                for ( const k in value ) {
                          res.value[k] = value[k]
                    }
                return res
        } // loadData





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
                                                                        let 
                                                                              arr = item.split ( '/' )
                                                                            , onlyNumbers = /^[0-9]+$/
                                                                            , pureKey = ( arr[2].match(onlyNumbers) ) ? parseInt(arr[2]) : arr[2]
                                                                            , value = dt.value[item]
                                                                            ;
                                                                        res[`root/${arr[1]}/${value}`] = pureKey
                                                                        return res
                                                       }, {} )
                                        break
                       case 'key':
                       case 'keys':
                                        result = keyList.reduce ( (res,item) => {
                                                                        let 
                                                                              arr = item.split ( '/' )
                                                                            , onlyNumbers = /^[0-9]+$/
                                                                            , pureKey = arr[2].match(onlyNumbers) ? parseInt(arr[2]) : arr[2]
                                                                            ;
                                                                        res[item] = pureKey
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


