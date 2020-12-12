// NOTE: modifiers require a midFlat format for mainData and update
const
    overwrite = require ( './modifiers/overwrite' )
  , update    = require ( './modifiers/update'    )
  , add       = require ( './modifiers/add'       )
  , insert    = require ( './modifiers/insert'    )
  , append    = require ( './modifiers/append'    )
  , prepend   = require ( './modifiers/prepend'   )
  ;

const modifier = {
                      add
                    , update
                    , overwrite
                    , insert
                    , append
                    , prepend
                }



 module.exports = modifier


