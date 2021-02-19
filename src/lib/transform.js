function transform ( dependencies, [structure, value] ) {
    // *** Transformer for 'flat' object. Reverse object key and values, or get only keys/values
          let 
                { modify, empty } = dependencies
              , keyList = Object.keys ( value )
              , result
              ;
console.log ( modify )
          switch ( modify  ) {
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
                                      let counters = []
                                      result = keyList.reduce ( (res,k)=>{
                                                            let 
                                                                arr = k.split ( '/' )
                                                              , item = value [k]
                                                              , count = counters [ arr[1] ]
                                                              ;
                                                            if ( count == null )  count = counters [ arr[1] ] = 0
                                                            else                  counters [ arr[1] ] = ++count
                                                            arr[2] = count
                                                            let key = arr.join ( '/' );
                                                            res[key] = item
                                                            return res
                                                      }, empty())
                                      structure = structure.map ( (row,i) => {
                                                                let [ type, id, ...members ] = row;
                                                                if ( members.length > 0 ) {
                                                                            members = members.map ( item => {
                                                                                                    let 
                                                                                                        [ target, prop ] = item
                                                                                                      , name = ++counters[i]
                                                                                                      ;
                                                                                                    return [ target, name ]
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



module.exports = transform


