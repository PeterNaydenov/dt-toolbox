'use strict'



/**
 *  File data structure example:
 *      [
        'rootFolder/profile/name/Peter',
        'rootFolder/profile/age/42',
        'rootFolder/profile/gender/male',
        'rootFolder/logs/log.txt',
        'rootFolder/friends/Dimitar',
        'rootFolder/friends/Stefan',
        'rootFolder/friends/Ivan',
        'rootFolder/friends/Grigor'
        ]
 * 
 *   Looks like breadcrumb but last element is the value. Key and value together.
 * 
 */



function toFlat ( dependencies, rawValue) {
        let 
              structure = []
            , value = {}
            , keyList   = Object // provide keyList in order: from larger to shorter 
                            .keys(rawValue)
                            .map ( x => x.split('/')   )
                            .sort ( (a,b) => b.length - a.length)
            , maxLength = keyList[0].length - 1
            , buffer = []
            , resultObjects = []
            , {
                  hasNumbers
                , generateObject
              } = dependencies.help
            ;
        for (let i=maxLength; i >= 0; i--) {  // separate keys on deep levels
                   let selectedKeys = keyList.filter ( k => k.length == i+1 );
                   buffer.push ( generateObject(selectedKeys)   )
            }
        resultObjects = buffer.map ( x => x.next().value )
        for (let i=maxLength; i >=0; i-- ) {   // build final data
                    let   item = resultObjects[i]
                        , id = structure.length
                        , type = 'object'
                        ;
                    let record = [ type,  id ];
                    Object.keys(item).forEach ( (k,count) => {
                                        let 
                                              prev = id - 2
                                            , actual = id - 1
                                            , theProps = item[k]
                                            ;
                                        record [0] = hasNumbers ( item[k]) ? 'array' : 'object'
                                        let prop = k.split('/').pop()
                                        structure[prev].push([actual+count, prop])
                                        theProps.forEach ( key => {  // setup values
                                                        let combinedKey = `${k}/${key}`;
                                                        value[`root/${actual+count}/${key}`] = rawValue[combinedKey]
                                                })
                                    })
                    structure.push ( [...record] )
                }       
        return [ structure, value ]
} // toFlat func.









// TODO: Need attention... Not checked
function toStandard ([ structure, value ]) {
            let 
                keys = Object.keys ( value )
              , resultObjects = []
              ;
            structure.forEach ( ([type, id, ...items]) => {   // Create data-structures
                                    let local;
                                    if ( type == 'array' )   local = []
                                    else                     local = {}
                                    let selectedKeys = keys.filter ( k => k.includes(`root/${id}`));
                                    selectedKeys.forEach ( k => {   // Fill with primitive data
                                                            let 
                                                                    arr = k.split ( '/' )
                                                                , propName = arr [arr.length-1]
                                                                ;
                                                            local [propName]  = value[k]
                                                    })
                                    resultObjects.push ( local )
                            })
            structure.forEach ( ([type, id, ...items]) => {  // Conect data-structures
                                    items.forEach ( ([link, propName]) => {
                                                    link = Number(link) || link
                                                    resultObjects[id][propName] = resultObjects[link]
                                            })
                            })
            return resultObjects[0]
    } // toStandard func.













module.exports = { toFlat, toStandard }


