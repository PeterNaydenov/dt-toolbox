'use strict'




function copy ( dependencies, flatIO ) {
return function copy ( name = 'root' ) {
        // Reject invalid types with a clear error.
        // Before the fix, copy(null)/copy(42) returned null silently while
        // copy(undefined) returned the root — inconsistent.
        if ( name !== undefined && typeof name !== 'string' ) {
                throw new Error ( `copy(name) expects a string segment name or no argument. Got: ${typeof name} (${name}).` )
            }
        // dt-objects don't store a second copy of the original data. It's rebuilt from the
        // segment's dt-lines. Before v.8.0.0 a full copy was kept in memory for every dt-object
        // and returned wrong data for 'midFlat' input (only the root values).
        const lines = flatIO.export ( name );
        if ( lines.length === 0 )   return null
        return dependencies ().convert.to ( 'std', dependencies, lines )
}} // copy func.



export default copy


