// NOTE: modifiers require a midFlat data-type for mainData and update
const
    overwrite       = require ( './overwrite' )
  , update          = require ( './update'    )
  , add             = require ( './add'       )
  , insert          = require ( './insert'    )
  , append          = require ( './append'    )
  , prepend         = require ( './prepend'   )
  , keyPrefix        = require ( './keyPrefix'  )
  , flatten          = require ( './flatten'    )
  , combineShallow  = require ( './combineShallow'   )
  , mix       = require ( './mix'       )
  , reverse   = require ( './reverse'   )
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
                    , combineShallow
                    , mix
                    , reverse
                }



 module.exports = modifier


