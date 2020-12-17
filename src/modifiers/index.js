// NOTE: modifiers require a midFlat format for mainData and update
const
    overwrite = require ( './overwrite' )
  , update    = require ( './update'    )
  , add       = require ( './add'       )
  , insert    = require ( './insert'    )
  , append    = require ( './append'    )
  , prepend   = require ( './prepend'   )
  , keyPrefix  = require ( './keyPrefix'  )
  , flatten    = require ( './flatten'    )
  , combine   = require ( './combine'   )
  ;

const modifier = {
                      add
                    , update
                    , overwrite
                    , insert
                    , append
                    , prepend
                    , keyPrefix
                    , flatten
                    , combine
                }



 module.exports = modifier


