'use strict'



function like ( flatIO ) {
return function like ( name ) {
        const 
                  list = []
                , listNames = (name instanceof Array) ? name : [name]
                ;

        flatIO.getScanList().forEach ( line => {
                        const lnName = line[0];
                        if ( listNames.some ( nm => lnName.includes(nm) ) )   list.push ( line )   // Once, also when more texts match
                })
        flatIO.setupScanList ( list )
        return this
}} // like func.



export default like


