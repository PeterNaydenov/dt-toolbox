'use strict'

function setupFilter ( flatIO ) {
/**
 * @function setupFilter
 * @param {string} name - name of the filter
 * @param {function} filterFn - filter function
 * @returns {void}
 */
return function setupFilter ( name, filterFn ) {
        flatIO.setupFilter ( name, filterFn )
}} // setupFilter func.



export default setupFilter


