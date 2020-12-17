function combine ( mainData, update ) {
            let  
                  mainKeys = Object.keys(mainData)
                , updateKeys = Object.keys ( update )
                , allKeys = [...mainKeys]
                , result  = {root:{}}
                , extraContent = {}
                ;



            for ( key of updateKeys ) {
                     if ( !allKeys.includes(key) )   allKeys.push ( key )
               }
            


            let duplicateNames = allKeys.reduce ( (res,key) => {
                                              let
                                                   mainObject   = mainData[key]
                                                 , updateObject = update [key]
                                                 ;

                                              if ( mainObject && updateObject ) {
                                                      for ( k in updateObject ) {
                                                              if ( mainObject[k] && updateObject[k]) {
                                                                        res.add ( k )
                                                                        if ( extraContent[k] )   extraContent[k].push ( updateObject[k] )
                                                                        else                     extraContent [ k ] = [ mainObject[k], updateObject[k]]
                                                         }}
                                                }
                                              return res
                                    }, new Set() )
                                    


            mainKeys.forEach ( key => {   // Insert mainKeys but ignore duplicates
                                          let obj = mainData[key];
                                          result[key] = {}
                                          for ( k in obj ) {
                                                if ( !duplicateNames.has(k) )   result[key][k] = obj[k]
                                            }
               })   // forEach mainKeys


            updateKeys.forEach ( key => {
                                          let 
                                               obj = update[key]
                                             , updateKeyList = Object.keys ( obj )
                                             ;
                                          updateKeyList.forEach ( k => {
                                                         let testKey = `root/${k}`;
                                                         if ( result[testKey] ) {
                                                                     let digitCount = _findDigitKeys ( result[testKey]);
                                                                     result[testKey][digitCount] = obj[k]
                                                                     return
                                                               }
                                                         if ( !duplicateNames.has(k) )   result[key][k] = obj[k]
                                                })
               })   // forEach updateKeys
            
            

            for ( k in extraContent ) {
                        const
                             resKey = `root/${k}`
                           , resKeyList = Object.keys ( result )
                           ;
                         if ( resKeyList.includes(resKey) ) {
                                 let digitCount = _findDigitKeys ( result[k] );
                                 extraContent[k].forEach ( item =>  result[resKey][digitCount++] = item )                               
                           }
                         else {
                                  result[resKey] = extraContent[k].reduce ( (res,item,i) => {
                                                                         res[i] = item
                                                                         return res
                                                                   },{})
                           }
               }   // for extraContent


               
            return result
    } // combine func.





function _findDigitKeys ( obj ) {
      let count = 0;
      for ( k in obj ) {
            let isDigit = isNaN ( parseInt(k)) ? false : true;
            if ( isDigit )   count++
         } // for obj
      return count
} // findDigitKeys func.



module.exports = combine


