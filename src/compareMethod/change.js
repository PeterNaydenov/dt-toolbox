function change ( mainData, checkData ) {
 // *** Compare values. Reduce to key/value pairs with different values.
    let
          result     = {}
        , mainKeys   = Object.keys ( mainData )
        ;
    mainKeys.forEach ( k => {
                let
                      HAS_KEY = ( checkData.hasOwnProperty(k)   )
                    , EQUAL_VALUES = HAS_KEY && ( mainData[k] === checkData[k]   )
                    ;
                if ( !EQUAL_VALUES )   result[k] = checkData[k]
            })
    return result
} // change func.



module.exports = change


