function attach ( dependencies, me ) {
    const
         { convert, location } = dependencies
       , mainData  = convert.to ( 'midFlat', dependencies, [ me.structure, me.value ]   )
       , { result }  = me._select
       ;
       
    if ( !result )   return me
    for ( k in result ) {
                newKey = k.replace ( 'root', location )
                if ( mainData[newKey] )  mainData[newKey] = { ...mainData[newKey],...result[k] } // Merge two objects
                else                     mainData[newKey] = { ...result[k]}
        } // for k
    return convert.from ( 'midFlat').toFlat ( dependencies, mainData )
} // attach func.



module.exports = attach


