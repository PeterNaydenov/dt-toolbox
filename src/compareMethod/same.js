function same ( mainData, checkData ) {
 // *** Compare keys. Returns key/value pairs where keys are the same.
    let
          result   = {}
        , mainKeys = Object.keys ( mainData )
        ;
    mainKeys.forEach ( k => {
                    let HAS_KEY = checkData.hasOwnProperty(k);
                    if ( HAS_KEY )   result[k] = checkData[k]
            })
    return result
} // same func.



module.exports = same


