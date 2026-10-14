'use strict'

function ex ( flatStorage ) {
return function ex ( name ) {
        const [ indexes, flatData ] = flatStorage;

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
        // Plain prefix checks instead of a RegExp built from the name. Before the fix,
        // names with special characters threw (e.g. 'a(') or matched other segments ('a.b' matched 'aXb').
        const
              selection = []
            , prefix = `${name}/`
            // 'root' needs no rebase. Building equal long strings is slow on deep data
            , rebase = name === 'root' ? br => br : br => br.startsWith ( prefix ) ? `root/${br.slice ( prefix.length )}` : br
            ;
        flatData.forEach ( line => {
                    const [ lnName, data, breadcrumbs, edges ] = line;
                    if ( breadcrumbs === name || breadcrumbs.startsWith ( prefix ) ) {
                            let
                                  nameChange = ( lnName === breadcrumbs ) ? 'root' : lnName
                                , dataChange = copyData ( data )
                                , breadcrumbsChange = ( breadcrumbs.includes('/') ) ? rebase ( breadcrumbs ) : 'root'
                                , edgesChange = edges.map ( rebase )
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


