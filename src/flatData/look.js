'use strict'



const
      NEXT   = '$__NEXT__LOOK_'
    , FINISH = '$__FINISH__WITH__THE__LOOKING_'
    , next   = () => NEXT
    , finish = () => FINISH
    ;



function look ( flatIO ) {
return function look ( fn ) {
    // Plain loops instead of `every` and `Object.entries`: no closure and no [key,value] pair per property.
    // Same visits as before: values are read before the callbacks (like `Object.entries`),
    // array length is fixed at the start and holes are skipped (like `every`).
    const
          scanList = flatIO.getScanList ()
        , total    = scanList.length   // Fixed, like `every`: dt-lines inserted by a callback are not visited
        ;

    for ( let i = 0; i < total; i++ ) {
            const
                  [ name, flatData, breadcrumbs, edges ] = scanList[i]
                , cut   = breadcrumbs.length + 1
                , links = new Array ( edges.length )
                ;
            let callback;

            for ( let e = 0; e < edges.length; e++ )   links[e] = [ name, edges[e].slice ( cut ) ]   // edge is `breadcrumbs + '/' + child`

            if ( flatData instanceof Array ) {
                    const length = flatData.length;
                    if ( length === 0 )   callback = fn ({ value:null, key:null, name, flatData:[], breadcrumbs, links, empty: true, next, finish })
                    for ( let key = 0; key < length; key++ ) {
                            if ( !( key in flatData ) )   continue
                            callback = fn ({ value: flatData[key], key, name, flatData, breadcrumbs, links, next, finish })
                            if ( callback === FINISH || callback === NEXT )   break
                        }
                }
            else {
                    const
                          keys   = Object.keys ( flatData )
                        , values = Object.values ( flatData )
                        ;
                    if ( keys.length === 0 )   callback = fn ({ value:null, key:null, name, flatData:{}, breadcrumbs, links, empty: true, next, finish })
                    for ( let k = 0; k < keys.length; k++ ) {
                            callback = fn ({ value: values[k], key: keys[k], name, flatData, breadcrumbs, links, next, finish })
                            if ( callback === FINISH || callback === NEXT )   break
                        }
                }
            if ( callback === FINISH )   break   // `finish()` stops the whole look, not only the current dt-line
        }
    flatIO.resetScan ()   // Also when the scan-list was empty
}} // look func.



export default look
