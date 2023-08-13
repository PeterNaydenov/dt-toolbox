'use strict'

function insert ( dependencies, flatIO ) {
return function insert ( name, inData ) {
            const { convert, isDTO, isDTM, walk } = dependencies();
            let d, copy;

            if ( isDTO(inData) ) {
                        d    = inData.export ()
                        copy = inData.copy ()
                        
               }
            else if ( isDTM(inData) ) {
                        d = walk ({ data : inData })
                        copy = walk ({ data : inData })
                }
            else {
                        [ copy,, d ] = convert.from ( 'std' ).toFlat ( dependencies, inData )
                        console.warn ( 'A non "dt-object" data segment was inserted. Autoconverted to "dt-object".' )
                }
            
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


