function toBreadcrumbKeys ( keys, structure ) {   // (flatKey[], structure ) => breadcrumbKeys[]
    // *** Map convertion of flat keys to breadcrumb keys.
           let containerNames = [ 'root' ];
           structure.forEach ( level => { 
           level.forEach ( (obj,i) => {   // Find container names
                           let 
                                 objectID = level[1]
                               , container = containerNames[objectID]
                               ;
                           if ( i > 1 )   containerNames.push ( `${container}/${obj[1]}`)
                   })
                   })
           return keys.map ( k => {
                                   let 
                                         splited     = k.split ( '/' )
                                       , containerID = splited [ 1 ]
                                       , prop        = splited [ 2 ]
                                       , long        = containerNames [ containerID ]
                                       ;
                                   return `${long}/${prop}`
                           })
} // toBreadcrumbKeys func.



module.exports = toBreadcrumbKeys


