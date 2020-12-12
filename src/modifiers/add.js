function add ( mainData, update ) {
    for (const updateKey in update ) {
                let   selectObject =   mainData[updateKey];
                if ( !selectObject )   mainData[updateKey] = { ...update[updateKey] }
                else {
                            for (let prop in update[updateKey]) {
                                            if ( !mainData[updateKey][prop] )   mainData[updateKey][prop] = update[updateKey][prop]
                                    }
                    }
        }
    return mainData
} // add func.



module.exports = add


