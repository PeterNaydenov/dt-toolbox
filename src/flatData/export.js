'use strict'

function ex ( flatStorage ) {
return function ex ( name ) {
        const [ , indexes, flatData ] = flatStorage;

        if ( name && !indexes[name] )   return []
        if ( !name ) {
                const exportCopy = []
                flatData.forEach ( line => {
                                    const 
                                          [ lnName, data, breadcrumbs, edges ] = line
                                        , dataChange = ( data instanceof Array ) ? [ ...data] : { ...data }
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
                                , dataChange = ( data instanceof Array ) ? [ ...data ] : { ...data }
                                , breadcrumbsChange = ( breadcrumbs.includes('/') ) ? breadcrumbs.replace ( search, 'root/' ) : 'root'
                                , edgesChange = edges.map ( edge => edge.replace ( search, 'root/'))
                                ;
                            selection.push ([ nameChange, dataChange, breadcrumbsChange, edgesChange ])
                        }

            })
        return selection
}}



export default ex


