'use strict'

const
     isItPrimitive    = require ( './isItPrimitive'     )
   , hasNumbers       = require ( './hasNumbers'        )
   , generateObject   = require ( './generateObject'    )
   , sanitizeFlatKeys = require ( './sanitizeFlatKeys'  )
   , objectsByLevel   = require ( './objectsByLevel'    )
   , filterObject      = require ( './filterObject'       )
   , toBreadcrumbKeys = require ( './toBreadcrumbsKeys' )
   , updateSelection  = require ( './updateSelection'   )
   , zipObject        = require ( './zipObject'         )
   , extractSelection = require ( './extractSelection'  )
   , reduceTuples     = require ( './reduceTuples'      )
   ;

const findType =  d =>  ( d instanceof Array ) ? 'array' : 'object'



module.exports = { 
                      findType            // Is it array or object. Returns strings: 'array' | 'object'
                    , hasNumbers         // Check if array contain number members. Returns boolean
                    , isItPrimitive      // Returns boolean
                    , generateObject
                    , sanitizeFlatKeys   // Sanitize 'file' format keys
                    , objectsByLevel     // Object IDs organized by levels
                    , filterObject        // Find object and object props in a value
                    , toBreadcrumbKeys   // Breadcrumbs keys
                    , updateSelection    // Updates selection list. Checks if element is already selected
                    , zipObject          // Conect two arrays in a single object
                    , extractSelection   // Creates 'value' object with selected keys only
                    , reduceTuples
                }


                