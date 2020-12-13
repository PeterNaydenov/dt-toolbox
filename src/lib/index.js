'use strict'

const 
      find       = require ( './find'       )
    , parent    = require ( './parent'    )
    , block     = require ( './block'     )
    , deep      = require ( './deep'      )
    , space     = require ( './space'     )
    , modify    = require ( './modify'    )
    , transform = require ( './transform' )
    , attach    = require ( './attach'    )
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
    , attach
} // dtlib



module.exports = dtlib


