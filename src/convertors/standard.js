'use strict'



function toFlat ( dependencies, d ) {
            let 
                  value       = dependencies.empty ()
                , walk        = dependencies.walk
                , { findType } = dependencies.help
                , structure = []
                , objectCounter = 0
                , currentObjectID = 0
                , objectIndex = {}
                ;

            function objectCalls (obj, breadcrumbs ) {
                      let 
                          location = breadcrumbs.split ( '/' )
                        , objectName = location.pop()
                        ;

                      structure.push ( [findType(obj), objectCounter])
                      objectIndex[breadcrumbs] = objectCounter
                      currentObjectID = objectCounter

                      if ( location.length > 0 ) {  
                                let 
                                    hostName = location.join ( '/' )
                                  , hostID   = objectIndex[hostName]
                                  ;
                                structure[hostID].push ([objectCounter, objectName])
                          }
                          
                      objectCounter++
                      return obj
                } // objectCalls func.

            function keyCalls ( v,k,breadcrumbs ) {
                      value[`root/${currentObjectID}/${k}`] = v
                      return v
                } // keyCalls func.

            walk ( d, [keyCalls, objectCalls])
            return [ structure, value ]
    } // getFlat func.










function toType ( dependencies, [ structure, value ]) {
            let 
                keys = Object.keys ( value )
              , resultObjects = []
              , resultMap = {}
              ;

            structure.forEach ( ([type, id, ...items]) => {   // Create data-structures
                                    let local;
                                    if ( type == 'array' )   local = []
                                    else                     local = {}
                                    
                                    let selectedKeys = keys.filter ( k => k.includes(`root/${id}/`));
                                    selectedKeys.forEach ( k => {   // Fill with primitive data
                                                            let 
                                                                  arr      = k.split ( '/' )
                                                                , propName = arr [arr.length-1]
                                                                ;
                                                            local [propName]  = value[k]
                                                    })
                                    resultMap [id] = resultObjects.length
                                    resultObjects.push ( local )
                            })
                            
            structure.forEach ( ([ , id, ...items]) => {  // Conect data-structures
                                    items.forEach ( ([link, propName]) => {
                                                    link = Number(link) || link;
                                                    let location = resultMap[link];
                                                    resultObjects[id][propName] = resultObjects[ location ]
                                            })
                            })
                            
            return resultObjects[0]
    } // toType func.













module.exports = { toFlat, toType }


