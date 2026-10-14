'use strict'

/**
 *  Settings for '@peter.naydenov/walk' v.7.x.x
 *
 *  Data coming from the user is checked for circular references before any
 *  conversion (see `hasCircularRef` in mainLib.js). Walk's own cycle detection
 *  is not needed and is switched off for speed.
 *  DT-models are not copied with walk; see copyDtModel.js.
 */



const walkSettings = {
          // Data to dt-model conversion. Callbacks use only `breadcrumbs` and build the dt-lines,
          // so walk doesn't need to create a result copy.
          toFlat : { detectCycles: false, parentPath: false, copy: false }
    };



export default walkSettings


