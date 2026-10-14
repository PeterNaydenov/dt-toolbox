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
        selectionIx[bread] = childLine   // Index by breadcrumbs too, so descendants can be found on later re-parenting

        // Re-parent descendants: update their breadcrumbs and the edges pointing to them.
        // Before the fix, connecting a dt-line that already had children
        // (e.g. 'mid/leaf' then 'root/mid') crashed with "Cannot read properties of undefined".
        const prefix = `${oldBread}/`;   // Plain prefix check: names may contain RegExp special characters
        childLine[3].forEach ( (br,i) => {
                        const brUpdate = br.startsWith ( prefix ) ? `${bread}/${br.slice ( prefix.length )}` : br;
                        updateBreadcrumbs ( selectionIx, br, brUpdate )
                        childLine[3][i] = brUpdate
                })
} // updateBreadcrumbs func.



export default connect


