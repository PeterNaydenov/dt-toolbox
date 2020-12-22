'use strict'

/*
    DT object & DT Toolbox
    =======================
    
    Version 1.8.0

    History notes:
     - Idea was born on March 17th, 2016.
     - Completely redesigned in September/October, 2016
     - Published on GitHub for first time: January 14th, 2017
     - Compare methods were added: identical, change, same, different, missing. January 29th, 2017
     - Invert selection method was added. February 19th, 2017
     - String format support introduces. April 22th, 2017
     - Works in browsers. December 24th, 2017
*/

const simple = require ( './simple' );   // Simple methods like 'copy' and 'noObject'
let 
       API            // What is possible to do inside the library.
     , exportAPI      // Exported DT.value object methods
     ;



function simpleDT () {
    const
          val = Object.create ( exportAPI )
        , dt  = Object.create ( API )
        ;
              
    dt.value     = val
    dt.structure = { root : 'object' }
    dt.namespace = { root : [] }
    dt._select   = []
    dt._error    = []
    return dt
} // simpleDT func.



function value ( data ) {
  let val = Object.create ( exportAPI )
  if ( data ) {
              let keys     = Object.keys ( data );
              let newKeys  = keys.map ( key => { 
                                                  if ( key.includes('root') ) return key;
                                                  return `root/${key}`
                                             })

             val = keys.reduce ( (res,key,i) => {
                                                      val[newKeys[i]] = data[key]
                                                      return res
                                          }, val )
     }
  return val
} // value func.










let dtlib = {

 // -------------------------------> dtlib : INIT
 init ( data, instructions ) {
 		let result, dt;
        
    if ( data === undefined )   dt = simpleDT ()
    else                       dt = dtlib.scan ( data )

    if ( !instructions )   result = dt
    else                   result = lib._transform ( dt, instructions )

	 	return result
 } // init func.
 


 // -------------------------------> dtlib : LOAD 
 , load (data) {
   // * Load existing DT object
                    if ( !data.namespace || !data.structure ) {
                                data     = value ( data )
                                const st = data.build();
                                data     = dtlib.scan ( st ) 
                        }
          data._select = []
          return data
    } // load func.

 // -------------------------------> dtlib : LOAD	FAST
 , loadFast ( val ) {
   // * Load existing DT without meta calculation
    let result = simpleDT ()
    result.value = val
   
    return result
 }

 // -------------------------------> dtlib : SCAN	
 , scan ( target ) {
   // * Convert any ST object in DT object and return it. 
 	let 
 		  dt        = simpleDT ()
 		, namespace = 'root'
 		;

	  dt.structure['root'] = simple.folderKind ( target )
	  dt.namespace['root'] = []
    
    let find = [{ target, namespace, dt }]
    let complete = false;
    while ( !complete ) {
           find = find.reduce ( (res,search) => {
                                                let update = lib._scan ( search )
                                                res = res.concat ( update )
                                                return res
                        },[])
          if ( find.length == 0 )   complete = true
    }

    return dt
 } // scan func.



 

 // -------------------------------> dtlib : PREPROCESS
 , preprocess ( data, callback ) {
                                    const dt = dtlib.scan ( data );
                                    const r  = callback ( dt.value )
                                    return   dtlib.scan (  exportlib.build.call(r)  )
   } // preprocess func.





 // -------------------------------> dtlib : ADD
 , add ( data, instructions ) {
   // * Adds only non existing DT props. Instructions are handled by lib._transform(dt, instructions )
 			let 
 				  me = this
 				, dt
        , scanData
 				, iterator
 				;
	
 	    dt = dtlib._detectDT ( data )   // convert data to DT object if it's a ST

      if ( !instructions )  scanData = dt
      else                  scanData = lib._transform ( dt, instructions )

      iterator = simple.getIterator ( scanData.value )
      iterator.forEach ( el => {
                    const exists = me.value.hasOwnProperty(el);
                    if ( !exists ) { 
                          const 
                                  val           = scanData.value[el]
                                , namespace     = simple.getPenult ( el )
                                , structureName = simple.removeLast( el )
                                , structure     = scanData.structure [ structureName ]
                                ;
                   
                          me.value [el] = scanData.value [el]
                          if ( !me.namespace.hasOwnProperty(namespace)   )   me.namespace[namespace] = []
                          me.namespace[namespace].push ( el )
                          if ( !me.structure.hasOwnProperty(structureName)   )   me.structure[structureName] = structure
                       } // if !exists
          })
         
 		return me
   } // add func.





 // -------------------------------> dtlib : _detectDT
 , _detectDT ( data ) {   // (ST|DT) -> DT
   // * Detect if data is DT. ST object will be converted to DT
      const 
            dtObject = data.value && data.structure && data._error
          , isDTValue = ( dtObject ) ? true : Object.keys(data)[0].includes ('root')
          ;
      if ( dtObject )    return data  
      if ( isDTValue )   return dtlib.load ( data )
      return dtlib.scan ( data ) 
 }  // detectDT





 // -------------------------------> dtlib : UPDATE
, update ( data, instructions ) {   //   ( any, string ) -> DTtoolbox
  // * Updates only existing DT props
 			let 
 				  me = this
        , dt
 				, scanData
 				, iterator
 				;
	
      dt = dtlib._detectDT ( data )   // convert data to DT object if it's a ST
 			
      if ( !instructions )  scanData = dt
      else                  scanData = lib._transform ( dt, instructions )

      iterator = simple.getIterator ( scanData.value )
 			iterator.forEach ( el => {
 										const exists = me.value.hasOwnProperty(el);
 										if ( exists ) { 
 													const 
                                  val           = scanData.value[el]
 													      , namespace     = simple.getPenult ( el )
 													      , structureName = simple.removeLast( el )
 													      , structure     = scanData.structure [ structureName ]
 													      ;
 												
 													me.value [el] = scanData.value [el]
 										   } // if exists
 			    })
 			return me
   } // update func.





 // -------------------------------> dtlib : OVERWRITE
, overwrite ( data, instructions ) {
 			let 
 				  me = this
        , dt
        , scanData
        , iterator
        ;
	
      dt = dtlib._detectDT ( data )   // convert data to DT object if it's a ST
 			
      if ( !instructions )   scanData = dt
      else                   scanData = lib._transform ( dt, instructions )
 			
      iterator = simple.getIterator ( scanData.value )
 			iterator.forEach ( el => {
 										const exists = me.value.hasOwnProperty(el);
 										me.value [el] = scanData.value [el]
 										if ( !exists ) { 
 													const 
 													        namespace      = simple.getPenult ( el )
 													      , structureName  = simple.removeLast( el )
 													      , structureValue = scanData.structure [ structureName ]
 													      ;

 													if ( !me.namespace.hasOwnProperty(namespace)   )   me.namespace[namespace] = []
 													me.namespace[namespace].push ( el )
 													if ( !me.structure.hasOwnProperty(structureName)   )   me.structure[structureName] = structureValue
 										   } // if !exists
 			    })
 			return me
   } // overwrite func.





 // -------------------------------> dtlib : INSERT
, insert ( data , key ) {
  // * Insert data on specified key, when the key represents an array.
  let 
        me = this
      , dt
      , namespace = me.namespace[key]
      , newValues
      ;

  if ( simple.notObject(data) ) data = [data]
  if ( !namespace ) {
                      me._error.push (  `Insert error: Namespace "${key}" does not exists. Data failed to insert: ${JSON.stringify(data)}`)
                      return me
      }
 
  dt = value(data)

  newValues = dt.valueList()
  newValues.forEach ( item => {
                              let 
                                    num    = namespace.length
                                  , newKey = (key=='root') ? `root/${num}` : `root/${key}/${num}`
                                  ;

                              me.value[newKey] = item
                              me.namespace[key].push ( newKey )
            })

  return me
} // insert func.





 // -------------------------------> dtlib : IDENTICAL
, identical ( data, callback ) {
  // * Compare values. Reduce data to identical key/value pairs.
    let
          me = this
        , dt = this.value
        ;
    
    // NOTE: data should be DT!    

    const dataKeys = simple.getIterator ( data );
    const dtKeys   = simple.getIterator ( dt   );

    const result = dataKeys.reduce ( (res,el) => {
                                                   if ( !dtKeys.includes(el) ) return res
                                                   if ( dt[el] != data[el]   ) return res

                                                   res[el] = data[el]
                                                   return res
                            }, value() )

   callback ( result )
   return me
}  // same func.





 // -------------------------------> dtlib : CHANGE
 , change ( data, callback ) {
   // * Compare values. Reduce data to key/value pairs with different values.
    let
          me = this
        , dt = this.value
        ;
    
    // NOTE: data should be DT!    

    const dtKeys   = simple.getIterator ( dt   );
    const dataKeys = simple.getIterator ( data );

    const result = dataKeys.reduce ( (res,el) => {
                                                   if ( !dtKeys.includes(el) ) return res
                                                   if ( dt[el] == data[el]    ) return res

                                                   res[el] = data[el]
                                                   return res
                            }, value() )

   callback ( result )
   return me   
 } // change func.
 





 // -------------------------------> dtlib : SAME
 , same ( data, callback ) {
   // * Compare keys. Returns key/value pairs where keys are the same.
   let
          me = this
        , dt = this.value
        ;
    
    // NOTE: data should be DT!    

    const dataKeys = simple.getIterator ( data );
    const dtKeys   = simple.getIterator ( dt   );

    const result = dataKeys.reduce ( (res,el) => {
                                                   if ( !dtKeys.includes(el) ) return res

                                                   res[el] = data[el]
                                                   return res
                            }, value() )

   callback ( result )
   return me   

 }






 // -------------------------------> dtlib : DIFFERENT
 , different ( data, callback ) {
   // * Compare keys. Returns key/value pairs where key does not exist.
    let
          me = this
        , dt = this.value
        ;
    
    // NOTE: data should be DT!    

    const dtKeys   = simple.getIterator ( dt   );
    const dataKeys = simple.getIterator ( data );

    const result = dataKeys.reduce ( (res,el) => {
                                                   if ( dtKeys.includes(el) ) return res

                                                   res[el] = data[el]
                                                   return res
                            }, value() )

   callback ( result )
   return me   
 } // different func.
 




 // -------------------------------> dtlib : MISSING
 , missing ( data, callback ) {
   // * Key compare. Returns key/value pairs that are missing'
   let
          me = this
        , dt = this.value
        ;
    
    // NOTE: data should be DT!    

    const dtKeys   = simple.getIterator ( dt );
    const dataKeys = simple.getIterator ( data );

    const result  = dtKeys.reduce ( (res,el) => {
                                                   if ( dataKeys.includes(el) ) return res

                                                   res[el] = dt[el]
                                                   return res
                            }, value() )

   callback ( result )
   return me   
 } // missing func.





 // -------------------------------> dtlib : ERRORLOG
 , errorLog ( callback ) {
  // * Executes callback with errors as argument
                            callback ( this._error )
                            return this
 } // errorLog func.





 // -------------------------------> dtlib : SELECT
, select : function () {
  // * Init new selection
    this._select = []
    return this 
 }





 // -------------------------------> dtlib : SPREAD
, spread ( instruction, callback ) {
  // * Exports DT object
  	 const me = this;
       let selection;

  		switch ( instruction ) {
  			case 'value'   :
  			case 'values'  :
  							selection = me._select.reduce ( (res, el, i) => {
  																  res['root/'+i] = me.value[el]
  																  return res
  							               }, value() )
  							 break
  			case 'st'     :  {
					  		 let set = me._select.reduce ( (res, el) => {
					  											 res[el] = me.value[el]
					  											 return res
					  		          		}, value() )
					  		 selection = exportlib.build ( set )
  			                 }
  							 break
  			case 'asJSON'   :  { // * Returns DT.value as JSON
					  		   let set = me._select.reduce ( (res, el) => {
					  											 res[el] = me.value[el]
					  											 return res
					  		          		       }, {} )
  							   selection = JSON.stringify ( set )
					  		   }
  							     break
  			
        case 'toJSON' : { // * Converts DT.value to ST object and returns JSON
                               let set = me._select.reduce ( (res, el) => {
                                                                   res[el] = me.value[el]
                                                                   return res
                                              }, value() )
                               selection = JSON.stringify ( set.build() )
                               }
                      break
      case 'key'    : 
  		case 'keys'   : 
  							 selection = me._select.reduce ( (res, el,i) => {
			  													  res[`root/${i}`] = el.replace('root/','') 
			  													  return res
  							               }, value() )
  							        break
  			case 'dt'     : 
  			case 'object' : 
  			default       :
                            selection = me._select.reduce ( (res, el) => {
                                                                 res[el] = me.value[el]
                                                                 return res
                                            }, value() )
  			} // switch instruction
  		
  		callback ( selection )
  		return me
  } // spread func.





// -------------------------------> dtlib : SPREAD ALL
, spreadAll ( instruction, callback ) {
  // * Select all and export DT object with one command
   return this.select().all().spread( instruction, callback )
} // spreadAll func.





// -------------------------------> dtlib : INVERT
, invert () {
  // * Invert existing selection
 const
          me        = this
        , selection = me._select
        , valueKeys = simple.getIterator(me.value)
        ;

  me._select = valueKeys.reduce( (res,item) => {
                        if ( !selection.includes(item) ) res.push(item)
                        return res
                        },[])
  return me
} // invert func.





// -------------------------------> dtlib : FOLDER
, folder ( name, deep ) {
 // * Find if string exists in value attribute name.
	const me = this;
  let 
		   nameDefault = 'root'
		 , deepDefault = 9999
		 , deepMax
		 ;
	
	name = name || nameDefault
	deep = (deep == null) ? deepDefault : deep
	deep =  deep + 1 // because we add default wrapper 'root'
  deepMax = name.split('/').length + deep

  let collection = simple.getIterator ( me.value )
                         .filter ( el => el.match (name) )
                         .reduce ( (res, el) => {
                                                   let elDeep = el.split('/').length
    												                       if ( elDeep <= deepMax ) res.push(el)
    												                       return res
	    						         },[] )
	me._select = me._select.concat ( collection )
	return me
  } // folder func.





// -------------------------------> dtlib : PARENT
, parent ( prop, where ) {
  const me = this;
  let 
		  collection
		, oldList
		;

	oldList = me._select
	// find values
	me._select = []
	me.folder ( prop )

	let findValues = me._select
	// collect object list
	let objects = findValues.reduce ( (r,el) => {
                          let objName = simple.removeLast ( el )
                          if ( r.includes ( objName )   ) return r
													r.push ( objName )
													return r
	                        },[])
	
	// test against 'where' if exists
	if ( where ) {
		objects = objects.reduce ( (r,el) => {
												me._select = []
												me.folder ( el, 0 )
												let objProps = me._select
												let obj = objProps.reduce ( (r,prop) => {
																							let pName = simple.getUlt(prop)
																							let v = me.value[prop]
																							r[pName] = v
																							return r
															       },{} )
												let success = where ( obj )
												if ( success ) r.push(el)
												return r
		                    },[])
	  } // if where

	// create collection
	collection = objects.reduce (  (r,el) => {
												me._select = []
												me.folder ( el )
												return r.concat ( me._select )
							},[])

	me._select = oldList.concat( collection )
	return me
  } // parent func.




 // -------------------------------> dtlib : REMOVE
, remove ( fx ) {
  // * Reduce selected item by testing their values. If pass the test will remove.
  // Filter
    const me = this;
    
    if ( fx === undefined )   return me
    me._select = me._select.reduce ( (res, item ) => {
                                if ( !fx(me.value[item],item) )   res.push ( item )
                                return res
                       },[])
      return me
 } // remove func.





 // -------------------------------> dtlib : KEEP
, keep ( fx ) {
  // * Reduce selected item by testing their values. If pass the test will stay.
  // Filter
    const me = this;
    
    if ( fx === undefined   )   return me
    me._select = me._select.reduce ( (res, item ) => {
                                if ( fx(me.value[item], item) )   res.push ( item )
                                return res
                       },[])
	  return me
  } // keep func.





 // -------------------------------> dtlib : LIMIT
, limit ( num ) {
    // * Limit number of selected items
    // Filter

    this._select = this._select.slice ( 0, num )
	  return this
  } // limit func.
 




 // -------------------------------> dtlib : DEEP
, deep ( num, direction ) {
  // * Direction is 'more' or 'less'. Less is by default. Deep '0' mean root members;
  //   Filter
    
    const 
           me = this
         , deepTest = me._select.map ( el => el.split('/').length )
         , defaultDirection = 'less'
         ;
  
    let testFx;

    if ( !direction ) direction = defaultDirection
    
    if ( direction == 'more') {
                                testFx = el => deepTest[el] > num
                                num = num + 1 // root element is not part of real data.
         }
    else {
                                testFx = el => deepTest[el] < num
                                num = num + 3
         }                      

    me._select = me._select.reduce ( (res,item,i) => {
                                       if ( testFx(i) ) res.push ( item )
                                       return res
                            },[])

	return this
  } // deep func.





// -------------------------------> dtlib : SPACE
, space ( names ) {
  // Fullfil '_select' with namespace members.
  const 
          me = this
        , defaultSpace = ['root']
        ;
  
    if ( names == null            ) names = defaultSpace
    if ( typeof names == 'string' ) names = [ names ]

  let collection = names.reduce ( (res, name) => {
                    let space = me.namespace

                    if ( space.hasOwnProperty(name) ) res = res.concat( space[name] )
                    return res
          }, [] )

   if ( !collection.length == 0 )   me._select = me._select.concat ( collection )
   return me
  } // space func.





// -------------------------------> dtlib : BLOCK
, block ( type ) {
  // * Fullfil '_select' with deepest structure elements
  return function () {
  const 
       me          = this
     , dtStructure = me.structure
     , dtValue     = me.value
     , iStructure  = simple.getIterator ( dtStructure )
     , iValue      = simple.getIterator ( dtValue )
     , find        = type
     ;

  let collection = [];

  const t = lib._reorder ( iStructure )
               .reduce ( (res,item) => {
                                    let notIncluded = false;
                                    if ( dtStructure[item] == find )   notIncluded = res.every ( el => !el.includes(item)   )
                                    if ( notIncluded )   res.push(item)
                                    return res
                           },[])

collection = iValue
               .reduce ( (res,item) => {
                                let notValid = t.every ( el => !item.includes(el) )
                                let isValid = !notValid;

                                if ( isValid ) { 
                                // Deep-key control. Ignores nestled objects/arrays
                                                    let end = false;
                                                    t.forEach ( el => {
                                                            if ( end ) return
                                                            if ( item.includes(el) ) {
                                                                    const size = el.split('/').length + 1;
                                                                    const itemSize = item.split('/').length;
                                                                    
                                                                    isValid = (itemSize == size) ? true : false
                                                                    end = true
                                                                }
                                                       })
                                   }
                                if ( isValid ) res.push ( item)
                                return res
                     },[])

if ( !collection.length == 0 )   me._select = me._select.concat ( collection )
return me
} // return func
} // block func.

} // dtlib 




















let exportlib = {

// -------------------------------> exportlib : MAP
map ( fx ) {
  let 
        me   = this
      , keys = me.keyList ()
      ;

  const result = keys.reduce ( (res,item,i) => { 
                                                  let newKey = fx ( item, i )
                                                  if ( typeof newKey !== 'string'    ) newKey = item
                                                  if ( newKey.indexOf('root/') != 0  ) newKey = `root/${newKey}`
                                                  res[newKey]  = me [ item ]
                                                  return res
                       }, value()  )
  return result
} // map func.



// -------------------------------> exportlib : ASSEMBLE
, assemble () {
// * Removes duplicated path elements LTR and build ST object. Data should look like dt.value
       let 
       		  data = this
       		, paths
       		, getID
       		, result
       		;

       let iterator = simple.getIterator ( data )
   	   if ( iterator.length == 0 ) return data   // finish faster

   	   paths    = iterator
                        .map ( el => el.split('/')   )
                        .map ( el => { 
                                        el.shift(); 
                                        return el;   
                             })
       paths    = lib._reorder ( paths )
       getID    = paths.map ( el => data['root/' + el.join('/')] )
       paths    = lib._removeDuplicates ( paths )
       paths    = lib._ignore ( paths )
       paths.forEach ( path => path.unshift('root') )

       paths    = paths.map ( el => el.join('/')   )
       
       result   = paths.reduce ( (res,item,i) => {
                                                    res[item] = getID[i]
  	   												return res
  	                      }, value () )
  	   return result 
  } // assemble func.






// -------------------------------> exportlib : GET KEYS
, keyList () {  return Object.getOwnPropertyNames ( this )   }
  // * Returns keys list array

, valueList () { return Object.getOwnPropertyNames (this).map ( el => this[el] )     }
  // * Returns value list arrays





// -------------------------------> exportlib : IGNORE KEYS
, ignoreKeys ( level ) {
  // * Remove keys that are not important. Object can become an array.
 const 
          me           = this
        , defaultLevel = 0
        , keyList      = me.keyList()
        ;

 let    counter     = 0
      , removeLevel = (level || defaultLevel) + 1
      , removeList  = [] 
      , result      = value ()
      ;

 keyList.forEach ( item => {
                        let keyArray = item.split('/')
                        let val = keyArray[removeLevel]
                        
                        if ( !removeList.includes(val) ) removeList.push(val)
                        keyArray[removeLevel] = removeList.length-1
                        result[ keyArray.join('/') ] = me[item]
      })

 return result
} // ignoreKeys func.





// -------------------------------> exportlib : CUT
, cut ( number ) {
  // * Cut out number of key elements
  const me = this;
  if ( typeof number !== 'number' ) return me
  function _cut ( x, count ) {
                              let ix = x.indexOf ( '/' )
                              
                              if ( ix == -1    ) count = 0
                              else               count--
                              if ( count  <  1 ) return x.substring(ix+1)
                              let r = _cut ( x.substring(ix+1), count ) 
                              return r
          }
 return me.modifyKeys ( k => `root/${_cut(k,number+1)}`)
} // cut func.





// -------------------------------> exportlib : MODIFY KEYS
, modifyKeys ( callback ) {
  // * Updates object with modified keys.
  const 
      me = this
    , result = simple.getIterator ( me )
                     .reduce ( (res,item,i) => {
                                            const
                                                  value = me[item]
                                                , key = callback ( item )
                                                ;
                                            res[key] = value
                                            return res
                            }, value() )
    ;
    return result
} // modifyKeys func.






// -------------------------------> exportlib : KEEP KEYS
, keepKeys ( callback ) {
    const dt = this;
    let 
          iterator
        , result
        ;

    if ( typeof callback != 'function' ) return dt  // ignore if not a function
    
    iterator = Object.getOwnPropertyNames ( dt ) 
    result = iterator.reduce ( (res, el) => {
                                            let arrayKeys = el.split('/');
                                            let test = callback ( arrayKeys )
                                            if ( test ) res[el] = dt[el]
                                            return res
                                 }, value() )
    return result
} // keepKeys func.





// -------------------------------> exportlib : REMOVE KEYS
, removeKeys ( callback ) {
  // * Forget object keys on required level. Will convert object to array.
    const dt = this;
    let 
          iterator
        , result
        ;

    if ( typeof callback != 'function' ) return dt // ignore if not a function
    
    iterator = Object.getOwnPropertyNames ( dt ) 
    result = iterator.reduce ( (res, el) => {
                                            let arrayKeys = el.split('/');
                                            let test = callback ( arrayKeys )
                                            if ( !test ) res[el] = dt[el]
                                            return res
                                 }, value() )
    return result
  } // removeKeys func.





// -------------------------------> exportlib : KEEP VALUES
, keepValues ( callback ) {
    const dt = this;
    let 
          iterator
        , result
        ;

    if ( typeof callback != 'function' ) return dt

    iterator = dt.keyList()
    result = iterator.reduce ( (res, el) => {
                                            let test = callback ( dt[el] )
                                            if ( test ) res[el] = dt[el]
                                            return res
                                 }, value() )
    return result
} // keepKeys func.





// -------------------------------> exportlib : REMOVE VALUES
, removeValues ( callback ) {
    const dt = this;
    let 
          iterator
        , result
        ;

    if ( typeof callback != 'function' ) return dt

    iterator = dt.keyList()
    result = iterator.reduce ( (res, el) => {
                                            let test = callback ( dt[el] )
                                            if ( !test ) res[el] = dt[el]
                                            return res
                                 }, value() )
    return result
} // keepKeys func.



 // -------------------------------> exportlib : JSON
, json () {
     /* Convert any object to JSON */
     	return JSON.stringify ( this )	
     } // json func.





 // -------------------------------> exportlib : FILE
, file () {
  // * Convert dt to file array
  const me = this;

  let result = me.keyList().reduce ( (res,item) => {
                          const arr = item.split('/')
                          let str = arr.reduce( (r,el) => {
                                        if ( el == 'root'         ) return r
                                        if ( !isNaN(parseInt(el)) ) return r
                                        return r + `/${el}`
                                        },'root')
                          res.push(`${str}/${me[item]}`)
                          return res
                  },[])
  return result
} // file func.





 // -------------------------------> exportlib : KEY-VALUE
, keyValue ( customDivider) {
  // * Returns key-value string
  const 
          me  = this
        , div = customDivider || ''
        , keys = me.keyList()
        ;
  
  let result;
  let ls = me.keyList()

  result = ls
             .map  ( (k,i) => `${k} ${me[ls[i]]}`   )
             .join ( `${div} ` ) + div

  return result       
} // keyValue func.





 // -------------------------------> exportlib : LIST
, list () {
  // * List of items
  const 
          me = this
        , iterator = simple.getIterator(me)
        ;

  let 
         counter = 0
       , result
       ;

  const replaceMap = iterator.reduce ( (res,item) => {
                                    let key = simple.removeLast ( item )
                                    if ( res[key] == undefined )   res[key] = counter++
                                    return res
                              },{})
  result = iterator.reduce ( (res,item) => {
                                const
                                        find   = simple.removeLast ( item )
                                      , it     = simple.getUlt(item)
                                      , newKey = `root/${replaceMap[find]}/${it}`
                                      ;
                                res[ newKey ] = me [ item ]
                                return res
                             }, value() )
  return result
} // list func.





 // -------------------------------> exportlib : BUILD
, build ( data ) {
  // * Calling convertion from DT object to ST object
   	if ( !data ) data = this
    return	lib._build ( data )
  }  // build func.

} // exportlib




















let lib = {
 // * Library that contain core functions 

 _build ( data ) {
    // *** Recursive ST object creation
    const keys = Object.keys ( data ).map ( k => k.split('/'));   // Array of keys as []
    let 
           std    = {}   // Standard object instance
        ,  spaces = []   // Property names on level [1] that are not primitive.
        , keyList = []   // Collection of all property-names for level [0]
        ;

        keys.forEach ( k => {  // Find spaces
                        const key = k[0];
                        // if ( k.length == 1 )   return   // means: it's just a property name
                        if ( !spaces.includes(key) )   spaces.push ( key )
                })
        
        keys.forEach ( k => {   // Find keyList members.
                                                if ( !keyList.includes(k[0]) )   keyList.push ( k[0] )
                                            })
        let isArray = ( isNaN(keyList[0]) ) ? false : true
        if ( isArray ) std = []
       
        spaces.forEach ( sp => {
                        let 
                            model = []
                          , words = keys.reduce ( (res,k) => {
                                                        if ( k[0] != sp       )   return res
                                                        if ( !res.includes(k[1]) )   res.push(k[1])
                                                        return res
                                            },[])
                          ;
                        words.every ( k => {
                                            const x = parseInt(k)
                                            if ( isNaN(x) )   model = {}
                                    })

                        std = words.reduce ( (res,word) => {
                                            const 
                                                  selector = `${sp}/${word}`
                                                , currentSpace = new RegExp ( `^${selector}\/` )
                                                , nfo      = data [ selector ]
                                                , haveNfo  = ( typeof nfo == 'boolean' ) ? true : (nfo != null)
                                                ;
                                            let updateData = keys.reduce ( (res,k) => {   // Data for next iteration of _build 
                                                                                if ( k.length == 2 )   return res
                                                                                let key = k.join ( '/' );
                                                                                if ( key.match(currentSpace) == null )   return res
                                                                                let newKey = k.slice (1);
                                                                                res [ newKey.join('/')] = data[k.join('/')]
                                                                                return res
                                                                },{});
    
                                            if ( haveNfo )   res [word] = nfo
                                            else             res [word] = lib._build ( updateData )
                                            return res
                                        }, model )
                }) // forEach spaces
        return std
  } // _build func.





, _toFolderFile ( target ) {
  // * Find hidden arrays and update keys. Like in folders/files.
     let 
          folderKeys = []
        , duplicates = []
        , counters   = []
        , result
        ;
     
     // Find repeating folder names
     target.forEach ( el => {
                            let file    = el.split('/').pop()
                            let folder = el.replace ( `/${file}`, '' )

                            folderKeys.forEach ( key => {
                                      if ( folder.includes(key) && !duplicates.includes(key) ) { 
                                                duplicates.push ( key )
                                                counters.push ( 0 )
                                          }
                                   })
                            if      ( !folderKeys.includes(folder) )   folderKeys.push ( folder )
                })
     result = target.reduce ( (res,item) => {
                                                let 
                                                     file      = item.split('/').pop()
                                                   , folder   = item.replace(`/${file}`,'')
                                                   , dupIndex = duplicates.findIndex ( el => el == folder )
                                                   ;
                                                if ( dupIndex > -1 ) {
                                                        res[`${folder}/${counters[dupIndex]++}`] = file;
                                                   }
                                                else    res[ folder ] = file
                                                return res
                               }, value() )
     return result;
} //_toFolderFile func.





, _scan ( request ) {
 	// * Convert ST object to DT
   let 
        {target, namespace, dt} = request
      , iterator = simple.getIterator(target)
      ;

   return iterator.reduce ( (res,key) => {
                   let 
                         isPrimitive = simple.notObject(target[key])
                       , location = `${namespace}/${key}`
                       ;

                    if ( isPrimitive ) {
                                          dt.value[location] = target[key]
                                          const name = simple.getUlt (namespace )
                                          dt.namespace[name].push(location)
                                          return res
                         }
                    else {
                                         dt.structure[location] = simple.folderKind ( target[key] )
                                         if ( !dt.namespace.hasOwnProperty(key)   )   dt.namespace[key] = []
                                         let result = { target : target[key], namespace: location, dt }
                                         res.push(result)
                                         return res
                         }
            },[]) // map key
} // _scan func.




, _transform ( dt,instructions ) {
  // * Transformer for DT object. Reverse object key and values, or get only keys/values
    let 
          dtValue = dt.value
        , result
        ;

    switch ( instructions  ) {
                             case 'reverse':
                                              result = dtValue.keyList().reduce ( (res,item) => {
                                                                                    let value = dt.value[item];
                                                                                    res[value] = item
                                                                                    return res
                                                             },{})
                                              break
                             case 'key':
                             case 'keys':
                                              let list = dtValue.keyList ()
                                              {

                                                let temp = list.reduce ( (res,item) => {
                                                                                        res[item] = item.replace ( 'root/','')
                                                                                        return res
                                                             },{})
                                                result = exportlib.build(temp)
                                              }
                                              break
                             case 'value' :
                             case 'values':
                                              const 
                                                    temp = lib._toFolderFile  ( dtValue.valueList().map(el=>`root/${el}`) )
                                                  , next = simple.getIterator ( temp )
                                                                 .reduce ( (res,el) => {
                                                                                           let 
                                                                                                val = temp[el]
                                                                                              , isNumber = isNaN ( parseInt(val)) ? false : true
                                                                                              , newKey  = ( isNumber ) ? `${el}/0` : `${el}/${val}`
                                                                                              ;
                                                                                           res[newKey] = val
                                                                                           return res
                                                                               },{})
                                                  ;
                                              result = exportlib.build ( next )
                                              break
                             case 'file'    :
                             case 'files'   :
                             case 'folders' :
                             case 'folder'  :
                                              // Value and key in one '/' separated string. Last element will become a value
                                              result = lib._toFolderFile ( dtValue.valueList().map(el=>`root/${el}`)  ).build()
                                              break
                             default:
                                              result = {}
                       } //   switch instructions
    dt = dtlib.scan ( result )
    return dt
  } // _transform func.





, _removeDuplicates ( paths ) {
  // * Remove common elements in list of paths. Paths are arrays here.
	   let 	names, word , equal;

       if ( paths[0].length == 1 )  return paths

       names = paths.map ( el => el[0] )
       word  = names[0]

       equal = names.every ( el => el == word )
       
       if ( equal ) {
                        paths.forEach ( path => path.shift()  )
                        lib._removeDuplicates ( paths )
            }
      
       return paths
  } // _removeDuplicates func.





, _reorder ( paths, ix ) {
   // * Rearange order in path array
   		let result = [];
   		
      ix = ix || 0
   		let max = paths.reduce ( (end,el) =>  el.length > end ? el.length : end, 0 )

   		if ( ix > max ) return paths
   		


   		let possible = paths.reduce ( (res,el) => {
				   									 if ( el.length-1 == ix ) return res
				   									 if ( !el[ix] ) return res
   													 let notFound = res.every ( pr => pr != el[ix] )
   													 if ( notFound ) {
				   													 	res.push ( el[ix] )
   													    }
   													 return res
   		                    }, [])

   		possible.forEach ( option => {
   		paths.forEach    ( path   => {
   										 if ( path[ix] == option ) result.push ( path )
   		     }) })
   		paths.forEach    ( path   => {
   										let notFound = result.every ( pr => pr != path )
   										if ( notFound ) result.push ( path )
   		     })

   		ix++
   		return lib._reorder ( result, ix )
 } // _reorder func.





, _ignore ( paths ) {
  // * Mixes first and second path arguments.
  	 let test,props, name, counter = 0;

	   paths = simple.copy ( paths )
	   props = paths.map ( el => el.pop()   )
	   test  = paths.map ( el => {
	   								if ( el.length == 0 ) return el
	   								let test = el.join('')
	   								if ( !isNaN(test) ) return [ el.join ( '' ) ]
	   								else                return [ el.join ( '_') ]
						})
	   test  = test.map ( (el,i) => el.concat ( props[i] )  )
	   name  = test[0][0]
	   test  = test.map ( el => {
	   								if ( el[0] != name ) {
	   														name = el[0]
	   														counter++
	   									}
	   								if ( !isNaN(el[0]) ) { el[0] = counter; }
	   								return el
	   				 }) 
	   return test
  } // _ignore func.
} // lib




















// * Exported DT.value API
exportAPI = {
                // Structure Manipulation
                  assemble     : exportlib.assemble   // Remove all duplications in the keys and shrinks the nestling as possible
                , ignoreKeys   : exportlib.ignoreKeys // Remove keys that have no value. Converts object with nosense keys in array;
                , cut          : exportlib.cut        // Cut out number of key elements;
                , keyList      : exportlib.keyList    // Returns array of DT object keys;
                , valueList    : exportlib.valueList  // Returns array of DT object values;
                , list         : exportlib.list       // Returns array of items;
                , map          : exportlib.map        // Standard map function
                , json         : exportlib.json       // Returns JSON model of DT object;
                , file         : exportlib.file         // Returns file model array;
                , keyValue     : exportlib.keyValue   // Returns key-value string
                , build        : exportlib.build      // Build ST object;
                
                // Data Manipulation
                , modifyKeys   : exportlib.modifyKeys   // Add modified keys back to DT object;
                , keepKeys     : exportlib.keepKeys     // Apply test on array of keys. Keep met the criteria;
                , removeKeys   : exportlib.removeKeys   // Apply test on array of keys. Remove met the criteria;
                , keepValues   : exportlib.keepValues   // Apply test on values. Keep met the criteria;
                , removeValues : exportlib.removeValues // Apply test on values. Remove met the criteria;

};



// * Official API
API = {
    // DT I/O Operations
		     init       : dtlib.init        // Start chain with data or empty
		   , load       : dtlib.load        // Load DT object or value.
       , loadFast   : dtlib.loadFast    // Use only when no meta-related operations
       , preprocess : dtlib.preprocess  // Convert ST to DT object. Change income data before add, update, overwrite.
       , add        : dtlib.add         // Add data and keep existing data
       , update     : dtlib.update      // Updates only existing data
       , insert     : dtlib.insert      // Insert data on specified key, when the key represents an array.
       , overwrite  : dtlib.overwrite   // Add new data to DT object. Overwrite existing fields
       , spread     : dtlib.spread      // Export DT object
       , spreadAll  : dtlib.spreadAll   // Select all and export DT object with one command
       , log        : dtlib.errorLog    // Executes callback with errors list as argument
       , empty      : () => Object.create ( exportAPI ) // Empty object with export methods
       
    // Compare Operations
       , identical  :  dtlib.identical // Value compare. Reduce data to identical key/value pairs.
       , change     :  dtlib.change    // Value compare. Reduce to key/value pairs with different values.
       , same       :  dtlib.same      // Key compare. Returns key/value pairs where keys are the same.
       , different  :  dtlib.different // Key compare. Returns key/value pairs where key does not exist.
       , missing    :  dtlib.missing   // Key compare. Returns key/value pairs that are missing'
    
    // Selectors and Filters
       , select     : dtlib.select          // Init new selection.
       , parent     : dtlib.parent          // Selector. Apply conditions starting from parent level
       , folder     : dtlib.folder          // Selector. Fullfil select with list of arguments that have specific string
       , all        : dtlib.folder          // Selector. Same as folder
       , space      : dtlib.space           // Selector. Fullfil select with namespace members
       , deepArray  : dtlib.block('array' ) // Selector. Fullfil '_select' with deepest array elements
       , deepObject : dtlib.block('object') // Selector. Fullfil '_select' with deepest object elements
       , invert     : dtlib.invert          // Selector. Invert existing selection
       , limit      : dtlib.limit           // Filter.   Reduces amount of records in the selection
       , keep       : dtlib.keep            // Filter.   Keeps records in selection if check function returns true
       , remove     : dtlib.remove          // Filter.   Removes records from selection if check function returns true
       , deep       : dtlib.deep            // Filter.   Arguments ( num, direction - optional). Num mean level of deep. Deep '0' mean root members
}; // API

module.exports = API