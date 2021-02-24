function different ( mainData, checkData ) {
 // *** Key compare. Returns key/value pairs where key does not exist.
    let
          result   = {}
        , checkKeys = Object.keys ( checkData )
        ;
    checkKeys.forEach ( k => {
                    let HAS_KEY = mainData.hasOwnProperty(k);
                    if ( !HAS_KEY )   result[k] = checkData[k]
            })
    return result
} // different func.



module.exports = different


