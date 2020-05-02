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





    , modify ( dependencies, main, addData ) {
      // ***   Modify add | update | overwrite
              const
                    { action, convert, help } = dependencies 
                  , mainData = convert.to ( 'midFlat', dependencies, [main.structure, main.value])
                  , update   = convert.to ( 'midFlat', dependencies, [addData.structure, addData.value] )
                  ;
              let result;
              main._error = main._error.concat ( addData._error )
              result = mixMidFlat[action] ( mainData, update )
              let [structure, value ] = convert.from ( 'midFlat').toFlat ( dependencies, result )
              main.structure = help.copyStructure ( structure )
              main.value = value
              return main
        } // modify func.





      





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










const mixMidFlat = {
   add ( mainData, update ) {
            for (const updateKey in update ) {
                        let   selectObject =   mainData[updateKey];
                        if ( !selectObject )   mainData[updateKey] = { ...update[updateKey] }
                        else {
                                    for (let prop in update[updateKey]) {
                                                    if ( !mainData[updateKey][prop] )   mainData[updateKey][prop] = update[updateKey][prop]
                                            }
                            }
                }
            return mainData
      } // add func.



  , update ( mainData, update ) {
            for (const updateKey in update ) {
                      if ( mainData[updateKey] ) {
                                  for (let prop in update[updateKey]) {
                                                  if ( mainData[updateKey][prop] )   mainData[updateKey][prop] = update[updateKey][prop]
                                          }
                          }
              }
            return mainData
      } // update func.



  , overwrite ( mainData, update ) {
            for (const updateKey in update ) {
                    let selectObject = mainData[updateKey]
                    if ( !selectObject )   mainData[updateKey] = {...update[updateKey]}
                    else {
                                for (let prop in update[updateKey]) {
                                                mainData[updateKey][prop] = update[updateKey][prop]
                                        }
                        }
                }
            return mainData
      } // overwrite func.
    

  
  , insert ( mainData, update ) {
            for (const updateKey in update ) {
                            let 
                                  mainVals   = Object.values ( mainData[updateKey])
                                , updateVals = Object.values ( update[updateKey] )
                                , mixed      = mainVals.concat ( updateVals )
                                ;
                            mainData[updateKey] = mixed.reduce ( (r,item,i) => {
                                                                r[i] = item
                                                                return r
                                                }, {} )
                }
            return mainData
      } // insert func.
} // mixMidFlat





module.exports = dtlib




