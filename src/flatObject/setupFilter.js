'use strict'

function setupFilter ( flatIO ) {
return function setupFilter ( name, filterFn ) {
        flatIO.setupFilter ( name, filterFn )
}
} // setupFilter func.



export default setupFilter


