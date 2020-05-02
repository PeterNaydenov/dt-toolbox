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
                        , convert
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
 *      tuples      - array of tuples. Tuple[0] is the key, tuple[1] is the value
 */

    , init ( inData, options ) {   // dataType is instruction to convertor
            let 
                  dependencies = mainlib.dependencies () 
                , dt = dependencies.simpleDT ()
                , help = dependencies.help
                , defaultOptions = {format:'std', mod:false }
                , {format='std', mod=false } = { ...defaultOptions,...options }
                ;
            if ( !INIT_DATA_TYPES.includes(format) ) {
                        this._error.push ( `Can't understand your data-type: ${format}. Please, find what is possible on http://todo.add.documentation.link.here` )
                        return
                }
            if ( inData != null ) {
                        const [structure, value] = ( format == 'shortFlat') ? inData : convert.from(format).toFlat ( dependencies, inData )
                        dt.structure = help.copyStructure ( structure ) 
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
        
        



    , preprocess ( inData, fn, options ) {
                let 
                      defaultOptions = { format:'std', mod:false }
                    , { format='std' } = { ...defaultOptions,...options }
                    , shortFlat    = convert.from (format).toFlat ( mainlib.dependencies(), inData )
                    , afterProcess = fn ( shortFlat )   // afterProcess should be in 'shortFlat' format
                    ;
                if ( !afterProcess ) {
                        this._error.push ( 'Method "preprocess" should always return a shortFlat format: [structure, value]' )
                        return mainlib.init ()   // On preprocess error, create an empty object 
                    }
                return dtlib.loadShort ( mainlib.dependencies(), afterProcess )
        } // preprocess func.





    , modify ( method ) {
            return function ( inData, options ) {
                    const
                          me = this 
                        , updateData = mainlib.init ( inData, options )
                        ;
                    return   dtlib.modify ( { ...mainlib.dependencies(), action:method}, me, updateData )
        }} // modify func.





    , errorLog ( callback ) {   // Executes callback with errors as argument
                    callback ( this._error )
                    return this
        } // errorLog func.





    , select () {   // Init a new selection
            this._select = { structure:[], value:[] }
            return this
        }





    , folder ( name, deep ) {
            // TODO: Update. It's an old version...
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
                , result
                ;
            for (let key in me.value ) {   // Collect used parent object(ids) from value
                    let splited = key.split('/');
                    if ( splited[2] == prop )   usedNumbers.push ( splited[1] )
                }
            me.structure.forEach ( row => {   // Find if any array structures
            row.forEach ( (item,i) => {
                        if ( i > 1 && item[1]==prop ) {
                                let 
                                      id = item[0]
                                    , objectType = me.structure[id][0]
                                    ;
                                if ( objectType == 'array' )   usedNumbers.push(id)
                            }
                })                                    
                })
            selectedKeys = usedNumbers.reduce ( (res,number) => {   // Collect props of used parent objects
                                        for (let key in me.value ) {
                                                    let splited = key.split('/');
                                                    if ( splited[1] == number )   res.push ( key )
                                            }
                                        return res
                                    },[] )
            if ( where ) {   // Apply where fn if is defined
                    result = usedNumbers.reduce ( (res, number) => {
                                        let [localObject, localKeysSelection] = help.filterObject ( number, selectedKeys, me.value )
                                        let success = where ( localObject )
                                        if ( success )   res.push ( ...localKeysSelection )
                                        return res
                                    },[])
                } // where
            else {
                    result = selectedKeys
                }
            result.forEach ( key => {
                        if ( !me._select.value.includes(key) )   me._select.value.push ( key )
                    })
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
        // TODO: refactoring of instructions. Should work as options in init. ( { mod, format} )
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
		    init       : mainlib.init                      // Convert any object to flat format
	      , load       : mainlib.load                      // Load a flat format data
          , loadFast   : mainlib.load                      // Important! Method is depricated. Use load instead
          , preprocess : mainlib.preprocess                // Apply custom modifier to initial data
          , add        : mainlib.modify ( 'add'       )    // Add data and keep existing data
          , update     : mainlib.modify ( 'update'    )    // Updates only existing data
          , overwrite  : mainlib.modify ( 'overwrite' )    // Add new data to DT object. Overwrite existing fields
          , insert     : mainlib.modify ( 'insert'    )    // Insert data on specified key, when the key represents an array.
          , spread     : mainlib.spread                    // Returns result of selection
    //    , spreadAll  : dtlib.spreadAll                   // Select all and returns it with one command
          , log        : mainlib.errorLog                  // Executes callback with errors list as argument
          , empty      : () => Object.create ( exportAPI ) // Empty object with export methods
       
    // // Compare Operations
    //    , identical  :  dtlib.identical // Value compare. Reduce data to identical key/value pairs.
    //    , change     :  dtlib.change    // Value compare. Reduce to key/value pairs with different values.
    //    , same       :  dtlib.same      // Key compare. Returns key/value pairs where keys are the same.
    //    , different  :  dtlib.different // Key compare. Returns key/value pairs where key does not exist.
    //    , missing    :  dtlib.missing   // Key compare. Returns key/value pairs that are missing'
    
    // // Selectors and Filters
          , select     : mainlib.select        // Init a new selection.
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


