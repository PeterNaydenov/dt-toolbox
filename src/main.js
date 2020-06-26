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
                , { format, mod } = { ...defaultOptions,...options }
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





    , folder ( folder='root', deep ) {
      // *** Find if string exists in a bradcrumb keys.
            const 
                      me = this
                    , dependencies = { ...mainlib.dependencies(), folder, deep }
                    ;
            return dtlib.folder ( dependencies, me )
        } // folder





    , parent ( prop, where ) {
            const 
                  me = this
                , dependencies = { ...mainlib.dependencies(), prop, where }
                ;
            return dtlib.parent ( dependencies, me )
        } // parent func.




    , space ( prop='root', where ) {
            const
                  me = this
                , dependencies = { ...mainlib.dependencies(), prop, where }
                ;
            return dtlib.space ( dependencies, me )
        } // space func.





    , limit ( num ) {
        // *** Filter. Limit number of selected items
            this._select.value = this._select.value.slice ( 0, num )
            return this
        }





    , keep ( fx ) {
        // *** Filter. Reduce selected item by testing their values. If pass the test will stay.
            const me = this;
            if ( fx === undefined   )   return me
            me._select.value = me._select.value.reduce ( (res, item ) => {
                                          if ( fx(me.value[item], item) )   res.push ( item )
                                          return res
                                 },[])
            return me
        } // keep func.




    , remove ( fx ) {
        // *** Filter. Reduce selected item by testing their values. If pass the test will remove.
            const me = this;
            if ( fx === undefined )   return me
            me._select.value = me._select.value.reduce ( (res, item ) => {
                                          if ( !fx(me.value[item],item) )   res.push ( item )
                                          return res
                                 },[])
            return me
        } // remove func.





    , deep ( num, direction='less') {
        // *** Filter. Direction is 'more' or 'less'. Less is by default. Deep '0' mean root members;
            let 
                  me = this
                , dependencies = { ...mainlib.dependencies(), num, direction }
                ;
            return dtlib.deep ( dependencies, me )
        } // deep func.




    , block ( type ) {
        // *** Selector. Fullfil '_select' with deepest structure elements
            return function () {
                    const 
                          me           = this
                        , dependencies = { ...mainlib.dependencies(), type }
                        ;
                    return dtlib.block ( dependencies, me )
        }} // block func.




        
    , invert ( ) {
        // *** Selector. Invert the selection
                const
                      me        = this
                    , selection = me._select.value
                    , valueKeys = Object.keys ( me.value )
                    ;
                me._select.value = valueKeys.reduce ( (res,item) => {
                                                if ( !selection.includes(item) ) res.push(item)
                                                return res
                                        }, [] )
                return me
        } // invert func.











    , identical ( data, callback ) {
        // *** Compare values. Reduce data to identical key/value pairs.
            let
                    me         = this
                  , mainData   = convert.to ( 'breadcrumb', mainlib.dependencies(), [me.structure, me.value]       )
                  , checkData  = convert.to ( 'breadcrumb', mainlib.dependencies(), [data.structure, data.value]   )
                  , result     = {}
                  , mainKeys   = Object.keys ( mainData )
                  ;
            mainKeys.forEach ( k => {
                            let
                                  HAS_KEY = ( checkData.hasOwnProperty(k) )
                                , EQUAL_VALUES = HAS_KEY && ( mainData[k] === checkData[k] )
                                ;
                                if ( EQUAL_VALUES )   result[k] = mainData[k]
                    })
            let 
                  [ structure, value ] = convert.from ( 'breadcrumb' ).toFlat ( mainlib.dependencies(), result )
                , dt = mainlib.dependencies().simpleDT ()
                ;
            dt.structure = structure
            dt.value     = value
            callback ( dt )
        }  // identical func.




        
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
         , identical  :  mainlib.identical // Value compare. Reduce data to identical key/value pairs.
    //    , change     :  dtlib.change    // Value compare. Reduce to key/value pairs with different values.
    //    , same       :  dtlib.same      // Key compare. Returns key/value pairs where keys are the same.
    //    , different  :  dtlib.different // Key compare. Returns key/value pairs where key does not exist.
    //    , missing    :  dtlib.missing   // Key compare. Returns key/value pairs that are missing'
    
    // // Selectors and Filters
          , select     : mainlib.select             // Init a new selection.
          , parent     : mainlib.parent             // Selector. Apply conditions starting from parent level
          , folder     : mainlib.folder             // Selector. Fullfil select with list of arguments that contain specific string
          , all        : mainlib.folder             // Selector. Same as folder ('root')
          , space      : mainlib.space              // Selector. Fullfil select with namespace members
          , deepObject : mainlib.block ( 'object' ) // Selector. Fullfil '_select' with deepest object elements
          , deepArray  : mainlib.block ( 'array'  ) // Selector. Fullfil '_select' with deepest array elements
          , invert     : mainlib.invert             // Selector. Invert existing selection
          , limit      : mainlib.limit              // Filter.   Reduces amount of records in the selection
          , keep       : mainlib.keep               // Filter.   Keeps records in selection if check function returns true
          , remove     : mainlib.remove             // Filter.   Removes records from selection if check function returns true
          , deep       : mainlib.deep               // Filter.   Arguments ( num, direction - optional). Num mean level of deep. Deep '0' mean root members
}; // API



module.exports = API


