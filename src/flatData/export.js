'use strict'

function ex ( flatStorage ) {
return function ex ( name ) {
        const [ , indexes, flatData ] = flatStorage;

        // Reject invalid argument types with a clear message.
        // Before the fix, `export(null)`/`export(0)`/`export('') silently
        // returned the whole model, and `export(42)` silently returned `[]`.
        if ( name !== undefined && typeof name !== 'string' ) {
                throw new Error ( `export(name) expects a string segment name or no argument. Got: ${typeof name} (${name}).` )
            }

        if ( name && !indexes[name] )   return []
        if ( !name ) {
                const exportCopy = []
                flatData.forEach ( line => {
                                    const
                                          [ lnName, data, breadcrumbs, edges ] = line
                                        , dataChange = copyData ( data )
                                        ;
                                    exportCopy.push ([ lnName, dataChange, breadcrumbs, [...edges] ])

                        })
                return exportCopy
            }

        // If existing name:
        const selection = [];
        flatData.forEach ( line => {
                    const
                          [ lnName, data, breadcrumbs, edges ] = line
                        , search = new RegExp ( `^${name}\/`)
                        ;
                    if ( breadcrumbs === name || breadcrumbs.match(search) ) {
                            let
                                  nameChange = ( lnName === breadcrumbs ) ? 'root' : lnName
                                , dataChange = copyData ( data )
                                , breadcrumbsChange = ( breadcrumbs.includes('/') ) ? breadcrumbs.replace ( search, 'root/' ) : 'root'
                                , edgesChange = edges.map ( edge => edge.replace ( search, 'root/'))
                                ;
                            selection.push ([ nameChange, dataChange, breadcrumbsChange, edgesChange ])
                        }

            })
        return selection
}}

/**
 * Copy a flatData value while preserving primitive types.
 * Previously this used `data instanceof Array ? [...data] : {...data}`,
 * which silently spread a string into `{0:'n',1:'e',...}` (Bug fix 7).
 * @param {*} data - value to copy
 * @returns {*} copy
 */
function copyData ( data ) {
        if ( data === null || data === undefined )   return data
        if ( typeof data !== 'object' )              return data   // string, number, boolean, bigint, symbol, function
        if ( Array.isArray ( data ) )                return [ ...data ]
        if ( data instanceof Date )                 return new Date ( data.getTime () )
        if ( data instanceof RegExp )                return new RegExp ( data.source, data.flags )
        return { ...data }
    }



export default ex


