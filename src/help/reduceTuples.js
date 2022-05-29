'use strict'

function reduceTuples ( dependencies, breadcrumbData ) {
  // *** Converts breadcrumbs to array of tuples
    const 
          { help, walk } = dependencies
        , result = []
        ;
    walk ( breadcrumbData, ( v, k ) => {
                      let 
                            arr = k.substr(5).split('/')
                          , ln = arr.length
                          , lastEl = arr[ln-1]
                          ;
                      if ( help.hasNumbers([lastEl]) )   arr.pop ()    
                      result.push ( [ arr.join('/'), v])
            })
    return result
} // reduceTuples func.



module.exports = reduceTuples


