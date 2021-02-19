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

function toFlat ( dependencies, rawValue ) {
          if ( Object.keys(rawValue).length === 0 ) {
                    let 
                          structure = [ [ 'object', 0 ]   ]
                        , value = {}
                        ;
                    return [ structure, value ]
              }
          let
                { help }   = dependencies
              , structure  = []
              , value      = {}
              , keyList    = Object               // Provides keys in order: from larger to shorter 
                                .keys ( rawValue )
                                .map ( x => x.split('/')   )
                                .sort ( (a,b) => b.length - a.length   )
              , maxLength  = keyList[0].length
              , buffer     = []                  // List contains items(generators). Item contain props organized by specific deepness
              , objectList = []                  // Array of objects. Object looks like this - { key: propNames[]}
              , deepList   = []
              , rootObjectNames = []             // Collection of all property names for objects. Evaluate 'root' object type on this.
              ;
          for (let i=maxLength-1; i >= 0; i--) {  // separate keys on deep levels
                            let selectedKeys = keyList.filter ( k => k.length == i+1 );
                            buffer.push ( help.generateObject(selectedKeys)   )
                }
          objectList = buffer.map ( x => x.next().value ).reverse ()   // organize keys as objects in right order
          deepList = objectList.map ( (item,i) => help.generateList (i, item) )

          for ( let list of deepList ) {
          for (let [id, objName, val] of list ) {   // example:  [ 0, 'root', [ 'name', 'age']   ]
                          let 
                                splitName     = objName.split ( '/' )
                              , splitSize     = splitName.length
                              , shortObjName  = splitName[splitSize-1]
                              , structSize    = structure.length
                              , emptyObjects  = id - structSize-1
                              , EMPTY_OBJECTS = emptyObjects > 0
                              , type = help.hasNumbers ( val ) ? 'array' : 'object'
                              ;
                          if ( EMPTY_OBJECTS ) {
                                  for ( let i=0; i <= emptyObjects; i++ ) {
                                              structure.push ( [type, i ])
                                              if ( i > 0 ) {  
                                                    structure[i-1].push ([i, splitName[i]])
                                                    rootObjectNames.push ( splitName[i] )
                                                }
                                      }
                                  structSize = structure.length
                              } 
                          else {
                                  structure.push ([type, structSize])
                                  structSize = structure.length
                                  if ( id > 1 ) {
                                              structure[id-2].push ([structSize-1, shortObjName])
                                              rootObjectNames.push ( shortObjName )
                                          }
                              } 
                          type = help.hasNumbers ( rootObjectNames ) ? 'array' : 'object'   // Evaluate 'root' object type
                          structure[0][0] = type   
                          for (let prop of val) {
                                      value [`root/${structSize-1}/${prop}`] = rawValue[`${objName}/${prop}`]
                                }
              }} // for deepList
          return [ structure, value ]
  } // toFlat func.










function toModel ( dependencies, [ structure, value ]) {
            let 
                keys = Object.keys ( value )
              , breadcrumbObject = {}
              , flatNames = {}
              ;
            structure.forEach ( ([type, id, ...items]) => {   // Create data-structures
                                    items.forEach ( item => { 
                                                let 
                                                      [num,name] = item
                                                    , breadcrumbName = name
                                                    , checkID = id
                                                    ;
                                                for (let i=id; i >= 0; i-- ) {
                                                        let [type,x,...items] = structure[i];
                                                        items.forEach ( ([n,name]) => {
                                                                      if ( n === checkID ) {
                                                                                  breadcrumbName = `${name}/${breadcrumbName}`
                                                                                  checkID = x
                                                                          }
                                                                })
                                                    }
                                                flatNames[num] = breadcrumbName
                                        })
                            })
            keys.forEach ( key => {  // Conect data-structures
                                let  
                                      keyArray = key.split('/')
                                    , breadcrumbKey = keyArray[1]
                                    , breadcrumb = flatNames [ breadcrumbKey ]
                                    ;
                                if ( breadcrumbKey == '0' ) {
                                        keyArray = keyArray.filter ( (segment,i) => i!=1   )  
                                    }
                                else {
                                        keyArray[1] = breadcrumb
                                    }
                                breadcrumbObject [ keyArray.join('/') ] = value [key]    
                            })
            return breadcrumbObject
    } // toModel func.



module.exports = { toFlat, toModel }


