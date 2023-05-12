'use strict'



function find ( flatIO ) {
return function find ( name ) {
        const list = [];
        flatIO.getScanList().forEach ( line => {
                        const lnName = line[0];
                        if ( lnName === name )   list.push( line ) 
                })
        flatIO.setupScanList ( list )
        return this
}} // find func.



export default find


