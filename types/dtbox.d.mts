/**
 * Type declarations for dt-toolbox.
 * Used for ES module (`import`) consumers. Declarations live in `dtbox.d.cts`.
 */

import dtbox from './dtbox.cjs';

export type {
      ModelName
    , AsName
    , FlatData
    , DtLine
    , DtModel
    , Tuple
    , ConvertResult
    , ModelResult
    , InitOptions
    , FlatOptions
    , ConvertOptions
    , ExtractListOptions
    , ModelFnReturn
    , FilterArgs
    , FilterFn
    , LookArgs
    , LookFn
    , DtStore
    , DTObject
    , WalkCallbackArgs
    , WalkOptions
    , WalkSettings
    , WalkFn
    , DtBox
} from './dtbox.cjs';

export default dtbox;
