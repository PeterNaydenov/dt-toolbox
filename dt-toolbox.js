'use strict'

/*
    DT object & DT Toolbox
    =======================
    
    Version 1.1.1

    History notes:
     - Idea was born on March 17th 2016.
     - Completely redesigned in September/October 2016
     - Published on GitHub for first time: January 14th 2017
     - Compare methods were added: identical, change, same, different, missing. January 29th 2017

*/


 let 
       DTProto
     , simple         // Simple methods like 'copy' and 'noObject'
     , API            // What is possible to do inside the library.
     , exportAPI      // Exported DT.value object methods
     ;










simple = {    // * Simple instruments

notObject : function notObject ( str ) {
		let result = false
    if ( typeof str == 'undefined' ) { result = true }
		if ( typeof str == 'string'    ) { result = true }
		if ( typeof str == 'number'    ) { result = true }
		if ( typeof str == 'boolean'   ) { result = true }
		if ( typeof str == 'function'  ) { result = true }
		return result
  } // notObject func.
, isObject    : str  => !simple.notObject(str)
, dt          :  ()  => { 
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
    }

, value       : data   => {
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
                        }

, copy        :  obj => JSON.parse ( JSON.stringify(obj) ) 
, folderKind  : test => test instanceof Array ? 'array' : 'object'
, getIterator : list => Object.getOwnPropertyNames ( list )

, removeLast ( path ) {
                	  let list = path.split('/')
                	  list.pop()
                	  return list.join('/')
  }  // removeLast func.

, getPenult ( path ) {
                	  let list = path.split('/')
                	  list.pop()
                	  return list.pop()
  }  // getPenult func.

, getUlt ( path ) {
                	  let list = path.split('/')
                	  return list.pop()
  }  // getUlt func.
 
}; // simple




















let dtlib = {

 // -------------------------------> dtlib : INIT
 init ( data, instructions ) {
 		let result, dt;
        
    if ( data === undefined ) dt = simple.dt ()
    else                      dt = dtlib.scan ( data )

    if ( !instructions ) result = dt
    else                 result = lib._transform ( dt, instructions )

	 	return result
 } // init func.
 


 // -------------------------------> dtlib : LOAD	
 , load (data) {
   // * Load existing DT object
                    if ( !data.namespace || !data.structure ) {
                                data     = simple.value ( data )
                                const st = data.build();
                                data     = dtlib.scan ( st ) 
                        }
 					data._select = []
 					return data
 	  } // load func.



 // -------------------------------> dtlib : SCAN	
 , scan ( target ) {
   // * Convert any ST object in DT object and return it. 
 	let 
 		  dt        = simple.dt()
 		, namespace = 'root'
 		;

	  dt.structure['root'] = simple.folderKind ( target )
	  dt.namespace['root'] = []

	  lib._scan ( target, namespace , dt )

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
	
 	  dt = dtlib.scan ( data )   // convert data to DT object

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





 // -------------------------------> dtlib : UPDATE
, update ( data, instructions ) {
  // * Updates only existing DT props
 			let 
 				  me = this
        , dt
 				, scanData
 				, iterator
 				;
	
            dt = dtlib.scan ( data )   // convert data to DT object
 			
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
	
      dt = dtlib.scan ( data )   // convert data to DT object
 			
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
 
  dt = simple.value(data)

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
                                                   if ( dt[el] != data[el]    ) return res

                                                   res[el] = data[el]
                                                   return res
                            }, simple.value() )

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
                            }, simple.value() )

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
                            }, simple.value() )

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
                            }, simple.value() )

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
                            }, simple.value() )

   callback ( result )
   return me   
 } // missing func.







 // -------------------------------> dtlib : ERRORLOG
 , errorLog ( callback ) {
  // * Executes callback with errors as argument
                            callback ( this._error )
                            return this
 } // errorLog func.





 // -------------------------------> dtlib : HAS
, has ( name ) {
  // * 'Check if property exists. Returns true or false.'
                        	if ( this.value[name] ) return true
                        	else                    return false
  } // has func.





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
  							               }, simple.value() )
  							 break
  			case 'st'     :  {
					  		 let set = me._select.reduce ( (res, el) => {
					  											 res[el] = me.value[el]
					  											 return res
					  		          		}, simple.value() )
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
                                              }, simple.value() )
                               selection = JSON.stringify ( set.build() )
                               }
                      break
      case 'key'    : 
  		case 'keys'   : 
  							 selection = me._select.reduce ( (res, el,i) => {
			  													  res['root/' + i] = el.replace('root/','') 
			  													  return res
  							               }, simple.value() )
  							        break
  			case 'dt'     : 
  			case 'object' : 
  			default       :
                            selection = me._select.reduce ( (res, el) => {
                                                                 res[el] = me.value[el]
                                                                 return res
                                            }, simple.value() )
  			} // switch instruction
  		
  		callback ( selection )
  		return me
  } // spread func.





// -------------------------------> dtlib : SPREAD ALL
, spreadAll ( instruction, callback ) {
  // * Select all and export DT object with one command
   return this.select().all().spread( instruction, callback )
} // spreadAll func.





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
	deep = isNaN(deep) ? deepDefault : deep
	deep =  deep + 1 // because we add default wrapper 'root'
  deepMax = name.split('/').length + deep

    let collection = Object.getOwnPropertyNames ( me.value )
                           // .filter ( el => el.indexOf(name) != -1  )
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
													let objName = simple.removeLast(el)
													if ( r.hasOwnProperty ( objName )   ) return r
													r.push ( objName )
													return r
	                        },[])
	// Reduce object list
	objects = objects.reduce ( (r,el) => {
												let notExists = r.every ( value => value != el )
												if ( notExists ) r.push ( el )
												return r
					 }, [])

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
    me._select = me._select.reduce ( (res, item ) => {
                                if ( !fx(me.value[item]) )   res.push ( item )
                                return res
                       },[])
      return this
 } // remove func.





 // -------------------------------> dtlib : KEEP
, keep ( fx ) {
  // * Reduce selected item by testing their values. If pass the test will stay.
  // Filter
    const me = this;
    me._select = me._select.reduce ( (res, item ) => {
                                if ( fx(me.value[item]) )   res.push ( item )
                                return res
                       },[])
	  return this
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
	
    if ( names === undefined ) names = defaultSpace
    if ( typeof names == 'string' ) names = [ names ]

	let collection = names.reduce ( (res, name) => {
												  let space = me.namespace

												  if ( space.hasOwnProperty(name) ) res = res.concat( space[name] )
												  return res
					}, [] )

   if ( !collection.length == 0 )   me._select = me._select.concat ( collection )
   return me
  } // space func.

} // dtlib 




















let exportlib = {

// -------------------------------> exportlib : MAP
map ( fx ) {
  let 
        me   = this
      , keys = me.keyList()
      ;

  const result = keys.reduce ( (res,item) => { 
                                                  const newKey = fx (item)
                                                  res[newKey]  = me[ item ]
                                                  return res
                                    }, simple.value())
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

       if ( simple.notObject(data) ) return false
       if ( data instanceof Array  ) return false

       let iterator = simple.getIterator ( data )
   	   if ( iterator.length == 0 ) return data

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
  	                      }, simple.value() )

  	   // Object.setPrototypeOf ( result, exportlib )
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
      , result      = simple.value()     
      ;

 keyList.forEach ( item => {
                        let keyArray = item.split('/')
                        let val = keyArray[removeLevel]
                        
                        if ( !removeList.includes(val) ) removeList.push(val)
                        keyArray[removeLevel] = removeList.length-1
                        result[ keyArray.join('/') ] = me[item]
      })

 return result
} // ignoreKeys





// -------------------------------> exportlib : MODIFY KEYS
, modifyKeys ( oldKeys, keysUpdate ) {
  // * Updates object with modified keys.
	const me = this;

	let result = oldKeys.reduce ( (res,item,i) => {
												let value = me[item];
												let key = keysUpdate[i]
												res[key] = value
												return res
	                   }, simple.value() )

    return result
} // modifyKeys func.





// -------------------------------> exportlib : KEEP KEYS
, keepKeys ( callback ) {
    const dt = this;
    let 
          iterator
        , result
        ;

    if ( typeof callback != 'function' ) return dt
    
    iterator = Object.getOwnPropertyNames ( dt ) 
    result = iterator.reduce ( (res, el) => {
                                            let arrayKeys = el.split('/');
                                            let test = callback ( arrayKeys )
                                            if ( test ) res[el] = dt[el]
                                            return res
                                 }, simple.value() )
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

    if ( typeof callback != 'function' ) return dt
    
    iterator = Object.getOwnPropertyNames ( dt ) 
    result = iterator.reduce ( (res, el) => {
                                            let arrayKeys = el.split('/');
                                            let test = callback ( arrayKeys )
                                            if ( !test ) res[el] = dt[el]
                                            return res
                                 }, simple.value() )
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
                                 }, simple.value() )
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
                                 }, simple.value() )
    return result
} // keepKeys func.



 // -------------------------------> exportlib : JSON
, json ( data ) {
     /* Convert any object to JSON */
   		if ( !data ) data = this
     	return JSON.stringify ( data )	
     } // json func.





 // -------------------------------> exportlib : BUILD
, build ( data ) {
  // * Convert any DT object in ST object
   	if ( !data ) data = this
    
    let props = Object.getOwnPropertyNames ( data )
    let list = props.map ( prop => prop.split('/')   )

    return	lib._build ( 'root', list , data )	
  }  // build func.

} // exportlib




















let lib = {
 // * Library that contain core functions 

_build : function _build ( word, selectors, data ) {
	// * Recursive ST object creation
	  let 
	  		  result
	  		, set = simple.copy ( selectors )
	  		;

	  // Modify data according word request
	  set = set.reduce ( (res,s) => { 
		  							      if ( s[0] == word ) {
									   						    s.shift()
									   						    res.push(s)
		  							   	     }
		  							      return res
	  			          },[])

	  data = set.reduce ( (res, s) => {
		  								 let path = s.join('/')
		  								 let source = path

		  								 if ( s.length == 1 ) {
		  								 						source = source.slice ( path.length + 1 )
		  								 						res[s[0]] = data[word + '/' + s[0] ]
		  								 	}
		  								 else 					res[path] = data[word + '/' + path]
		  								 return res
	  			 }, {})

	  // Recognize container-type
	   let isObject = set.reduce ( (res,el) => { 
	   												    if ( !isNaN(el[0]) ) return false
	   												    return res
	   					       }, true )
	   if ( isObject ) result = {}
	   else            result = []

	  // Set properties and find next word
	  set.forEach ( s => {
	  							  let nextWord = s[0]
	  							  if ( s.length == 1 ) result[nextWord] = data[nextWord]
	  							  else                 result[nextWord] = lib._build ( nextWord, set, data )
	            })
	  if ( result instanceof Array ) {
	  let it = simple.getIterator(result)
	  result = it.reduce ( (res,el) => {
	  										  if ( el == 'length') return res
	  										  if ( isNaN(el) ) res[el] =  result[el]
	  										  else			   res.push ( result[el] )
	  										  return res
	                   },[])
	     }
	  return result
  } // _build func.





, _toFolderFile : function _toFolderFile ( target ) {
  // * Find hidden arrays and update keys. Like in folders/files.
     let 
          iterator
        , folderKeys = []
        , duplicates = []
        , counter    = 0
        , result
        ;
     
     
     // Find repeating folder names
     target.map ( el => {
                            let file = el.split('/').pop()
                            let folder = el.replace(`/${file}`,'')
                            
                            folderKeys.forEach ( key => {
                                      if ( folder.includes(key) && !duplicates.includes(key) )   duplicates.push ( key )
                                   })
                            if      ( !folderKeys.includes(folder) )   folderKeys.push ( folder )
                            else if ( !duplicates.includes(folder) )   duplicates.push ( folder )
                })

     result = target.reduce ( (res,item) => {
                                                let file   = item.split('/').pop()
                                                let folder = item.replace(`/${file}`,'')

                                                if ( duplicates.includes(folder) ) res[`${folder}/${counter++}`] = file;
                                                else                               res[folder] = file

                                                return res
                               }, simple.value() )

     return result;
} //_toFolderFile func.




 , _scan : function _scan ( list , namespace , dt ) {
 	// * Convert ST object to DT
 	let iterator;
    iterator = simple.getIterator ( list )
    iterator.forEach ( el => {
                if ( el == 'length') return  // ignore 'length' property
                const prop = `${namespace}/${el}`;

                if ( simple.notObject ( list[el] )   ) {
                               dt.value[prop] = list[el]
                               const obj = simple.getUlt (namespace )
                               dt.namespace[obj].push(prop)
                     }
                else {
                              if ( !simple.getUlt(prop).match(/^[0-9]/) )   dt.structure[prop] = simple.folderKind ( list[el] )
                              if ( !dt.namespace.hasOwnProperty(el)     )   dt.namespace[el] = []
    													lib._scan ( list[el], prop , dt )
    			           }
           }) // foreach interator
  } // _scan func.





, _transform : function transform (dt,instructions) {
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
                                              let list = dtValue.keyList()
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
                                              const temp = lib._toFolderFile  ( dtValue.valueList().map(el=>`root/${el}`) )
                                              const next = simple.getIterator ( temp )
                                                                 .reduce ( (res,el) => {
                                                                                           let newKey  = `${el}/${temp[el]}`
                                                                                           res[newKey] = temp[el]
                                                                                           return res
                                                                               },{})
                                              result = exportlib.build ( next )
                                              break
                             case 'file'    :
                             case 'files'   :
                             case 'folders' :
                             case 'folder'  :
                                              // Value and key in one '/' separated string. Last element will become value
                                              result = lib._toFolderFile ( dtValue.valueList().map(el=>`root/${el}`)  ).build()
                                              break
                             default:
                                              result = dtValue
                       }
    dt = dtlib.scan ( result )
    return dt
  } // _transform func.





, _validate : function _validate ( list ) {
   // * Check for valid property names. Removes overwritten properties.
   let answer, result;

   // Collect object names
   let etalones = list.reduce ( (res,el) => {
   			   							let stack = el.split('/')
   			   							while ( stack.length > 2) {
		   			   							stack.pop()
		   			   							el = stack.join('/')
												let notFound = res.every ( item => item != el )
												if ( notFound ) res.push(el)
   			   							}
										return res
   					   }, [] )
   
   // Remove overwritten values
   result = list.map ( el => {
								answer = false
								for ( let etalon in etalones) {
					    			  if ( etalones[etalon] == el ) answer = true
    							   }
        						return answer ? false : el
            	})
    return result
  } // _validate func.





, _removeDuplicates : function _removeDuplicates ( paths ) {
  // * Remove common elements in list of paths. Paths are arrays here.
	   let 	names, word , equal;

       if ( paths[0].length == 1 )  return paths

       names = paths.map ( el => el[0] )
       word  = names[0]

       if ( word != undefined ) {
                        equal = names.every ( el => el == word )
       }
       else             equal = false

       if ( equal ) {
                        paths.forEach ( path => path.shift()  )
                        _removeDuplicates( paths )
            }
      
       return paths
  } // _removeDuplicates func.





, _reorder : function _reorder ( paths, ix ) {
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





, _ignore : function ( paths ) {
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
                , keyList      : exportlib.keyList    // Returns array of DT object keys;
                , valueList    : exportlib.valueList  // Returns array of DT object values;
                , json         : exportlib.json       // Return JSON format of DT object
                , build        : exportlib.build      // Build ST object
                
                // Data Manipulation
                , map          : exportlib.map          // Standard map function
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
       , select     : dtlib.select     // Init new selection.
       , parent     : dtlib.parent    // Selector. Apply conditions starting from parent level
       , folder     : dtlib.folder    // Selector. Fullfil select with list of arguments that have specific string
       , all        : dtlib.folder    // Selector. Same as folder
       , space      : dtlib.space     // Selector. Fullfil select with namespace members
       , limit      : dtlib.limit     // Filter.   Reduces amount of records in the selection
       , keep       : dtlib.keep      // Filter.   Keeps records in selection if check function returns true
       , remove     : dtlib.remove    // Filter.   Removes records from selection if check function returns true
       , deep       : dtlib.deep      // Filter.   Arguments ( num, direction - optional). Num mean level of deep. Deep '0' mean root members
}; // API

module.exports = API