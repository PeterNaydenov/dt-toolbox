function block ( dependencies, me ) {
/**
 *  Selects deeper structure 'array' or 'object' 
 */
    const 
            { type } = dependencies
          , keys     = Object.keys ( me.value )
          ;
    let selectedIDs = me.structure.reduce ( (res,row) => {
                                  let rowType = row[0];
                                  if ( rowType != type )   return res
                                  if ( row.length == 2 )   res.push ( row[1] )
                                  return res
                          },[])
    me._select.value = keys.filter ( key => {
                                let objectID = parseInt ( key.split('/')[1]);
                                return selectedIDs.includes ( objectID )
                            })
    // Prepare structure as array of objects and update selected keys
    me._select.structure = [[ 'array', 0 ]]
    selectedIDs.forEach ( (id,i) => {
                      let localType = me.structure[id][0];
                      me._select.structure[0].push ( [id, i])
                      me._select.structure.push ( [localType, id])
              })
    return me
} // block func.



module.exports = block


