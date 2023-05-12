'use strict'



function toFlat ( dependencies, d ) {   // Converts data to 'dt' model
        const 
              { walk } = dependencies ()
            , indexes = {}
            , buffer = {root:[]}
            , dt = []
            ;
                        function readKey ( k ) {
                                    let name, crumbs, key;
                                    if ( k == 'root' ) {
                                                name= 'root'
                                                crumbs = 'root'
                                                key = null
                                                return [ name, crumbs, key ]
                                        }

                                    const splited = k.split ( '/' )
                                    if ( splited.length === 2 ) {
                                            name =  'root'
                                            crumbs = 'root'
                                            key = splited.pop ()
                                        }
                                    if ( splited.length > 2 ) {
                                            key = splited.pop ()
                                            name = splited.pop ()
                                            if ( splited.length === 0 )   crumbs = `root/${name}`
                                            else                          crumbs = `${splited.join('/')}/${name}`
                                        }
                                    return [ name, crumbs, key ]
                            } // readKey func.



                        function makeContainers ( k ) {
                                    if ( k === 'root' ) return
                                    const ar = k.split ( '/' );
                                    ar.pop ()
                                    const container = ar.join ( '/' );
                                    if ( !buffer[container] )   buffer[container] = []
                                    if ( container.includes('/') )   makeContainers(container)
                            } // makeContainers func.



        d.forEach ( tupleRow => {
                        const [ k, v ] = tupleRow
                            , key = ( k === 'root') ? 'root' : `root/${k}`
                            ;
                        if ( buffer[key] )   buffer[key].push ( v )
                        else                 buffer[key] = [ v ]
                        makeContainers ( key )
            }) // d forEach

                        
        
    // Setup containers only objects/arrays
    let bufferEntries = Object.entries ( buffer ).sort();
    const containers = { root:'object' }
    bufferEntries.forEach ( ([k,v]) => {
                    if ( k === 'root' )   return
                    const 
                            arr = k.split('/')
                            , el = arr.pop ()
                            , parent = arr.join ( '/' )
                            , notArray = (containers[parent] === 'array') ? false : true
                            ;
                    if ( notArray && !isNaN(el) )   containers[parent] = 'array'
                    if ( v.length === 0         )   containers[k] = 'object'
            })


    
    // Fill the data
    bufferEntries = Object.entries ( buffer ).sort();
    bufferEntries.forEach ( ([ k, v]) => {
                    const 
                          [ name, crumbs, key ] = readKey ( k )
                        , isContainer = (v.length === 0) ? true : false
                        , isProp = (v.length === 1) ? true : false
                        ;
                    let line, structure;

                    if ( isContainer ) {
                                if ( indexes[`${crumbs}/${key}`] )   return
                                if ( key == null ) { // case 'root'
                                            structure = (containers['root'] === 'object') ? {} : [] 
                                            line = [ 'root', structure, 'root', []]
                                            indexes['root'] = line
                                            dt.push ( line )
                                            return
                                    }
                                
                                structure = ( containers[`${crumbs}/${key}`] === 'object' ) ? {} : [];
                                line = [ key, structure, `${crumbs}/${key}`, [] ]
                                indexes[`${crumbs}/${key}`] = line
                                dt.push ( line )
                                return
                        }
                    
                    if ( !isProp ) {   // arrays with values 
                                line = [ key, v, `${crumbs}/${key}`, []]
                                indexes [`${crumbs}/${key}`] = line
                                dt.push ( line )
                                return
                        }
                    
                    if ( indexes[`${crumbs}`] )  indexes[crumbs][1][key] = v[0]
                    else {
                                const obj = {}
                                obj[key] = v[0]
                                line = [ name, obj, crumbs, []]
                                indexes[crumbs] = line
                                dt.push ( line )
                        }
            }) // buffEntries forEach
                
        // Setup edges
        dt.reverse ()
        dt.forEach ( line => {
                        const 
                              [ name, flatData, breadcrumbs ] = line
                            , parentCrumbs = breadcrumbs.replace ( `/${name}`, '' )
                            , l = indexes[parentCrumbs]
                            ;
                        if ( parentCrumbs === breadcrumbs )   return                        
                        if ( l )   l[3].push ( breadcrumbs )
                }) // revDT
        dt.reverse ()
        const copy = walk ({ data : d });
        return [ copy, indexes, dt ]
    } // toFlat func.





function toType ( dt ) {   // Converts data to tuples
        let result = [];
        dt.forEach ( line => {
                    const 
                          [ name, flatData, breadcrumbs ] = line
                        , isArray = flatData instanceof Array ? true : false
                        // , result = []
                        ;
                    let nakedBread = '';
                    if ( name !== 'root' )    nakedBread = breadcrumbs.replace ( `root/`, '' )

                    if ( isArray ) {
                                if ( nakedBread.length == 0 )   result.push (['root', el])
                                else   flatData.forEach ( el => result.push ([nakedBread, el]))
                                return
                        }
                    
                    const scan = Object.entries ( flatData )
                    scan.forEach ( ([k, v]) => {
                                        if ( nakedBread.length == 0 )   result.push ([k, v])
                                        else                            result.push ([`${nakedBread}/${k}`, v])
                            })
            }) // forEach line
        return result
} // toType func.



export default { toFlat, toType }


