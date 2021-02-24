function keyPrefix ( mainData, update ) {
    let 
            keyList            = Object.keys ( mainData )
        , { separationSymbol } = update
        ;
    return keyList.reduce ( (res,k) => {
                                let 
                                    name = k
                                            .substr ( 5 )
                                            .split ( '/' )
                                            .join ( separationSymbol )
                                    ;
                                res[k] = {}
                                let localList = Object.keys ( mainData[k]);
                                localList.forEach ( kk => {
                                                    if ( k == 'root' )   res[k][kk] = mainData['root'][kk]
                                                    else                 res[k][`${name}${separationSymbol}${kk}`] = mainData[k][kk]
                                            })
                                return res
                            }, {})
} // keyPrefix func.



module.exports = keyPrefix


