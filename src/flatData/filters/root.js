'use strict'

function root ({name,breadcrumbs}) {
    if ( name === breadcrumbs )   return true
    return false
} // root func.



export default root


