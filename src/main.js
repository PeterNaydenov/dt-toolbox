'use strict'


/*
    DT object & DT Toolbox
    =======================
    
    Version 3.0.0

    History notes:
     - Idea was born on March 17th, 2016.
     - Completely redesigned in September/October, 2016
     - Published on GitHub for first time: January 14th, 2017
     - Compare methods were added: identical, change, same, different, missing. January 29th, 2017
     - Invert selection method was added. February 19th, 2017
     - String format support introduces. April 22th, 2017
     - Works in browsers. December 24th, 2017
     - Refactoring and version 3.0.0   April 14th, 2020
         * Much faster and memory efficient algorithms;
         * Smaller library size;
         * Change of internal data-structures(DT);
         * Old internal data type have new name(breadcrumbData) and is fully supported(import/export);
         * Support for tuples(import and export);
         * Complete code refactoring;
*/




const 
      dtlib           = require ( './dt-lib'     ) 
    , help            = require ( './help'                )
    , convert         = require ( './convertors/index'    )
    
    , INIT_DATA_TYPES = [
                               'std', 'standard'
                             , 'tuple', 'tuples'
                             , 'breadcrumb', 'breadcrumbs'
                             , 'file', 'files'
                             , 'midFlat'
                             , 'shortFlat'
                        ]
    ;





const mainlib = {



    dependencies () {
                const h  = Object.create ( API );
                function simpleDT () {
                            const dt  = Object.create ( API );
                            dt.value     = dt.empty ()
                            dt.structure = []
                            dt._select   = { structure:[], value:[] }
                            dt._error    = []
                            return dt
                    } // simpleDT func.
                return {
                          simpleDT
                        , empty: h.empty
                        , help
                    }
            } // dependencies func.

/**
 *  Init options:
 *  modifier(mod): 
 *          keys    - take keys as value. Ignore original values.
 *          nokeys  - ignore keys. Convert objects to arrays
 *          values  - use values as keys
 *        reverse   - keys will become values and values - keys
 * 
 *  format(type): 
 *      std         - standard js object
 *      breadcrumb  - key as a folder. Separate value
 *      file         - keys and values in a single string 
 *      tuples      - array of tuples
 */

    , init ( inData, options ) {   // dataType is instruction to convertor
            let 
                  dependencies = mainlib.dependencies () 
                , dt = dependencies.simpleDT ()
                , defaultOptions = {format:'std', mod:false }
                , {format='std', mod=false } = { ...defaultOptions,...options }
                ;
            if ( !INIT_DATA_TYPES.includes(format) ) {
                        this._error.push ( `Can't understand your data-type: ${format}. Please, find what is possible on http://todo.add.documentation.link.here` )
                        return
                }
            if ( inData != null ) {
                        const [structure, value] = ( format == 'shortFlat') ? inData : convert.from(format).toFlat ( dependencies, inData )
                        dt.structure = [...structure]
                        dt.value     = value
                }
            if ( !mod   )   return dt
            else {                   
                                    let [structure, value] = dtlib.transform ( {...dependencies, mod }, [dt.structure, dt.value] )
                                    if ( !value.hasOwnProperty() ) {  
                                                dt._error.push ( `Modifier "${mod}" is not a valid modifier and was ignored. Data: ${JSON.stringify(inData)}` )
                                        }
                                    dt.structure = structure
                                    dt.value = value
                                    return dt
                }
        } // init func.



    , load  ( flatData ) {   // Load dt content - dtShort and dtLong data types
            return ( flatData._select ) 
                                        ? dtlib.loadLong  ( mainlib.dependencies(), flatData )
                                        : dtlib.loadShort ( mainlib.dependencies(), flatData )
        } // load
        
        

    , preprocess ( inData, fn ) {   // TODO: Data load options are not available?!
                let 
                      shortFlat = convert.from ('std').toFlat ( mainlib.dependencies(), inData )
                    , afterProcess    = fn ( shortFlat )
                    ;
                if ( !afterProcess ) {
                        this._error.push ( 'Method "preprocess" should always return a shortFlat structure: [structure, value]' )
                        return mainlib.init ()
                    }
                return dtlib.loadShort ( mainlib.dependencies(), afterProcess )
        } // preprocess func.



    , add ( inData, options ) {
            const
                  me = this 
                , addData = mainlib.init ( inData, options )
                , mainData = convert.to ( 'midFlat', mainlib.dependencies(), [me.structure, me.value])
                , updates  = convert.to ( 'midFlat', mainlib.dependencies(), [addData.structure, addData.value] )
                ;
            me._error = me._error.concat ( addData._error )
            for (const updateKey in updates ) {
                        let selectObject = mainData[updateKey]
                        if ( !selectObject )   mainData[updateKey] = {...updates[updateKey]}
                        else {
                                    for (let prop in updates[updateKey]) {
                                                    if ( !mainData[updateKey][prop] )   mainData[updateKey][prop] = updates[updateKey][prop]
                                            }
                            }
                }
            let [structure, value ] = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), mainData )
            me.structure = structure
            me.value = value
            return me
        } // add func.



    , update ( inData, options ) {
            let
                  me = this
                , updateData = mainlib.init ( inData, options )
                , mainData   = convert.to ( 'midFlat', mainlib.dependencies(), [me.structure, me.value]                 )
                , updates    = convert.to ( 'midFlat', mainlib.dependencies(), [updateData.structure, updateData.value] )
                ;
            me._error = me._error.concat ( updateData._error )
            for (const updateKey in updates ) {
                        if ( mainData[updateKey] ) {
                                    for (let prop in updates[updateKey]) {
                                                    if ( mainData[updateKey][prop] )   mainData[updateKey][prop] = updates[updateKey][prop]
                                            }
                            }
                }
            let [structure, value ] = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), {...mainData} )
            me.structure = structure
            me.value = value
            return me
        } // update func.





    , overwrite ( inData, options ) {
            const
                  me = this 
                , addData = mainlib.init ( inData, options )
                , mainData = convert.to ( 'midFlat', mainlib.dependencies(), [me.structure, me.value])
                , updates  = convert.to ( 'midFlat', mainlib.dependencies(), [addData.structure, addData.value] )
                ;
            me._error = me._error.concat ( addData._error )
            for (const updateKey in updates ) {
                        let selectObject = mainData[updateKey]
                        if ( !selectObject )   mainData[updateKey] = {...updates[updateKey]}
                        else {
                                    for (let prop in updates[updateKey]) {
                                                    mainData[updateKey][prop] = updates[updateKey][prop]
                                            }
                            }
                }
            let [structure, value ] = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), mainData )
            me.structure = structure
            me.value = value
            return me
        } // overwrite func.




    , insert ( inData, options ) {
            const
                  me = this 
                , addData = mainlib.init ( inData, options )
                , mainData = convert.to ( 'midFlat', mainlib.dependencies(), [me.structure, me.value])
                , updates  = convert.to ( 'midFlat', mainlib.dependencies(), [addData.structure, addData.value] )
                , { empty } = mainlib.dependencies ()
                ;
            me._error = me._error.concat ( addData._error )
            for (const updateKey in updates ) {
                            let 
                                  mainVals   = Object.values ( mainData[updateKey])
                                , updateVals = Object.values ( updates[updateKey] )
                                , mixed      = mainVals.concat ( updateVals )
                                ;
                            mainData[updateKey] = mixed.reduce ( (r,item,i) => {
                                                                r[i] = item
                                                                return r
                                                }, {} )
                }
            let [structure, value ] = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), mainData )
            me.structure = structure
            me.value = value
            return me
        } // insert func.





    , errorLog ( callback ) {   // Executes callback with errors as argument
                    callback ( this._error )
                    return this
        } // errorLog func.



    , select () {   // Init new selection
            this._select = { structure:[], value:[] }
            return this
        }




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
        } // folder




    , parent ( prop, where ) {
            const me = this;
            let 
                  usedNumbers = []
                , selectedKeys = []
                , { help } = mainlib.dependencies ()
                ;

            for (let key in me.value ) {   // collect ids of used objects
                    let splited = key.split('/');
                    if ( splited[2] == prop )   usedNumbers.push ( splited[1] )
                }

            selectedKeys = usedNumbers.reduce ( (res,number) => {
                                        for (let key in me.value ) {
                                                    let splited = key.split('/');
                                                    if ( splited[1] == number )   res.push ( key )
                                            }
                                        return res
                                    },[] )
            if ( where ) {
                    let filtered = usedNumbers.reduce ( (res, number) => {
                                        let 
                                              local = {}
                                            , localSelection = []
                                            ;
                                        selectedKeys.forEach ( key => {
                                                        let 
                                                              splited = key.split('/')
                                                            , num = splited[1]
                                                            , prop = splited.pop()
                                                            ;
                                                        if ( num == number ) {  
                                                                    local[prop] = me.value[key]
                                                                    localSelection.push ( key )
                                                            }
                                                })
                                        let success = where ( local )
                                        if ( success )   res.push ( ...localSelection )
                                        return res
                                    },[])
                    filtered.forEach ( key => {
                                    if ( !me._select.value.includes(key) )   me._select.value.push ( key )
                            })
                } // where
            else {
                    selectedKeys.forEach ( key => {
                                    if ( !me._select.value.includes(key) )   me._select.value.push ( key )
                            })
                }
            me._select.structure = help.copyStructure ( me.structure )
            return me
        } // parent func.




    , spread ( instruction, callback ) {
      // *** Returns result of selection
        const 
               me = this
            , _selectKeys = me._select.value
            , { empty, help } = mainlib.dependencies ()
            ;
        let selection;

  		switch ( instruction ) {
  			case 'value'   :
  			case 'values'  :
  							selection = _selectKeys.reduce ( (res, el, i) => {
  																  res[`root/${i}`] = me.value[el]
  																  return res
  							               }, empty() )
                            break
            case 'key'    : 
            case 'keys'   : 
                            selection = _selectKeys.reduce ( (res, el, i ) => {
                                                                    res[`root/${i}`] = el 
                                                                    return res
                                            }, empty() )
                            break
  			case 'standard' :  
  			case 'std'      :  {
					  		let set = _selectKeys.reduce ( (res, el) => {
					  											 res[el] = me.value[el]
					  											 return res
                                                }, empty() )
                              selection = convert.to ( 'std', mainlib.dependencies(), [me._select.structure, set] )
  			                }
  							break
  			case 'asJSON'   :  { // * Returns DT.value as JSON
					  		let set = _selectKeys.reduce ( (res, el) => {
					  											 res[el] = me.value[el]
					  											 return res
					  		          		       }, {} )
  							selection = JSON.stringify ( set )
					  		}
  							break
            case 'toJSON' : { // * Converts DT.value to ST object and returns JSON
                            let set = _selectKeys.reduce ( (res, el) => {
                                                                    res[el] = me.value[el]
                                                                    return res
                                                }, empty() )
                            selection = JSON.stringify ( set.build() )
                            }
                        break
            case 'flat'    : 
            default       : {
                            let set = _selectKeys.reduce ( (res, el) => {
                                                                    res[el] = me.value[el]
                                                                    return res
                                                }, empty() )
                                , struct = help.copyStructure ( me._select.structure )
                                ;
                            selection = [struct, set]
                            }
  			} // switch instruction
  		
  		callback ( selection )
  		return me
        } // spread func.


} // mainlib











const exportAPI = {
            hi () { return 'hi' }
        }










// * Official API
const API = {
    // DT I/O Operations
		    init       : mainlib.init        // Start chain with data or empty
	      , load       : mainlib.load        // Load DT object or value.
    //    , loadFast   : dtlib.loadFast      // Use only when no meta-related operations
          , preprocess : mainlib.preprocess  // Convert Std to Flat object. Change income data before add, update, overwrite.
          , add        : mainlib.add         // Add data and keep existing data
          , update     : mainlib.update      // Updates only existing data
          , overwrite  : mainlib.overwrite   // Add new data to DT object. Overwrite existing fields
          , insert     : mainlib.insert      // Insert data on specified key, when the key represents an array.
          , spread     : mainlib.spread      // Returns result of selection
    //    , spreadAll  : dtlib.spreadAll   // Select all and returns it with one command
          , log        : mainlib.errorLog    // Executes callback with errors list as argument
          , empty      : () => Object.create ( exportAPI ) // Empty object with export methods
       
    // // Compare Operations
    //    , identical  :  dtlib.identical // Value compare. Reduce data to identical key/value pairs.
    //    , change     :  dtlib.change    // Value compare. Reduce to key/value pairs with different values.
    //    , same       :  dtlib.same      // Key compare. Returns key/value pairs where keys are the same.
    //    , different  :  dtlib.different // Key compare. Returns key/value pairs where key does not exist.
    //    , missing    :  dtlib.missing   // Key compare. Returns key/value pairs that are missing'
    
    // // Selectors and Filters
          , select     : mainlib.select        // Init new selection.
          , parent     : mainlib.parent        // Selector. Apply conditions starting from parent level
    //    , folder     : dtlib.folder          // Selector. Fullfil select with list of arguments that have specific string
    //    , all        : dtlib.folder          // Selector. Same as folder
    //    , space      : dtlib.space           // Selector. Fullfil select with namespace members
    //    , deepArray  : dtlib.block('array' ) // Selector. Fullfil '_select' with deepest array elements
    //    , deepObject : dtlib.block('object') // Selector. Fullfil '_select' with deepest object elements
    //    , invert     : dtlib.invert          // Selector. Invert existing selection
    //    , limit      : dtlib.limit           // Filter.   Reduces amount of records in the selection
    //    , keep       : dtlib.keep            // Filter.   Keeps records in selection if check function returns true
    //    , remove     : dtlib.remove          // Filter.   Removes records from selection if check function returns true
    //    , deep       : dtlib.deep            // Filter.   Arguments ( num, direction - optional). Num mean level of deep. Deep '0' mean root members
}; // API



module.exports = API


