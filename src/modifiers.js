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
 } // mixMidFlat



 module.exports = modifier


