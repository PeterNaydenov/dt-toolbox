'use strict'

function tuplesToBreadcrumbs ( dependencies, data ) {
    const { walk } = dependencies;
    let result = {};

    function objectCalls (obj, breadcrumbs ) {
                    if ( breadcrumbs === 'root' )   return obj;   // ignore root object
                    let [ key, val ] = obj;
                    result[key] = val
                    return obj
       } // objectCalls func.

    walk ( data, [null,objectCalls])
    return result
} // tuplesToBradcrumbs func.



module.exports = tuplesToBreadcrumbs


