const combine =  require ( './combine' );

function mix ( mainData, update ) {
    const host   = update.pop ();
    let   master = {};
    
    master[host] = {...mainData[host]}
    if ( !master['root'] )   master['root'] = {...mainData['root']}

    return update.reduce ( (res,k) => {
                                    let upObj = {};
                                    upObj[host] = {...mainData[k]}
                                    return combine ( res, upObj )
                            }, master )
} // mix func.



module.exports = mix


