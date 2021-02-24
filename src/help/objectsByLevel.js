function objectsByLevel ( structure ) {
    return structure.reduce ( (res,row) => {
                        let level = [];
                        row.forEach ( (item,i) => {
                                    if ( i > 1 )   level.push ( item[0] )
                                })
                        if ( level.length > 0  )   res.push ( level )
                        return res
                },[[0]] );
} // objectsByLevel func.



module.exports = objectsByLevel


