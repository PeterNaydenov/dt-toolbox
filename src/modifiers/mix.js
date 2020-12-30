const combine = require('../lib/combine');
const combineShallow =  require ( './combineShallow' );

function mix ( mainData, update ) {
    const host   = update.pop ();
    let   master = {};
    
    master[host] = {...mainData[host]}
    if ( !master['root'] )   master['root'] = {...mainData['root']}

    return update.reduce ( (res,k) => {
                                    let 
                                        mainObj = {root:{...res[host]}}
                                      , upObj   = {root: {...mainData[k]}}
                                      ;
                                    res[host] = combineShallow ( mainObj, upObj ).root
                                    return res
                            }, master )
} // mix func.



module.exports = mix


