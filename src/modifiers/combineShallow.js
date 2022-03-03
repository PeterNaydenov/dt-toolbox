function combineShallow ( mainData, update ) {
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

            let sortedKeys = allKeys.sort ( (a,b) => b.split('/').length - a.split('/').length )

            let duplicateNames = sortedKeys.reduce ( (res,key) => {
                                              let
                                                   mainObject   = mainData['root']
                                                 , updateObject = update [key]
                                                 , check  = key.split('/').pop ()
                                                 , mainKeys = Object.keys ( mainObject )
                                                 ;

                                              if ( key!= 'root' && mainData[key] ) {   // key already has more than one value in mainData. Converted to object
                                                      res.add ( check )
                                                      if ( !extraContent[check] )   extraContent[check] = []
                                                      extraContent[check] = Object.keys ( mainData[key] ).reduce ( (res,k) => {
                                                                                                                  res.push ( mainData[key][k] )
                                                                                                                  return res
                                                                                                      }, extraContent[check])
                                                }

                                             if ( check!='root' && updateObject ) {  // key exists as object in updateObject
                                                      res.add ( check )
                                                      if (!extraContent[check])   extraContent[check] = []
                                                      extraContent[check] = Object.keys ( updateObject ).reduce ( (res,k) => {
                                                                                                                        res.push ( updateObject[k] )
                                                                                                                        return res
                                                                                                      }, extraContent[check])
                                                }
                                                  
                                          
                                             for ( k in updateObject ) {
                                                              if ( mainData[`root/${k}`] && updateObject[k] ) { 
                                                                        res.add ( k )
                                                                        if ( !extraContent[k] )   extraContent[k] = []
                                                                        extraContent[k].push ( updateObject[k] )
                                                                  }

                                                              if ( mainObject[k] && updateObject[k]) {
                                                                        res.add ( k )
                                                                        if ( extraContent[k] )   extraContent[k].push ( updateObject[k] )
                                                                        else                     extraContent [ k ] = [ mainObject[k], updateObject[k]]
                                                                  }
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
                                             , check = key.split ( '/' ).pop ()
                                             ;
                                          if ( duplicateNames.has(check) )   return
                                          updateKeyList.forEach ( k => {
                                                         let testKey = `root/${k}`;
                                                         if ( result[testKey] ) {
                                                                     let digitCount = _findDigitKeys ( result[testKey]);
                                                                     if ( obj[k] === '_fake$$$' )   return
                                                                     result[testKey][digitCount] = obj[k]
                                                                     return
                                                               }
                                                         if ( !duplicateNames.has(k) ) {  
                                                                     if ( obj[k] === '_fake$$$' )   return
                                                                     result[key][k] = obj[k]
                                                               }
                                                })
               })   // forEach updateKeys
            
            

            for ( k in extraContent ) {
                        const resKey = `root/${k}`;

                        result[resKey] = extraContent[k].reduce ( (res,item,i) => {
                                    res[i] = item
                                    return res
                              },{})
               }   // for extraContent               
            return result
    } // combineShallow func.





function _findDigitKeys ( obj ) {
      let count = 0;
      for ( k in obj ) {
            let isDigit = isNaN ( parseInt(k)) ? false : true;
            if ( isDigit )   count++
         } // for obj
      return count
} // findDigitKeys func.



module.exports = combineShallow


