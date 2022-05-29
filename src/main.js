'use strict'


/*
    DT object & DT Toolbox
    =======================
    
    Version 4.0.7

    History notes:
     - Idea was born on March 17th, 2016.
     - Completely redesigned in September/October, 2016
     - Published on GitHub for first time: January 14th, 2017
     - Compare methods were added: identical, change, same, different, missing. January 29th, 2017
     - Invert selection method was added. February 19th, 2017
     - String format support introduces. April 22th, 2017
     - Works in browsers. December 24th, 2017
     - Refactoring and version 3.0.0   April 14th, 2020 - February 24th, 2020
         * Much faster and memory efficient algorithms;
         * Multiple convertors for switching among different data-type;
         * Change of internal data-description;
         * Old internal data-type have a new name(breadcrumbs) and is fully supported(import/export);
         * Support for tuples(import and export);
         * Complete code refactoring;

*/



const 
      dtlib           = require ( './lib/index'           ) 
    , help            = require ( './help/index'          )
    , modifier         = require ( './modifiers/index'      )
    , convert         = require ( './convertors/index'    )
    , compareMethod   = require ( './compareMethod/index' )
    , walk            = require ( '@peter.naydenov/walk'  )
    
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
                            dt._select   = { structure:[], value:[], result: null }
                            dt._error    = []
                            return dt
                    } // simpleDT func.
                return {
                          simpleDT
                        , empty: h.empty
                        , convert
                        , help
                        , modifier
                        , walk
                    }
            } // dependencies func.

/**
 *  Init options:
 *  modifier(modify): 
 *          keys    - take keys as value. Ignore original values.
 *          nokeys  - ignore keys. Convert objects to arrays
 *          values  - use values as keys
 *        reverse   - keys will become values and values - keys
 * 
 *  data-type(type): 
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
                , defaultOptions = {type:'std', modify:false }
                , { type, modify } = { ...defaultOptions,...options }
                ;
            if ( !INIT_DATA_TYPES.includes(type) ) {
                        this._error.push ( `Can't understand your data-type: ${type}. Please, find what is possible on https://github.com/PeterNaydenov/dt-toolbox` )
                        return
                }
            if ( inData != null ) {
                        // Note: Use method 'load' instead of 'init' if your data is 'flat'
                        const [structure, value] = ( type == 'flat' || type == 'shortFlat' ) ? inData : convert.from(type).toFlat ( dependencies, inData )
                        dt.structure = walk ( structure ) 
                        dt.value     = value
                }
            if ( !modify   )   return dt
            else {                   
                            let [structure, value] = dtlib.transform ( {...dependencies, modify }, [dt.structure, dt.value] );
                            let missingValues = ( Object.keys ( value ).length <= 0 );
                            if ( missingValues ) {  
                                        dt._error.push ( `Modifier "${modify}" is not a valid modifier and was ignored. Data: ${JSON.stringify(inData)}` )
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
                      defaultOptions = { type:'std', modify:false }
                    , { type='std' } = { ...defaultOptions,...options }
                    , shortFlat    = convert.from (type).toFlat ( mainlib.dependencies(), inData )
                    , afterProcess = fn ( shortFlat )   // afterProcess should be in 'shortFlat' data-type
                    ;
                if ( !afterProcess ) {
                        this._error.push ( 'Method "preprocess" should always return a shortFlat data-type: [structure, value]' )
                        return mainlib.init ()   // On preprocess error, create an empty object 
                    }
                return dtlib.loadShort ( mainlib.dependencies(), afterProcess )
        } // preprocess func.



    , combine ( inData, options ) {
            const
                  me = this
                , updateData = mainlib.init ( inData, options )
                ;
            return dtlib.combine ( {...mainlib.dependencies()}, me, updateData)
        } // combine func.


    , modify ( method ) {
            return function ( inData, options ) {
                    const me = this;
                    let   updateData;
                    
                    if ( options )   updateData = mainlib.init ( inData, options )
                    else             updateData = { 
                                                      structure : walk ( inData.structure )
                                                    , value     : {...inData.value }
                                            }
                    return   dtlib.modify ( { ...mainlib.dependencies(), action:method}, me, updateData )
        }} // modify func.





    , errorLog ( callback ) {   // Executes callback with errors as argument
                    callback ( this._error )
                    return this
        } // errorLog func.




    , replace () {  // Convert _select.result to me.value and me.structure
            const 
                    me       = this
                , { result } = me._select
                ;
            if ( !result )   return me
            let [struct, val] = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), result )
            me.structure = walk ( struct )
            me.value = {...val}
            me._select.result = null
            return me
        } // replace func.





    , attach ( location ) {
            const 
                  me = this
                , dependencies = { ...mainlib.dependencies(), location }
                ;
            let [structure, value ] = dtlib.attach ( dependencies, me )
            me.structure = walk ( structure )
            me.value     = {...value}
            me._select.result = null
            return me
        } // attach func.





    , select () {   // Init a new selection
            this._select = { structure:[], value:[], result : null }
            return this
        }





    , find ( search='root', deep ) {
      // *** Find if string exists in a bradcrumb keys.
            const 
                      me = this
                    , dependencies = { ...mainlib.dependencies(), search, deep }
                    ;
            me._select.result = null
            return dtlib.find ( dependencies, me )
        } // find func.





    , parent ( prop, where ) {
            const 
                  me = this
                , dependencies = { ...mainlib.dependencies(), prop, where }
                ;
            me._select.result = null
            return dtlib.parent ( dependencies, me )
        } // parent func.




    , folder ( prop='root', where ) {
            const
                  me = this
                , dependencies = { ...mainlib.dependencies(), prop, where }
                ;
            me._select.result = null
            return dtlib.folder ( dependencies, me )
        } // folder func.





    , limit ( num ) {
        // *** Filter. Limit number of selected items
            this._select.value = this._select.value.slice ( 0, num )
            this._select.result = null
            return this
        }





    , keep ( fx ) {
        // *** Filter. Reduce selected item by testing their values. If pass the test will stay.
            const 
                  me = this
                , breadcrumbKeys = help.toBreadcrumbKeys ( me._select.value, me.structure )
                ;
            if ( fx === undefined   )   return me
            me._select.result = null
            me._select.value = me._select.value.reduce ( (res, flatKey, i ) => {
                                          let breadcrumbKey = breadcrumbKeys[i];
                                          if ( fx(me.value[flatKey], breadcrumbKey, flatKey) )   res.push ( flatKey )
                                          return res
                                 },[])
            return me
        } // keep func.




    , remove ( fx ) {
        // *** Filter. Reduce selected item by testing their values. If pass the test will remove.
            const 
                  me = this
                , breadcrumbKeys = help.toBreadcrumbKeys ( me._select.value, me.structure )
                ;
            if ( fx === undefined )   return me
            me._select.result = null
            me._select.value   = me._select.value.reduce ( (res, flatKey,i) => {
                                                    let breadcrumbKey = breadcrumbKeys[i];
                                                    if ( !fx(me.value[flatKey],breadcrumbKey,flatKey) )   res.push ( flatKey )
                                                    return res
                                            }, [] )
            return me
        } // remove func.





    , deep ( num, direction='less') {
        // *** Filter. Direction is 'more' or 'less'. Less is by default. Deep '0' mean root members;
            let 
                  me = this
                , dependencies = { ...mainlib.dependencies(), num, direction }
                ;
            me._select.result = null
            return dtlib.deep ( dependencies, me )
        } // deep func.



    , withData () {
            let me = this;
            me._select.result = convert.to ( 'midFlat', mainlib.dependencies(), [ me.structure, me.value] )
            return me
        } // withData func.



    , withSelection () {
            let
                 me = this
               , { structure } = me._select
               ;
            me._select.result = convert.to ( 'midFlat', mainlib.dependencies(), [structure, help.extractSelection(me)]    )
            return me
        } // withSelection func.





    , flatten () {
            const
                    me       = this
                , { result } = me._select
                ;
            if ( !result )   return me
            me._select.result = modifier['flatten'] ( result, {})
            return me
        } // flatten func.




    , mix ( host='root', guestList=[] ) {
                const
                        me       = this
                    , { result } = me._select
                    ;
                if ( !result )   return me
                me._select.result = modifier ['mix'] ( result, [...guestList,host])
                return me
        } // mix func.



    , reverse ( namespace = ['root'] ) {
                const
                       me = this
                    , { result } = me._select
                    ;
                if ( !result )   return me
                me._select.result = modifier['reverse'] ( result, namespace )
                return me
        } // reverse func.



    , keyPrefix ( separationSymbol='' ) {
            const
                    me = this
                  , { result } = me._select
                  ;
            if ( !result )   return me
            me._select.result = modifier['keyPrefix'] ( result, {separationSymbol})
            return me
        } // keyPrefix func.




    , block ( type ) {
        // *** Selector. Fullfil '_select' with deepest structure elements
            return function () {
                    const 
                          me           = this
                        , dependencies = { ...mainlib.dependencies(), type }
                        ;
                    me._select.result = null
                    return dtlib.block ( dependencies, me )
        }} // block func.




        
    , invert ( ) {
        // *** Selector. Invert the selection
                const
                      me        = this
                    , selection = me._select.value
                    , valueKeys = Object.keys ( me.value )
                    ;
                me._select.result = null
                me._select.value = valueKeys.reduce ( (res,item) => {
                                                if ( !selection.includes(item) ) res.push(item)
                                                return res
                                        }, [] )
                return me
        } // invert func.





    , assemble () {
                const
                      me                   = this
                    , dependencies = { ...mainlib.dependencies() }
                    ;
                return   dtlib.assemble ( dependencies, me )
        } // assemble func.




    
    , purify () {
                const
                       me = this
                     , dependencies = { ...mainlib.dependencies() }
                     ;
                return dtlib.purify ( dependencies, me )
        } // purify func.










    , compare ( methodName) {
      return function ( data, callback ) {
                if ( 
                        !data.hasOwnProperty ( 'value' )
                           ||
                        !data.hasOwnProperty ( 'structure' )
                   ) {
                        const errorMsg = 'Error: Compared object should be data-type "flat"'; 
                        callback ( null )
                        return this
                    }

                let 
                      me = this
                    , mainData   = convert.to ( 'breadcrumb', mainlib.dependencies(), [me.structure, me.value]       )
                    , checkData  = convert.to ( 'breadcrumb', mainlib.dependencies(), [data.structure, data.value]   )
                    ;
                let    
                      result = compareMethod[methodName] ( mainData, checkData )
                    , [ structure, value ] = convert.from ( 'breadcrumb' ).toFlat ( mainlib.dependencies(), result )
                    , dt = mainlib.dependencies().simpleDT ()
                    ;
                dt.structure = structure
                dt.value     = value
                callback ( dt )
                return me
        }} // compare func.





    



    , spread ( instruction, callback ) {
      // *** Returns result of the selection in a callback
      // If callback is missing - returns result of the selection directly
        const 
               me = this
            , hasSelection    = me._select.result ? true : false
            , { help } = mainlib.dependencies ()
            ;
        let selection, modify, vals;
            /**
             *   Instructions:
             *      - standard/std: standard js object;
             *      - breadcrumb(s): keys position described as breadcrumb and values are primitives(number,boolean,string);
             *      - file(s): Array of combined breadcrumb keys and value in single string;
             *      - midFlat: Mix. Breadcrumb keys and values are object with primitive properties;
             *      - tuples: Object described as array of arrays with two elements. First is the key, second is the value;
             *      - flat: Library internal description of the object
             *      - key(s): Array of all keys
             *      - value(s): Array of all values
             */
  		    switch ( instruction ) {
                case 'value'   :
                case 'values'  :
                                modify = 'values'
                                if ( hasSelection ) {
                                        let data = convert.from ( 'midFlat' ).toFlat ( mainlib.dependencies(), me._select.result );
                                        vals = dtlib.transform ( {...mainlib.dependencies(),modify}, data )
                                    }
                                else {
                                        vals = dtlib.transform ( {...mainlib.dependencies(), modify }, [me.structure, me.value] );
                                    }
                                selection = convert
                                                .to ( 'std', mainlib.dependencies(), vals )
                                                .map ( v => {
                                                        switch ( typeof v ) {
                                                                    case 'string' : return Number(v) || v
                                                                    default       : return v
                                                            }
                                                    })
                                break
                case 'key'    : 
                case 'keys'   : 
                                modify = 'keys'
                                if ( hasSelection ) {
                                            let data = convert.from ( 'midFlat' ).toFlat ( mainlib.dependencies(), me._select.result )
                                            vals = dtlib.transform ( {...mainlib.dependencies(), modify}, data )
                                            modify = 'values'
                                            vals = dtlib.transform ( {...mainlib.dependencies(), modify}, vals )
                                    }
                                else {
                                            vals = dtlib.transform ( {...mainlib.dependencies(),modify},[me.structure, me.value])
                                    }
                                selection = convert.to ( 'std', mainlib.dependencies(), vals )
                                break
                case 'standard' :  
                case 'std'      :
                                if ( hasSelection ) { 
                                                    let temp = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), me._select.result );
                                                    selection = convert.to ( 'std', mainlib.dependencies(), temp )
                                        }
                                else                 selection = convert.to ( 'std', mainlib.dependencies(), [me._select.structure, help.extractSelection(me)] )
                                break
                case 'breadcrumb'  :
                case 'breadcrumbs' : 
                                if ( hasSelection ) {
                                            let breadData = convert.from ( 'midFlat' ).toFlat ( mainlib.dependencies(), me._select.result );
                                            selection = convert.to ( 'breadcrumbs', mainlib.dependencies(), breadData )
                                    }
                                else {
                                            selection = convert.to ( 'breadcrumbs', mainlib.dependencies(), [me._select.structure, help.extractSelection(me)])
                                    }
                                break
                case 'tuple'  :
                case 'tuples' :
                                if ( hasSelection ) {
                                        let tupSelect = convert.from ( 'midFlat' ).toFlat ( mainlib.dependencies(), me._select.result );
                                        selection = convert.to ( 'tuples', mainlib.dependencies(), tupSelect )
                                    }
                                else {
                                        selection = convert.to  ( 'tuples', mainlib.dependencies(), [me._select.structure, help.extractSelection(me)]);
                                    }
                                break
                case 'file'        :
                case 'files'       :
                                let fileData, tuples;
                                if ( hasSelection ) {
                                        let fileSelect = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), me._select.result );
                                        fileData = convert.to ( 'breadcrumbs', mainlib.dependencies(), fileSelect )
                                    }
                                else    fileData = convert.to ( 'breadcrumbs', mainlib.dependencies, [me._select.structure, help.extractSelection(me)])
                                tuples  = help.reduceTuples ( mainlib.dependencies(), fileData ) 
                                selection = tuples.map ( ([k,v])=> {
                                                    if ( k )   return `${k}/${v}` 
                                                    else       return  v
                                                })
                                break
                case 'midFlat'   :
                                if ( hasSelection )   selection = { ...me._select.result }
                                else                  selection = convert.to ( 'midFlat', mainlib.dependencies(), [me._select.structure, help.extractSelection(me)])
                                break
                case 'flat'       : 
                                // NOTE: 
                                // The 'flat' is internal only data-type. Spread 'flat'
                                // always means 'shortFlat'.
                                // 
                case 'shortFlat' : 
                default          : {
                                if ( hasSelection ) {
                                        selection = convert.from ( 'midFlat').toFlat ( mainlib.dependencies(), me._select.result )
                                    }
                                else {
                                        let 
                                            set    = help.extractSelection ( me ) 
                                          , struct = walk ( me._select.structure )
                                          ;
                                        selection = [ struct, set ]
                                    }
                                }
                } // switch instruction
                
            if ( callback ) {
                        callback ( selection )
                        return me
                }
            else {
                        return selection
                }
        } // spread func.



    , spreadAll ( instruction, callback ) {
                this.all ()
                return this.spread ( instruction, callback )
        } // spreadAll func..

} // mainlib











const exportAPI = {
            hi () { return 'hi' }
        }










// * Official API
const API = {
    // DT I/O Operations
		    init       : mainlib.init                      // Convert any object to flat data-type
	      , load       : mainlib.load                      // Load a flat data-type
          , loadFast   : mainlib.load                      // Important! Method is depricated. Use load instead

          , preprocess : mainlib.preprocess                // Apply custom modifier to initial data.
          , add        : mainlib.modify ( 'add'       )    // Add data and keep existing data
          , update     : mainlib.modify ( 'update'    )    // Updates only existing data
          , overwrite  : mainlib.modify ( 'overwrite' )    // Add new data to DT object. Overwrite existing fields
          , insert     : mainlib.modify ( 'insert'    )    // Insert data on specified key, when the key represents an array.
          , combine    : mainlib.combine                   // Combine values for simular keys in arrays
          , append     : mainlib.modify ( 'append'    )    // Combine values for duplicated keys. main + update
          , prepend    : mainlib.modify ( 'prepend'   )    // Combine values for duplicated keys. update + main
          , log        : mainlib.errorLog                  // Executes callback with errors list as argument
          , empty      : () => Object.create ( exportAPI ) // Empty object with export methods

    // Provide Results      
          , replace    : mainlib.replace                   // Get this._selection.result as a main data
          , attach     : mainlib.attach                    // Attach this._selection.result to the main data. Set point of connection
          , spread     : mainlib.spread                    // Returns result of selection in a callback
          , spreadAll  : mainlib.spreadAll                 // Select all and returns it with one command in a callback
          , export     : mainlib.spread                    // Returns result of selection
          , exportAll  : mainlib.spreadAll                 // Select all and returns it with one command

    // Compare Operations
         , identical  :  mainlib.compare ( 'identical' )   // Value compare. Reduce data to identical key/value pairs.
         , change     :  mainlib.compare ( 'change'    )   // Value compare. Reduce to key/value pairs with different values.
         , same       :  mainlib.compare ( 'same'      )   // Key compare. Returns key/value pairs where keys are the same.
         , different  :  mainlib.compare ( 'different' )   // Key compare. Returns key/value pairs where key does not exist.
         , missing    :  mainlib.compare ( 'missing'   )   // Key compare. Returns key/value pairs that are missing.
    
    // Selectors
          , select     : mainlib.select             // Initialize a new selection.
          , parent     : mainlib.parent             // Selector. Apply conditions starting from parent level
          , find        : mainlib.find                // Selector. Fullfil select with list of arguments that contain specific string
          , all        : mainlib.find                // Selector. Same as find ('root')
          , folder     : mainlib.folder             // Selector. Fullfil selection with 'midFlat' object props
          , space      : mainlib.folder             // Selector. Same as 'folder'
          , deepObject : mainlib.block ( 'object' ) // Selector. Fullfil '_select' with deepest object elements
          , deepArray  : mainlib.block ( 'array'  ) // Selector. Fullfil '_select' with deepest array elements
          , invert     : mainlib.invert             // Selector. Invert existing selection
          , assemble   : mainlib.assemble           // Converts selection into 'array of objects' or 'single flat object'
          , purify     : mainlib.purify             // Removes all empty structures ( no props ) from the selection 

    // Filters      
          , limit      : mainlib.limit              // Filter.   Reduces amount of records in the selection
          , keep       : mainlib.keep               // Filter.   Keeps records in selection if check function returns true
          , remove     : mainlib.remove             // Filter.   Removes records from selection if check function returns true
          , deep       : mainlib.deep               // Filter.   Arguments ( num, direction - optional). Num mean level of deep. Deep '0' mean root members

    // Modifiers
          , withData      : mainlib.withData        // Generate "this._select.result" from the official data. Modifier will work with this data
          , withSelection : mainlib.withSelection   // Generate "this._select.result" content. Modifier will work with this data
          , flatten        : mainlib.flatten          // Mix existing objects in a single object.
          , mix           : mainlib.mix             // Mix objects in order. Start with a host and provide guests list [].
          , keyPrefix      : mainlib.keyPrefix        // Modify key as object name+key. Separator-symbol default: emptySpace. It can be modified.
          , reverse       : mainlib.reverse         // Change place of keys and values
}; // API                                               



module.exports = API


