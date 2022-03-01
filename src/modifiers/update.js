function update ( mainData, update ) {
    for (const updateKey in update ) {
              if ( mainData.hasOwnProperty(updateKey) ) {
                          for (let prop in update[updateKey]) {
                                          if ( mainData[updateKey].hasOwnProperty(prop) ) { 
                                                    mainData[updateKey][prop] = update[updateKey][prop]
                                              }
                                  }
                  }
      }
    return mainData
} // update func.



module.exports = update


