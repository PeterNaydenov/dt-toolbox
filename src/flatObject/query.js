'use strict'



function query ( dependencies, flatIO, flatStore ) {
return function query () {
    const 
          { main:{load}, draft } = dependencies ()
        , [ fn, ...args ] = arguments
        ;
    let 
        selection = []          // Place for building a query/model result;
      , selectionIx = {}
      ;

    const draft_API = {
                  set     : draft.set ( selection, selectionIx )      // Selection: Creates a new row;
                , connect : draft.connect ( selectionIx )             // Selection: Creates an edges among rows;
                , save    : draft.save ( selectionIx )                // Selection: Sets property+value in specified selection row;
                , push    : draft.push ( selectionIx )                // Selection: Adds a new value to selection row if data is an array structure;
        }
    
    fn ( {...flatStore, ...draft_API}, ...args )
    flatIO.resetScan ()
    if ( selection.length === 0 )   return this
    return load ( selection )
}} // query func.



export default query


