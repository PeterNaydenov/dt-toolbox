function insert ( mainData, update ) {
    // *** Objects(midFlat) will be converted to arrays of values. Value will contain the collection of all values ( mainData and update)
          for (const updateKey in update ) {
                          let 
                                mainVals   = Object.values ( mainData[updateKey])
                              , updateVals = Object.values ( update[updateKey] )
                              , mixed      = mainVals.concat ( updateVals )
                              ;
                          mainData[updateKey] = mixed.reduce ( (r,item,i) => {
                                                              r[i] = item
                                                              return r
                                              }, {} )
              }
          return mainData
    } // insert func.



module.exports = insert


