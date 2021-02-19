function transform ( dependencies, [structure, value] ) {
    // *** Transformer for 'flat' object. Reverse object key and values, or get only keys/values
          let 
                { modify, empty } = dependencies
              , keyList = Object.keys ( value )
              , result
              ;
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
                                      result = keyList.reduce ( (res,key,i) => {
                                                                      let 
                                                                            arr = key.split ( '/' )
                                                                          , k = `root/0/${i}`
                                                                          ;
                                                                      res[k] = arr[2]
                                                                      return res
                                                     }, empty() )
                                      structure = [ [ 'array', 0 ]]
                                      break
                     case 'value' :
                     case 'values':
                                      result = keyList.reduce ( (res,k,i) => {
                                                            let 
                                                                  item = value [k]
                                                                , key = `root/0/${i}`
                                                                ;
                                                            res[key] = item
                                                            return res
                                                      }, empty() )
                                      structure = [ [ 'array', 0 ] ]
                                      break
                     default:
                                      result = empty ()
               } //   switch instructions
               return [structure, result]
    } // transform func.



module.exports = transform


