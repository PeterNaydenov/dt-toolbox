'use strict'



function look ( flatIO ) {
return function look ( fn ) {
    flatIO.getScanList().forEach ( line => {
                        const 
                              [ name, flatData, breadcrumbs, edges ] = line
                            ,  isArray = flatData instanceof Array ? true : false
                            , next  = () => '$__NEXT__LOOK_'
                            , finish = () => '$__FINISH__WITH__THE__LOOKING_'
                            ;
                        let endLooking = false;

                        const links = edges.map ( edge => { 
                                                    let child = edge.replace ( `${breadcrumbs}/`, '')
                                                    return [ name, child ]
                                            })

                        if ( isArray ) {
                                if ( flatData.length === 0 )   empty([])
                                else {
                                        flatData.every ( (value,key) => {
                                                    if ( endLooking )   return false   // Cancel other iterations
                                                    const callback = fn({ value, key, name, flatData, breadcrumbs, links, next, finish });
                                                    if ( callback === finish() )   endLooking = true
                                                    return ( [ finish(), next() ].includes ( callback )) ? false : true 
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
                                                    if ( callback === finish() )   endLooking = true
                                                    return ( [ finish(), next()].includes ( callback )) ? false : true 
                                            })
                                    }
                                
                            }
                        function empty ( flatData ) {
                                    fn ({ value:null, key:null, name, flatData, breadcrumbs, links, empty: true, next, finish })
                            } // empty func.
                        flatIO.resetScan ()
            })
}} // look func.



export default look


