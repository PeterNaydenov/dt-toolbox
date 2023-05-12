'use strict'



function query ( dependencies, flatIO ,flatStore ) {
return function query () {
    const 
          { main } = dependencies ()
        , { load } = main ()
        , [ fn, ...args ] = arguments
        ;
    
    fn ( flatStore, ...args )
    const result = flatIO.getSelection ();
    flatIO.reset ()
    if ( result.length === 0 )   return this
    return load ( result )
}} // query func.



export default query


