'use strict'

function listObject ({name,flatData}) {
    if ( flatData instanceof Array )   return false
    if ( !isNaN(name)             )   return true
    return false
} // listObject func.



export default listObject


