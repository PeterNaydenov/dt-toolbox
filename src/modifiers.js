// NOTE: modifiers require a midFlat format for mainData and update

const modifier = {
    add ( mainData, update ) {
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
 
 
 
   , update ( mainData, update ) {
             for (const updateKey in update ) {
                       if ( mainData[updateKey] ) {
                                   for (let prop in update[updateKey]) {
                                                   if ( mainData[updateKey][prop] )   mainData[updateKey][prop] = update[updateKey][prop]
                                           }
                           }
               }
             return mainData
       } // update func.
 
 
 
   , overwrite ( mainData, update ) {
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
     
 
   
   , insert ( mainData, update ) {
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



   , append ( mainData, update ) {
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



   , prepend ( mainData, update ) {
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
    
 } // mixMidFlat



 module.exports = modifier


