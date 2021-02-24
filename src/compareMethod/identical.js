function identical ( mainData, checkData ) {
  // *** Compare values. Reduce data to identical key/value pairs.
    let
          result     = {}
        , mainKeys   = Object.keys ( mainData )
        ;
    mainKeys.forEach ( k => {
            let
                  HAS_KEY = ( checkData.hasOwnProperty(k) )
                , EQUAL_VALUES = HAS_KEY && ( mainData[k] === checkData[k] )
                ;
                if ( EQUAL_VALUES )   result[k] = mainData[k]
        })
    return result
} // identical func.



module.exports = identical


