function overwrite ( mainData, update ) {
    for (const updateKey in update ) {
            let selectObject = mainData[updateKey]
            if ( !selectObject )   mainData[updateKey] = {...update[updateKey]}
            else {
                        for (let prop in update[updateKey]) {
                                        mainData[updateKey][prop] = update[updateKey][prop]
                                }
                }
        }
    return mainData
} // overwrite func.



module.exports = overwrite


