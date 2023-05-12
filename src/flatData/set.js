'use strict'



function set ( selection, selectionIx ) {
return function set ( name, data ) {
        const
              isArray = ( data instanceof Array )
            , newRecord = []
            ;

        newRecord.push (name)
        if ( isArray )   newRecord.push ( [...data] )
        else             newRecord.push ( {...data} )
        newRecord.push ( name )
        newRecord.push ( [] )
        selection.push ( newRecord )
        selectionIx[name] = newRecord
        return this
}} // set func.



export default set


