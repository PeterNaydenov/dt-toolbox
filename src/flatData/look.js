'use strict'



const
      NEXT   = '$__NEXT__LOOK_'
    , FINISH = '$__FINISH__WITH__THE__LOOKING_'
    , next   = () => NEXT
    , finish = () => FINISH
    ;



function look ( flatIO ) {
return function look ( fn ) {
    // Shared by all dt-lines: `finish()` stops the whole look, not only the current dt-line.
    // Before the fix, it was reset for each dt-line, so `finish()` worked like `next()`.
    let endLooking = false;

    flatIO.getScanList().every ( line => {
                        const
                              [ name, flatData, breadcrumbs, edges ] = line
                            ,  isArray = flatData instanceof Array ? true : false
                            ;

                        const links = edges.map ( edge => [ name, edge.slice ( breadcrumbs.length + 1 ) ] )   // edge is `breadcrumbs + '/' + child`

                        if ( isArray ) {
                                if ( flatData.length === 0 )   empty([])
                                else {
                                        flatData.every ( (value,key) => {
                                                    if ( endLooking )   return false   // Cancel other iterations
                                                    const callback = fn({ value, key, name, flatData, breadcrumbs, links, next, finish });
                                                    if ( callback === FINISH )   endLooking = true
                                                    return ( callback !== FINISH && callback !== NEXT )
                                            })
                                    }
                            }
                        else {
                                const test = Object.entries(flatData);
                                if ( test.length === 0 )   empty({})
                                else {
                                        test.every ( ([key, value]) => {
                                                    if ( endLooking )   return false   // Cancel other iterations
                                                    const callback = fn ({ value, key, name, flatData, breadcrumbs, links, next, finish });
                                                    if ( callback === FINISH )   endLooking = true
                                                    return ( callback !== FINISH && callback !== NEXT )
                                            })
                                    }
                                
                            }
                        function empty ( flatData ) {
                                    const callback = fn ({ value:null, key:null, name, flatData, breadcrumbs, links, empty: true, next, finish });
                                    if ( callback === FINISH )   endLooking = true
                            } // empty func.
                        return !endLooking   // Stop visiting dt-lines after `finish()`
            })
    flatIO.resetScan ()   // Also when the scan-list was empty
}} // look func.



export default look


