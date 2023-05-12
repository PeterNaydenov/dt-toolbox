'use strict'



function copy ( dependencies, flatIO ) {
return function copy ( name = 'root' ) {
        const 
               c = flatIO.getCopy (name)
            ,  { walk } = dependencies ()
            ;            
        if ( !c )   return null
        return walk ({ data : c })
}} // copy func.



export default copy


