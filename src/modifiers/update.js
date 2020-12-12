function update ( mainData, update ) {
    for (const updateKey in update ) {
              if ( mainData[updateKey] ) {
                          for (let prop in update[updateKey]) {
                                          if ( mainData[updateKey][prop] )   mainData[updateKey][prop] = update[updateKey][prop]
                                  }
                  }
      }
    return mainData
} // update func.



module.exports = update


