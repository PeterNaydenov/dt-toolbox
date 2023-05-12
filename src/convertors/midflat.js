'use strict'



function toFlat ( dependencies, d ) {   // Converts data to 'dt' model
        const 
              entries = Object.entries ( d )
            , { walk } = dependencies ()
            , indexes = {}
            , dt = []
            , containers = {}
            , buffer = {}
            ;
                        function findContainers ( br ) {
                                        if ( !containers[br] )   containers[br] = 'object'
                                        const arr = br.split ( '/' );
                                        if ( arr.length == 1 )   return
                                        arr.pop ()
                                        if ( arr.length == 1 )   return
                                        findContainers ( arr.join('/') )
                                } // findContainers func.

                        function checkData ( br, midData ) {
                                        const k = Object.keys ( midData );
                                        k.forEach ( key => {
                                                        if ( !isNaN(key) )   containers[br] = 'array'
                                                })
                                } // checkData func.

        entries.forEach ( ([br, midData]) => {
                        if ( !br.startsWith('root') )   br = `root/${br}`
                        findContainers ( br )
                        checkData ( br, midData )
                        buffer[br] = midData
                })

        // Add containers to other data in buffer. Modify the data according the container type
        const containerEntries = Object.entries ( containers );
        containerEntries.forEach ( ([ k, t]) => {
                        if ( buffer[k] === 'object' )   return
                        if ( buffer[k] ) {
                                const isArray = buffer[k] instanceof Array;
                                if ( t === 'array' && !isArray ) {
                                                const list = Object.values ( buffer[k] )
                                                buffer[k] = list
                                        }
                                return
                            }
                        const structure = ( t === 'object' ) ? {} : [];
                        buffer[k] = structure
                }) // containerEntries forEach

        const bufferEntries = Object.entries ( buffer ).sort();
        bufferEntries.forEach ( ([ breadcrumbs, flatData]) => {
                        const 
                              name = breadcrumbs.split ( '/' ).pop ()
                            , parent = breadcrumbs.replace ( `/${name}`, '' )
                            , dcopy  = flatData instanceof Array ? [...flatData] : {...flatData}
                            , line = [ name, dcopy, breadcrumbs, [] ]
                            ;
                        
                        indexes[breadcrumbs] = line
                        dt.push ( line )
                        if ( breadcrumbs === 'root' )   return
                        if ( !parent                )   return
                        if ( indexes[parent] )   indexes[parent][3].push ( breadcrumbs )
                }) // forEach entry

        const copy = walk ({ data : d })
        return [ copy, indexes, dt ]
    } // toFlat func.



function toType ( dt ) {   // Converts data to midFlat
        const result = {};
        dt.forEach ( line => {
                    const 
                          [ , flatData, breadcrumbs ] = line
                        , isEmpty = (Object.keys ( flatData ).length === 0)
                        ;
                    if ( isEmpty )   return
                    const 
                          br = breadcrumbs.replace ( 'root/', '' )
                        , d = flatData instanceof Array ? [...flatData] : {...flatData}
                        ;
                    result [br] = d
            }) // forEach line
        return result
} // toType func.



export default { toFlat, toType }


