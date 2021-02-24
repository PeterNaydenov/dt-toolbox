function missing ( mainData, checkData ) {
 // *** Key compare. Returns key/value pairs that are missing
    let
          result   = {}
        , mainKeys = Object.keys ( mainData )
        ;
    mainKeys.forEach ( k => {
                    let HAS_KEY = checkData.hasOwnProperty(k);
                    if ( !HAS_KEY )   result[k] = mainData[k]
            })
    return result
} // missing func.



module.exports = missing


