'use strict'


function save ( selectionIx ) {
return function save ( target, key, value ) {
        const lineData = selectionIx[target] ? selectionIx[target][1] : false;
        if ( !lineData     )   return this
        if ( lineData[key] )   return this
        lineData[key] = value
        return this
}} // save func.



export default save


