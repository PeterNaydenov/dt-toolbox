'use strict'



function toFlat ( dependencies, d ) {
            let 
                  deepList = []
                , isPrimitve = false
                , value = dependencies.empty ()
                , {
                        findType
                      , isItPrimitive
                      , generateList  
                    } = dependencies.help
                , structure = []
                ;    
            deepList.push ( generateList (0, d)   )
            structure.push ([ findType(d), 0 ])
            for ( let list of deepList ) {
            for ( let [id, k,val ] of list  ) {
                                isPrimitve = isItPrimitive ( val )
                                if ( isPrimitve )   value [`root/${id}/${k}`] = val
                                else  {             
                                                    let j = structure.length;
                                                    structure[id].push ([j,k])
                                                    deepList.push ( generateList(j,val) )
                                                    structure.push ([ findType(val), j])
                                    }
                }}
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


