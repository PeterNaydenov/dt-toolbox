'use strict'


function setupFilter ( flatIO ) {
    return ( name, filterFn )  => flatIO.setupFilter ( name, filterFn )
} // setupFilter func.



export default setupFilter


