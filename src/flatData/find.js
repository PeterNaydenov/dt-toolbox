'use strict'



function find ( flatIO ) {
return function find ( name ) {
        if ( flatIO.isFullScan () ) {
                const names = flatIO.getNameIndex ();   // `null` on the first request
                if ( names ) {
                        flatIO.setupScanList ( names.get ( name ) || [] )
                        return this
                    }
            }
        const list = [];
        flatIO.getScanList().forEach ( line => {
                        const lnName = line[0];
                        if ( lnName === name )   list.push( line ) 
                })
        flatIO.setupScanList ( list )
        return this
}} // find func.



export default find
