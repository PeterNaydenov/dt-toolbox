function assemble ( dependencies, me ) {
            const     
                      { structure, value } = me._select
                    , listIndex            = new Set ()
                    , countObjects         = new Set ()
                    , firstRow              = [ 'array', 0 ]
                    ;
                let small = value.reduce ( (res, k) => {
                                            let num = parseInt ( k.split ( '/' )[1] );
                                            listIndex.add ( num )
                                            if ( num < res )   res = num
                                            return res
                                    }, 100000 )
                // small -> id of first object with primitive values
                me._select.structure = structure.reduce ( (res,item) => {   // Build structure of selection
                                                    let 
                                                          ix = item[1]
                                                        , inScope = ( ix >= small )
                                                        ;
                                                    if ( inScope && listIndex.has(ix)   ) {
                                                                    res.push ([...item])
                                                                    countObjects.add ( ix )
                                                        }
                                                    return res
                                            }, [ firstRow ]   )

                if ( listIndex.has(0) )   me._select.structure.splice ( 1, 1 )
                if ( countObjects.size > 1 ) {   // Selection has more than one object. Connect objects to root element
                            let countIx = 0;
                            countObjects.forEach ( i => {
                                        let rec = me._select.structure[0];
                                        if ( i != 0 )   rec.push ( [i, countIx++])
                                    })
                    }
                else {   // Data comes from a single source. Use that source object as 'root'.
                            me._select.structure.splice ( 0, 1 )
                    }
                return me
} // assemble func..



module.exports = assemble


