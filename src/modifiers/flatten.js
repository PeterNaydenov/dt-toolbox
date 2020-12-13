function flatten ( mainData, update ) {
    let keyList = Object.keys ( mainData );
    return keyList.reduce (  (res,k) => {
                                    res['root'] = { ...mainData[k], ...res['root'] }
                                    return res
                                }, {} )
} //flatten func.



module.exports = flatten


