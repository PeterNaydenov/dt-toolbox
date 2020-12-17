const 
      combine = require ('./combine')
    , separator = ';'
    ;


function flatten ( mainData ) {
    let keyList = Object
                     .keys ( mainData )
                     .filter ( x => x != 'root' );

    let flatter =  keyList.reduce ( (res,k) => {
                                let update = { 'root': {...mainData[k]} }
                                return combine ( res, update )
                },{ 'root': {...mainData['root']}})

    let flatterKeyList = Object
                          .keys ( flatter )
                          .filter ( x => x != 'root' );

    return flatterKeyList.reduce ( (res,k) => {
                            let 
                                  key = k.split ('/')[1]
                                , val = ''
                                ;
                            for ( prop in flatter[k]) {
                                    if ( val )   val += separator
                                    val += flatter[k][prop]
                                }
                            res['root'][key] = val
                            return res
                    }, {'root':{...flatter['root']}})
} //flatten func.



module.exports = flatten


