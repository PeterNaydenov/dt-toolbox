'use strict'



function model ( dependencies, flatIO ,flatStore ) {
return function model () {
    let 
        selection = []          // Place for building a query/model result;
      , selectionIx = {}
      ;
    const 
          { convert, draft } = dependencies ()
        , draft_API = {
                          set     : draft.set ( selection, selectionIx )      // Selection: Creates a new row;
                        , connect : draft.connect ( selectionIx )             // Selection: Creates an edges among rows;
                        , save    : draft.save ( selectionIx )                // Selection: Sets property+value in specified selection row;
                        , push    : draft.push ( selectionIx )                // Selection: Adds a new value to selection row if data is an array structure;
                    }
        , [ fn, ...args ] = arguments
        , { as } = fn ( {...flatStore,...draft_API}, ...args ) || {}
        , data = ( selection.length === 0 ) ? flatIO.export() : selection
        , CONVERTOR_NAMES = [ 'standard', 'std', 'midFlat', 'tuple', 'tuples', 'breadcrumb', 'breadcrumbs', 'files', 'file' ]
        , hasConvertor = as ? CONVERTOR_NAMES.includes ( as ) : false
        ;

    let result;
    if ( as && !hasConvertor ) {
                console.error ( `Model '${as}' is unknown data-model.` )
                return null
        }
        
    if ( as )   result = convert.to ( as, dependencies, data )
    else        result = data
    flatIO.resetScan ()
    return result
}} // model func.



export default model


