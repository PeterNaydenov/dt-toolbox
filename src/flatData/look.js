'use strict'



function look ( flatIO ) {
return function look ( fn ) {
    flatIO.getScanList().forEach ( line => {
                        const 
                              [ name, flatData, breadcrumbs, edges ] = line
                            ,  isArray = flatData instanceof Array ? true : false
                            ;

                        const links = edges.map ( edge => { 
                                                    let child = edge.replace ( `${breadcrumbs}/`, '')
                                                    return [ name, child ]
                                            })

                        if ( isArray ) {
                                if ( flatData.length === 0 )   empty([])
                                else {
                                        flatData.every ( (value,key) => {
                                                    const callback = fn({ value, key, name, flatData, breadcrumbs, links });
                                                    return ( callback === 'next' ) ? false : true 
                                            })
                                    }
                            }
                        else {
                                const test = Object.entries(flatData);
                                if ( test.length === 0 )   empty({})
                                else {
                                        test.every ( ([key, value]) => {
                                                    const callback = fn ({ value, key, name, flatData, breadcrumbs, links });
                                                    return ( callback === 'next' ) ? false : true 
                                            })
                                    }
                                
                            }
                        function empty ( flatData ) {
                                    fn ({ value:null, key:null, name, flatData, breadcrumbs, links, empty: true })
                            } // empty func.
                        flatIO.resetScan ()
            })
}} // look func.



export default look


