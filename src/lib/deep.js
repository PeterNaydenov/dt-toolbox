function deep ( dependencies, me ) {
    const { help, num, direction } = dependencies
    let 
          usedNumbers = []
        , selectedKeys = [ ...me._select.value ]
        , levels = help.objectsByLevel ( me.structure )
        ;
    levels.forEach ( (level,i) => {
              let condition = (direction == 'more') ? ( i >= num ) : ( i <= num );
              if ( condition )   usedNumbers = usedNumbers.concat ( level )
        })
    me._select.value = selectedKeys.filter ( key => {
                              let objectID = parseInt (key.split('/')[1]);
                              return usedNumbers.includes ( objectID )
                          })
    return me
} // deep func.



module.exports = deep


