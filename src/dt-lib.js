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
                const { help, simpleDT } = dependencies;
                let res = simpleDT ();
                res.structure = help.copyStructure ( structure )
                for ( const k in value ) {
                          res.value[k] = value[k]
                    }
                return res
        } // loadData





    , transform ( dependencies, [structure, value] ) {
      // *** Transformer for DT object. Reverse object key and values, or get only keys/values
            let 
                  { mod, empty } = dependencies
                , keyList = Object.keys ( value )
                , result
                ;

            switch ( mod  ) {
                       case 'reverse':
                                        result = keyList.reduce ( (res,item) => {
                                                                        let 
                                                                              arr = item.split ( '/' )
                                                                            , onlyNumbers = /^[0-9]+$/
                                                                            , pureKey = ( arr[2].match(onlyNumbers) ) ? parseInt(arr[2]) : arr[2]
                                                                            , val = value[item]
                                                                            ;
                                                                        res[`root/${arr[1]}/${val}`] = pureKey
                                                                        return res
                                                       }, empty() )
                                        break
                       case 'key':
                       case 'keys':
                                        result = keyList.reduce ( (res,key) => {
                                                                        let 
                                                                              arr = key.split ( '/' )
                                                                            , onlyNumbers = /^[0-9]+$/
                                                                            , pureKey = arr[2].match(onlyNumbers) ? parseInt(arr[2]) : arr[2]
                                                                            ;
                                                                        res[key] = pureKey
                                                                        return res
                                                       }, empty() )
                                        break
                       case 'value' :
                       case 'values':
                                        result = empty ()
                                        let counter = 0;
                                        for (const v of keyList ) {
                                                    let 
                                                          arr = v.split ( '/' )
                                                        , item = value[v]
                                                        ;
                                                    arr[2] = counter++
                                                    let key = arr.join ('/');
                                                    result[key] = item
                                              }
                                        structure = structure.map ( row => {
                                                                  let [ type, id, ...members ] = row;
                                                                  if ( members.length > 0 ) {
                                                                              counter = 0
                                                                              members = members.map ( item => {
                                                                                                      let [ target, prop ] = item;
                                                                                                      return [ target, target ]
                                                                                                })
                                                                      }
                                                                  return [ 'array', id, ...members ]
                                                            })
                                        break
                       default:
                                        result = empty ()
                 } //   switch instructions
                 return [structure, result]
        } // transform func.

} // dtlib



module.exports = dtlib


