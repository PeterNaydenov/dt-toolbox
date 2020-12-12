function prepend ( mainData, update ) {
    // *** Concatinate values for duplicated props.
             for (const updateKey in update ) {
                     if ( mainData[updateKey] ) {
                                 for (let prop in update[updateKey]) {
                                                 const val = mainData[updateKey][prop];
                                                 if ( val )  mainData[updateKey][prop] = update[updateKey][prop] + val
                                                 else        mainData[updateKey][prop] = update[updateKey][prop]
                                         }
                         }
                 }
             return mainData
    } // prepend func.



module.exports = prepend


