'use strict'



function set ( selection, selectionIx ) {
return function set ( name, data ) {
        const
              isArray = ( data instanceof Array )
            , parent  = name.includes ( '/' ) ? selectionIx[ name.slice ( 0, name.lastIndexOf ( '/' ) ) ] : null
            , isPath  = ( parent != null )   // A path like 'root/users/0/tags' with existing parent sets the dt-line on this place
            , newRecord = []
            ;
        let flatData;

        // Match the deepCopy semantics in the standard convertor so strings,
        // numbers, booleans, null and undefined stay intact instead of being
        // spread (which would char-index a string into {0:'n',1:'e',...}).
        if ( data === null || data === undefined || typeof data !== 'object' ) {
                flatData = data
            }
        else if ( isArray )   flatData = [...data]
        else                  flatData = {...data}

        if ( isPath && selectionIx[name] ) {   // The path exists: replace the data, keep the children
                selectionIx[name][1] = flatData
                return this
            }

        newRecord.push ( isPath ? name.slice ( name.lastIndexOf ( '/' ) + 1 ) : name )   // Name of a path is its last segment
        newRecord.push ( flatData )
        newRecord.push ( name )   // Breadcrumbs. For a path - the path itself
        newRecord.push ( [] )
        selection.push ( newRecord )
        selectionIx[name] = newRecord

        if ( isPath && !parent[3].includes ( name ) )   parent[3].push ( name )   // Attach to the parent dt-line
        return this
}} // set func.



export default set


