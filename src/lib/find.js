function find ( dependencies, me ) {
    // * Find if string exists in value attribute name.
  let 
        searchDefault = 'root'
      , deepDefault = 9999
      , deepMax
      , keys = Object.keys ( me.value )
      , { help, deep, search, walk } = dependencies
      , longKeys = help.toBreadcrumbKeys ( keys, me.structure )
      ;
             
      search = search || searchDefault
      deep = (deep == null) ? deepDefault : deep
      deep =  deep + 1 // because we add default wrapper 'root'
      deepMax = search.split('/').length + deep

      let collection = longKeys
                          .filter ( el => el.match (search) )
                          .reduce ( (res, el) => {
                                                      let 
                                                            index  = longKeys.indexOf(el)
                                                          , elDeep = el.split('/').length
                                                          ;
                                                      if ( elDeep <= deepMax )   res.push(keys[index])
                                                      return res
                                          },[] )
      me._select.value     = help.updateSelection ( me._select.value,  collection )
      me._select.structure = walk ( me.structure )
      return me
} // find func.



module.exports = find


