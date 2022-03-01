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
            ,  tProps   = {}   // { objectLocation<string> : childObjectNames<set> }
            , structRaw = []   // objectLocation strings
            , propDone  = []
            ;
          keyList.forEach ( (keyArr) => {   // Setup our temp structures: tProps and structRaw
                    keyArr.forEach ( (k,i) => {
                                    let parent = keyArr.slice( 0, i ).join ( '/' );
                                    if ( !parent         )   return
                                    if ( !tProps[parent] ) { 
                                            tProps[parent] = new Set()
                                            structRaw.push ( parent )
                                        }
                                    tProps[parent].add ( k )
                            })
                })
           structRaw.forEach ( (el,i) => {   // Build the structure rows
                                let elChildren = false;
                                if ( !structure[i]    )   structure[i] = [ 'object', i ]
                                if ( propDone[i]      )   el = propDone[i]
                                elChildren = Array.from ( tProps[el] )
                                if ( el === 'root' ) {
                                          const mainType = help.hasNumbers ( elChildren ) ? 'array' : 'object';
                                          structure[i][0] = mainType
                                    }
                                elChildren.forEach ( name => {   // Setup connections between object
                                                        let test = tProps[`${el}/${name}`];
                                                        if ( !test )   return
                                                        let 
                                                              childProps = Array.from (test)
                                                            , type = help.hasNumbers ( childProps ) ? 'array' : 'object'
                                                            , lastIndex = structure.length
                                                            ;
                                                        propDone[lastIndex] = `${el}/${name}`
                                                        structure.push ([type, lastIndex])
                                                        structure[i].push ( [lastIndex, name])
                                                })
                        })

        keyList.forEach ( k => {   // Create flat keys and write values 
                        let 
                              name      = k.pop()
                            , keySearch = k.join ( '/' )
                            , objNumber = null
                            , theKey    = ''
                            ;
                        objNumber = propDone.indexOf ( keySearch )

                        if ( objNumber < 0 )  objNumber = structRaw.indexOf(keySearch)
                        theKey = `root/${objNumber}/${name}`
                        value[theKey] = rawValue[`${keySearch}/${name}`]
                })
        return [ structure, value ]
  } // toFlat func.










function toType ( dependencies, [ structure, value ]) {
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
    } // toType func.



module.exports = { toFlat, toType }


