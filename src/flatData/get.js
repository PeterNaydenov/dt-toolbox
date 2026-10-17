'use strict'

/**
 *  Find an object on specific route
 * 
 */



function get ( flatIO ) {
return function get ( name ) {
        const line = flatIO.getLine ( name );
        if ( !line ) {   // Every dt-line is in the index: not there means no match
                flatIO.setupScanList ( [] )
                return this
            }
        if ( flatIO.hasUniqueBreadcrumbs () ) {   // The index holds the only dt-line with these breadcrumbs
                const found = flatIO.isFullScan () || flatIO.getScanList().includes ( line );
                flatIO.setupScanList ( found ? [ line ] : [] )
                return this
            }
        // Repeated breadcrumbs: the index holds the last one, but `get` returns the first one in the scan-list
        const list = [];
        flatIO.getScanList().every ( line => {
                        const loc = line[2];
                        if ( loc === name ) {  
                                list.push( line ) 
                                return false
                            }
                        return true
                })
        flatIO.setupScanList ( list )
        return this
}} // get func.



export default get
