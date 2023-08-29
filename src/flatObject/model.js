'use strict'



function model ( dependencies, flatIO ,flatStore ) {
return function model () {
    const 
          [ fn, ...args ] = arguments
        , { as } = fn ( flatStore, ...args ) || {}
        , { convert } = dependencies ()
        , selection = flatIO.getSelection ()
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
    flatIO.reset ()
    return result
}} // model func.



export default model


