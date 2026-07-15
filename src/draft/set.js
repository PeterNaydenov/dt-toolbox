'use strict'



function set ( selection, selectionIx ) {
return function set ( name, data ) {
        const
              isArray = ( data instanceof Array )
            , newRecord = []
            ;

        newRecord.push (name)
        // Match the deepCopy semantics in the standard convertor so strings,
        // numbers, booleans, null and undefined stay intact instead of being
        // spread (which would char-index a string into {0:'n',1:'e',...}).
        if ( data === null || data === undefined || typeof data !== 'object' ) {
                newRecord.push ( data )
            }
        else if ( isArray )   newRecord.push ( [...data] )
        else                  newRecord.push ( {...data} )
        newRecord.push ( name )
        newRecord.push ( [] )
        selection.push ( newRecord )
        selectionIx[name] = newRecord
        return this
}} // set func.



export default set


