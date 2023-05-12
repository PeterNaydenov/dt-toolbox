'use strict'

/**
 *  Find an object on specific route
 * 
 */



function get ( flatIO ) {
return function find ( name ) {
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


