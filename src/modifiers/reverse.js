function reverse ( mainData, list ) {
    let main = {...mainData };
    for ( const name of list ) {
                if ( main[name] ) {
                        let 
                              source = {...main[name]}
                            , keys = Object.keys(source)
                            ;
                        main[name] = {}
                        keys.forEach ( k => {
                                    let v = source[k];
                                    main[name][v] = k
                                })
                    }
        }
    return main
} // reverse func.



module.exports = reverse


