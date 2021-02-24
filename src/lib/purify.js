const update = require("../modifiers/update");

function purify ( dependencies, me ) {
    const     
              { structure, value } = me._select
            , structReverse = structure.reverse ()
            ;
    let objectIndexes = value.reduce ( (res,item) => {
                                                let num = parseInt (item.split ( '/' )[1]);
                                                if ( !res.includes( num) )   res.push ( num )
                                                return res
                                        },[]);
            
    me._select.structure = structReverse.reduce ( (res, strObject ) => {
                                                let 
                                                    [ type, item, ...nums ] = strObject
                                                    , ln = strObject.length
                                                    , updated = [ type, item ]
                                                    ;
                                                if ( ln == 2 && !objectIndexes.includes(item) )   return res
                                                nums.forEach ( x => {
                                                            let id = x[0];
                                                            if ( objectIndexes.includes(id) ) {  
                                                                        updated.push ( [...x] )
                                                                        if ( !objectIndexes.includes(item) )   objectIndexes.push ( item )
                                                                }
                                                        })
                                                if ( !objectIndexes.includes(item) )   return res
                                                res.push ( [...updated] )
                                                return res
                                        },[]).reverse ()
    return me
} // assemble func..



module.exports = purify


