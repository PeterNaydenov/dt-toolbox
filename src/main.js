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
      dtlib      = require ( './dt-lib'     ) 
    , standard = require ( './convertors/standard' )
    , file      = require ( './convertors/files'     )
    , convertor = {
                          std : standard
                        , file
                        // Other possible format convertors:
                        // file[], breadcrumbs, tuples[]
                    }
    , importDataTypes = Object.keys ( convertor )
    ;


// TODO: move it in right place... 
function sanitizeFlat ( obj ) {
        return Object.keys(obj).reduce ( (r,k) => {
                                let newK = k;
                                if ( !k.includes('root/') )   newK = `root/${k}`
                                r [newK] = obj[k]
                                return r
                    },{})
    } // sanitizeFlat func.





const mainlib = {



    dependencies () {
                const help  = Object.create ( API );
                function simpleDT () {
                            const dt  = Object.create ( API );
                            dt.value     = dt.empty ()
                            dt.structure = []
                            dt._select   = []
                            dt._error    = []
                            return dt
                    } // simpleDT func.
                return {
                          simpleDT
                        , empty: help.empty
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

    , init ( stData, options ) {   // dataType is instruction to convertor
            let 
                  dependencies = mainlib.dependencies () 
                , dt = dependencies.simpleDT ()
                , defaultOptions = {format:'std', mod:false }
                , {format='std', mod=false } = { ...defaultOptions,...options }
                ;
            if ( !importDataTypes.includes(format)   ) {
                        console.error ( "Can't understand your data-type. Please, find what is possible on http://todo.add.documentation.link.here"  )
                        return
                }
            if ( stData != null ) {
                        const [structure, value] = convertor[format].toFlat ( dependencies, stData )
                        dt.structure = [...structure]
                        dt.value     = value
                }
            if ( !mod   )   return dt
            else {                   
                                    let [structure, value] = dtlib.transform ( {...dependencies, mod }, [dt.structure, dt.value] )
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



} // mainlib











const exportAPI = {
            hi () { return 'hi' }
        }










// * Official API
const API = {
    // DT I/O Operations
		    init       : mainlib.init      // Start chain with data or empty
	      , load       : mainlib.load      // Load DT object or value.
    //    , loadFast   : dtlib.loadFast    // Use only when no meta-related operations
    //    , preprocess : dtlib.preprocess  // Convert ST to DT object. Change income data before add, update, overwrite.
    //    , add        : dtlib.add         // Add data and keep existing data
    //    , update     : dtlib.update      // Updates only existing data
    //    , insert     : dtlib.insert      // Insert data on specified key, when the key represents an array.
    //    , overwrite  : dtlib.overwrite   // Add new data to DT object. Overwrite existing fields
    //    , spread     : dtlib.spread      // Export DT object
    //    , spreadAll  : dtlib.spreadAll   // Select all and export DT object with one command
    //    , log        : dtlib.errorLog    // Executes callback with errors list as argument
          , empty      : () => Object.create ( exportAPI ) // Empty object with export methods
       
    // // Compare Operations
    //    , identical  :  dtlib.identical // Value compare. Reduce data to identical key/value pairs.
    //    , change     :  dtlib.change    // Value compare. Reduce to key/value pairs with different values.
    //    , same       :  dtlib.same      // Key compare. Returns key/value pairs where keys are the same.
    //    , different  :  dtlib.different // Key compare. Returns key/value pairs where key does not exist.
    //    , missing    :  dtlib.missing   // Key compare. Returns key/value pairs that are missing'
    
    // // Selectors and Filters
    //    , select     : dtlib.select          // Init new selection.
    //    , parent     : dtlib.parent          // Selector. Apply conditions starting from parent level
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


