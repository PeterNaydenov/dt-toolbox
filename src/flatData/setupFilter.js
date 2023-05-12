'use strict'

function setupFilter ( flatStorage, filterFn, filtering, getFilterNames ) {
return function setupFilter ( name, fn ) {
        const 
              filterNames = getFilterNames ()
            , [,, flatData ] = flatStorage
            ;
        if ( filterNames.includes( name )) {
                    console.error ( `Filter name "${name}" is already defined` )
                    return this
            }
        filterFn[name] = fn
        flatData.forEach ( line => filtering ( name, line ))
}} // setupFilter func.



export default setupFilter


