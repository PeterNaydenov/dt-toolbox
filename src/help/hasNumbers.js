function hasNumbers ( arr ) {
    return !arr.every ( el => {
                    const r = Number(el);
                    if ( r === 0 )   return false
                    if ( r       )   return false
                    return true
                })
} // hasNumbers func.



module.exports = hasNumbers


