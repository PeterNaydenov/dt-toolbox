'use strict'

function insert ( flat, flitering, getFilterNames ) {
return function insert ( flatData ) {
    const 
          [ indexes, flatStorage ] = flat
        , filterNames = getFilterNames ()
        ;
    flatData.forEach ( line => {
                const [ ,, breadcrumbs ] = line;
                indexes[breadcrumbs] = line
                flatStorage.push ( line )
                filterNames.forEach ( fname => flitering (fname, line )   )
        })
}} // insert func.



export default insert


