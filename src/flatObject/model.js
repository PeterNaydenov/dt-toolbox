'use strict'



function model ( dependencies, flatIO ,flatStore ) {
return function model () {
    let
        selection = []          // Place for building a query/model result;
      , selectionIx = {}
      ;
    const
          { convert, draft, INIT_DATA_TYPES, main:{load} } = dependencies ()
        , draft_API = {
                          set     : draft.set ( selection, selectionIx )      // Selection: Creates a new row;
                        , connect : draft.connect ( selectionIx )             // Selection: Creates an edges among rows;
                        , save    : draft.save ( selectionIx )                // Selection: Sets property+value in specified selection row;
                        , push    : draft.push ( selectionIx )                // Selection: Adds a new value to selection row if data is an array structure;
                    }
        , [ fn, ...args ] = arguments
        , fnResult = fn ( {...flatStore,...draft_API}, ...args )
        , { as } = fnResult || {}
        , data = ( selection.length === 0 ) ? flatIO.export() : selection
        , hasConvertor = as ? INIT_DATA_TYPES.includes ( as ) : false
        ;

    // Validate `as` early. Before the fix, non-string `as` (e.g. 42, {})
    // was coerced to string by JS, and unknown names logged to console.error
    // and returned null — silent and confusing.
    // 'dt-object' is also a valid 'as' value (returns a new dt-object)
    // but isn't in INIT_DATA_TYPES so check it separately.
    if ( as !== undefined && as !== 'dt-object' && typeof as !== 'string' ) {
                throw new Error ( `model(fn) requires the 'as' value to be a string. Got: ${typeof as} (${as})` )
            }
    if ( as && as !== 'dt-object' && !hasConvertor ) {
                throw new Error ( `Model '${as}' is unknown. Supported: ${INIT_DATA_TYPES.join(', ')}, dt-object` )
            }

    let result;
    if ( as === 'dt-object'  ) {
                return load ( data )
        }
    if ( as )   result = convert.to ( as, dependencies, data )
    else        result = load ( data )
    flatIO.resetScan ()
    return result
}} // model func.



export default model


