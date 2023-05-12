'use strict'

function insert ( flat, flitering, getFilterNames ) {
return function insert ( d ) {
    const 
          [ copy,, flatData ] = d
        , name = flatData[0][0]
        , [ copies, indexes, flatStorage ] = flat
        , filterNames = getFilterNames ()
        ;
    copies [ name ] = copy
    flatData.forEach ( line => {
                const [ ,, breadcrumbs ] = line;
                indexes[breadcrumbs] = line
                flatStorage.push ( line )
                filterNames.forEach ( fname => flitering (fname, line )   )
        })
}} // insert func.



export default insert


