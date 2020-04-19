'use strict'

const {
        findType
      , hasNumbers
      , isItPrimitive
      , generateObject
      , generateList  
            } = require ( './help' )


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


function toFlat ( dependencies, d ) {
            let 
                  vBuffer = []             // keep values during key's sanitize procedure
                , rawKeys = d.map ( el => {  // extract keys from files
                                        let arr = el.split('/');
                                         vBuffer.push ( arr.pop() )
                                        return arr
                                })
              , keyList = sanitizeFlat ( rawKeys )
              , rawValue  = keyList.reduce ( (res,k,i)  => {
                                                let arr   = k.split ('/');                                                    
                                                arr.pop ()
                                                res[k] = vBuffer[i]
                                                return res
                                        },{} )
              ;
            return findObjects ( rawValue )
    } // toFlat func.





function findObjects (rawValue) {
        let 
              structure = []
            , value = {}
            , keyList   = Object // provide keyList in order: from larger to smaller 
                            .keys(rawValue)
                            .map ( x => x.split('/')   )
                            .sort ( (a,b) => b.length - a.length)
            , maxLength = keyList[0].length - 1
            , buffer = []
            , resultObjects = []
            , sample = keyList[0]
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
                                        theProps.forEach ( key => {
                                                        let combinedKey = `${k}/${key}`;
                                                        value[`root/${actual+count}/${key}`] = rawValue[combinedKey]
                                                })
                                    })
                    structure.push ( [...record] )
                }       
        return [ structure, value ]
} // findObjects func.
















function sanitizeFlat ( list ) {
            let keys = list.map ( x => [ 'root', ...x].join('/')   )
            let 
                  usedKeys=[]
                , duplicatedKeys= new Set()
                ;
            keys.forEach ( k => {
                            if ( usedKeys.includes(k) ) {
                                        duplicatedKeys.add(k)
                                }
                            else {
                                        usedKeys.push ( k )
                                }
                    })
            for (const marker of duplicatedKeys ) {
                        let counter = 0;
                        keys = keys.map ( k => {
                                            if ( k == marker )   return `${k}/${counter++}`
                                            else                 return k
                                        })
                    }
            return keys
    } // sanitizeFlat func.










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


