'use strict'



function toFlat ( dependencies, d ) {
    let 
          deepList = []
        , isPrimitve = false
        , result = dependencies.empty ()
        ;    
    deepList.push ( generateList (`root`, d)   )
    for ( let list of deepList ) {
    for ( let [k,val] of list  ) {
                        isPrimitve = isItPrimitive ( val )
                        if ( isPrimitve )   result [k] = val
                        else                deepList.push ( generateList(k,val) )
        }}
    return result
} // getFlat func.










function toStandard ( flat ) {
    let
      flatKeys   = Object.keys ( flat ).sort ((a,b) => b.split('/').length-a.split('/').length)
    , flatKeyArr = flatKeys.map ( x => x.split('/') ) 
    , maxLenght = flatKeyArr[0].length - 1
    , ls = []             // Level definitions generators
    , resultObjects = {}  // Objects ready to build
    ;

    for ( let i=maxLenght; i >= 0; i-- ) {   // organize keys by deepLevels
                let selectedKeys = flatKeyArr.filter ( x => x.length == i + 1 );
                ls.push ( generateObject (selectedKeys)   )
        }
    for ( let deepLevel in ls ) { // createObjects
                const level = ls[deepLevel].next().value;
                for (let k in level ) {
                            let type = defineStructure ( level[k] );   // object | array
                            resultObjects[k] = ( type == 'array' ) ? [] : {}
                            level[k].forEach ( key => {
                                                let combinedK = `${k}/${key}`
                                                if ( type == 'array' )   resultObjects[k].push ( flat[combinedK] )
                                                else                     resultObjects[k][key] = flat[combinedK]
                                    })
                    } // for level
        } // for ls

    let 
          gLevelList = generateLevelList ( maxLenght, resultObjects )
        , levels = [...gLevelList.next().value ]
        ;
    levels.forEach ( level => {
    level.forEach ( item => {
                            let param = item.split ( '/' )
                            , k = param.pop()
                            , selected
                            , combinedK
                            ;

                            if ( param.length == 0 )   return
                            else {
                                        selected = param.join('/')
                                        combinedK = `${selected}/${k}`
                                }
                            resultObjects [selected][k] = resultObjects[combinedK]
        }) 
        })
    return resultObjects['root']
} // getStandard func.



function sanitizeFlat ( obj ) {
        return Object.keys(obj).reduce ( (r,k) => {
                                let newK = k;
                                if ( !k.includes('root/') )   newK = `root/${k}`
                                r [newK] = obj[k]
                                return r
                    },{})
    } // sanitizeFlat func.


function defineStructure ( keyNames ) {
let num = false;
keyNames.forEach ( key => {
                        let test = /^[0-9]+$/ ;
                        if ( key.match(test) )   num = true
            })
return num ? 'array' : 'object'
} // defineStructure func.



function isItPrimitive (d) {
if     ( typeof d == 'function' )  return false
return ( typeof d != 'object'   )  ?  true : false
} // isItPrimitive func.



function* generateList ( kPrefix, val) {
    for ( let k in val ) {
            yield [ `${kPrefix}/${k}`, val[k] ]
        }
} // generateList func*.



function* generateObject ( kList ) {
    let 
          places = {}
        , usedObjKeys = new Set()
        ;
    for ( let el of kList ) {
                let 
                      key = el.pop()
                    , objKey = el.join('/') 
                    ;
                if ( usedObjKeys.has(objKey) ) {
                            places[objKey].push ( key )        
                    }
                else {
                            usedObjKeys.add ( objKey )
                            places[objKey] = []
                            places[objKey].push ( key )
                    }   
        } // for kList
    yield places
} // generateObj



function* generateLevelList ( max, object ) {
let result = []
for ( let i=0; i <= max; i++ ) {
            let keyList = Object.keys ( object ).filter ( k=> k.split('/').length==i );
            if ( keyList.length > 0 )   result.push ( keyList )
    }
yield   result
}  // generateParamList func*.





module.exports = { toFlat, toStandard }


