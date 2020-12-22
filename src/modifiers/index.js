// NOTE: modifiers require a midFlat model for mainData and update
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
  , mix       = require ( './mix'       )
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
                    , mix
                }



 module.exports = modifier


