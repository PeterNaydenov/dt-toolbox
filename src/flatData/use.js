'use strict'



function use ( flatIO ) {
return function use ( name ) {
        const filter = flatIO.getFilters()[name];
        if ( filter )   flatIO.setupScanList ( filter )
        return this
}} // use func.



export default use


