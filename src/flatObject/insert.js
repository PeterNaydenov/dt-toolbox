'use strict'

function insert ( dependencies, flatIO ) {
return function insert ( name, inData ) {
            
            if ( !inData.export && !(typeof( inData.export) === 'function'))   return null
            let 
                  d    = inData.export ()
                , copy = inData.copy ()
                ;
            
            const search = new RegExp ( `^root\/` );
            d.forEach ( line => {   // Word 'root' should be changed to the argument 'name'.
                        if ( line[0] === line[2] ) {  
                                line[0] = name
                                line[2] = name
                            }
                        line[2] = line[2].replace ( search, `${name}/` )
                        line[3].forEach ( (edge,i) => line[3][i] = edge.replace ( search, `${name}/` )   )
                })
            flatIO.insert ( [copy,,d])
}} // insert func.



export default insert


