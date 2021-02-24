const update = require("../modifiers/update")

function updateSelection ( [...selection], updates ) {
    updates.forEach ( key => {
                if ( !selection.includes(key) )   selection.push ( key )
            })
    return selection
} // updateSelection



module.exports = updateSelection


