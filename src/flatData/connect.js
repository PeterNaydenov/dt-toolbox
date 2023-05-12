'use strict'


function connect ( selectionIx ) {
return function connect ( list ) {
            list.forEach ( item => {
                        let arr = item.split ( '/' )
                        const 
                               child = arr.pop ()
                             , parent = arr.pop ()
                            , line = selectionIx[parent]
                            , childLine = selectionIx[child]
                            ;
                            
                        if ( !childLine     )   return this
                        if ( !line          )   return this
                        if ( line[1][child] )   return this

                        let breadcrumbs = `${line[2]}/${child}`;

                        updateBreadcrumbs ( selectionIx , child, breadcrumbs )
                        if ( line[3].includes(breadcrumbs) )   return this
                        line[3].push ( breadcrumbs )
                        return this
                })
}} // connect func.



function updateBreadcrumbs ( selectionIx, child, bread ) {
        const 
              childLine = selectionIx[child]
            , oldBread = childLine [2]
            ;

        childLine[2] = bread
        selectionIx[oldBread] = childLine

        childLine[3].forEach ( (br,i) => {
                        const search = new RegExp (`^${oldBread}\/`);
                        const brUpdate = br.replace ( search, `${bread}/` );
                        updateBreadcrumbs ( selectionIx[br], br, brUpdate )
                })
} // updateBreadcrumbs func.



export default connect


