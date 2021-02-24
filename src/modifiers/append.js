function append ( mainData, update ) {
    // *** Concatinate values for duplicated props.
             for (const updateKey in update ) {
                     if ( mainData[updateKey] ) {
                                 for (let prop in update[updateKey]) {
                                                 if ( mainData[updateKey][prop] )   mainData[updateKey][prop] += update[updateKey][prop]
                                                 else                               mainData[updateKey][prop]  = update[updateKey][prop]
                                         }
                         }
                 }
             return mainData
    } // append func.



module.exports = append


