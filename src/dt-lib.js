'use strict'

const 
      find       = require ( './lib/find'    )
    , parent    = require ( './lib/parent' )
    , block     = require ( './lib/block'  )
    , deep      = require ( './lib/deep'   )
    , space     = require ( './lib/space'  )
    , modify    = require ( './lib/modify' )
    , transform = require ( './lib/transform' )
    ;



const dtlib = {

      loadLong ( dependencies, flatData ) {
                let { structure, value } = flatData;
                return dtlib._loadData ( dependencies, structure, value )
        } // loadLong func.

    , loadShort ( dependencies, flatData ) {
                let [structure, value] = flatData;
                return dtlib._loadData ( dependencies, structure, value )
        } // loadShort func.

    , _loadData ( dependencies, structure, value ) {
                const { help, simpleDT } = dependencies;
                let res = simpleDT ();
                res.structure = help.copyStructure ( structure )
                for ( const k in value ) {
                          res.value[k] = value[k]
                    }
                return res
        } // loadData

    , modify
    , find
    , parent
    , space
    , deep
    , block
    , transform
} // dtlib



module.exports = dtlib


