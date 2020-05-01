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
 *   Looks like breadcrumbs but last element is the value. Key and value together.
 * 
 */



function toFlat ( dependencies, rawValue) {
        let 
              structure = []
            , value = {}
            , keyList   = Object // provide keyList in order: from larger to shorter 
                            .keys ( rawValue )
                            .map ( x => x.split('/')   )
                            .sort ( (a,b) => b.length - a.length)
            , maxLength = keyList[0].length - 1
            , buffer = []
            , resultObjects = []
            , deepList = []
            , help = dependencies.help
            ;
        for (let i=maxLength; i >= 0; i--) {  // separate keys on deep levels
                   let selectedKeys = keyList.filter ( k => k.length == i+1 );
                   buffer.push ( help.generateObject(selectedKeys)   )
            }
        resultObjects = buffer.map ( x => x.next().value ).reverse ()   // organize keys as objects in right order
        deepList.push ( help.generateList ( 0, resultObjects)   )

        let 
              test = Object.keys(rawValue).map(x => x.split('/')[1])
            , type = help.hasNumbers(test) ? 'array' : 'object'
            ;
        structure.push ( [type, 0])
        for ( let list of deepList ) {
        for (let [id, none, val] of list ) {
                       for (let v in val ) {
                                  let 
                                      name = v.split('/').pop()
                                    , j = structure.length
                                    ;
                                  type = help.hasNumbers ( val[v] ) ? 'array' : 'object'
                                  if ( name != 'root' ) {
                                          structure.push ([ type, j])
                                          structure[id].push ( [j,name] )
                                    }
                                  for (let prop in val[v]) {
                                              let composedK = `${val[v][prop]}`
                                              value [`root/${j}/${composedK}`] = rawValue[`${v}/${composedK}`]
                                        }
                          } // for val
            }} // for deepList
          return [ structure, value ]
  } // toFlat func.









// TODO: Need attention... Not checked
function toFormat ([ structure, value ]) {
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
    } // toFormat func.













module.exports = { toFlat, toFormat }


