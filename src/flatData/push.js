'use strict'


function push ( selectionIx ) {
return function push ( target, val ) {
        const line = selectionIx[target] ? selectionIx[target][1] : false;

        if ( !line                     )   return this
        if ( !(line instanceof Array)  )   return this
        if ( typeof value === 'object' )   return this
        line.push ( val )
        return this
}} // push func.



export default push


