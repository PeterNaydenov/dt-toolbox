'use strict'


function fr ( flatIO ) {
return function fr ( breadcrumbs ) {
        const 
              indexes = flatIO.getIndexes ()
            , start   = indexes[breadcrumbs]
            , list    = []
            ;

        if ( !start ) {  
                flatIO.setupScanList ( [] )
                return this
           }
        list.push ( start )
        findDeep ( indexes, list, start[3] )
        flatIO.setupScanList ( list )
        return this
}} // fr func.


function findDeep ( indexes, list, ls ) {
    ls.forEach ( br => {
                    const line = indexes[br];
                    if ( !line )   return
                    list.push ( line )
                    findDeep ( indexes, list, line[3] )
            })
} // findDeep func.



export default fr


