'use strict'



function like ( flatIO ) {
return function like ( name ) {
        const 
                  list = []
                , listNames = (name instanceof Array) ? name : [name]
                ;

        flatIO.getScanList().forEach ( line => {
                        const lnName = line[0];
                        listNames.forEach ( nm => { if ( lnName.includes(nm) )   list.push ( line )   })                        
                })
        flatIO.setupScanList ( list )
        return this
}} // like func.



export default like


