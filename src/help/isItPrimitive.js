function isItPrimitive (d) {
    if     ( typeof d == 'function' )     return true // it's not really primitive but we want function to be treated as primitive
    return ( typeof d != 'object'   )  ?  true : false
} // isItPrimitive func.



module.exports = isItPrimitive


