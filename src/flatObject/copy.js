'use strict'



function copy ( dependencies, flatIO ) {
return function copy ( name = 'root' ) {
        // Reject invalid types with a clear error.
        // Before the fix, copy(null)/copy(42) returned null silently while
        // copy(undefined) returned the root — inconsistent.
        if ( name !== undefined && typeof name !== 'string' ) {
                throw new Error ( `copy(name) expects a string segment name or no argument. Got: ${typeof name} (${name}).` )
            }
        const
               c = flatIO.getCopy (name)
            ,  { walk } = dependencies ()
            ;
        if ( !c )   return null
        return walk ({ data : c })
}} // copy func.



export default copy


