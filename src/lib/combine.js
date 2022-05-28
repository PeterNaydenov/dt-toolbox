function combine ( dependencies, main, addData ) {
    // ***   Modify combine
                const
                      { convert, modifier, walk } = dependencies 
                    , mainData = convert.to ( 'midFlat', dependencies, [main.structure, main.value])
                    , update   = convert.to ( 'midFlat', dependencies, [addData.structure, addData.value] )
                    , keyList = Object.keys ( update )
                    ;
                let result;
                main._error = main._error.concat ( addData._error )
                result = keyList.reduce ( (res,k) => {
                                                    let 
                                                          check = k.split('/').pop()
                                                        , rootKeys = Object.keys(res['root'])
                                                        ;
                                                    if ( check !='root' && res[k] ) {
                                                            let up = {}
                                                            up[k] = {...update[k]}
                                                            return modifier ['combineShallow'] ( res, up )
                                                        }
                                                    if ( check!='root' && rootKeys.includes(check) ) {  
                                                                let up = {};
                                                                up[k] = {...update[k]}
                                                                return modifier['combineShallow'] ( res, up)
                                                        }
                                                    else        return modifier['combineShallow'] ( res, { root: {...update[k]}} )
                                        }, mainData )   
                let [structure, value ] = convert.from ( 'midFlat').toFlat ( dependencies, result )
                main.structure = walk ( structure )
                main.value = value
                return main
    } // combine func.
        


module.exports = combine


