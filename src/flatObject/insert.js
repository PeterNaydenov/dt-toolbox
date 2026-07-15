'use strict'

function insert ( dependencies, flatIO ) {
return function insert ( name, inData ) {
            const { convert, isDTO, isDTM, walk } = dependencies();
            let d, copy;

            // Validate the segment name (must be a non-empty string)
            if ( typeof name !== 'string' || name === '' ) {
                    throw new Error ( `insertSegment(name, data) requires a non-empty string segment name. Got: ${JSON.stringify(name)}` )
                }
            // Reject segment names containing '/' because '/' is the
            // breadcrumbs separator inside the dt-model. A name like
            // 'a/b' would create a dt-line with breadcrumbs 'a/b' that
            // collides with parent/child paths and silently breaks
            // index(), extractList(), and model() lookups.
            if ( name.includes ( '/' ) ) {
                    throw new Error ( `insertSegment(name, data) does not allow '/' in the segment name (it's the breadcrumbs separator). Got: ${JSON.stringify(name)}` )
                }
            // Reject duplicate segment names. Before the fix, a second
            // insertSegment with the same name created two dt-lines at
            // the same breadcrumbs, and model()/extractList() silently
            // kept the FIRST and dropped the second.
            if ( flatIO.getIndexes () && flatIO.getIndexes ()[name] ) {
                    throw new Error ( `Segment "${name}" already exists. Use a different name or remove the existing segment first.` )
                }
            // Reject missing/non-object data with a clear error.
            // Before the fix, passing null/undefined/number/array produced
            // cryptic "Cannot read properties of null" / "...reading '0'" errors.
            if ( inData === null || inData === undefined ) {
                    throw new Error ( `insertSegment('${name}', data) requires a value. Got: ${inData}` )
                }
            if ( typeof inData !== 'object' ) {
                    throw new Error ( `insertSegment('${name}', data) requires an object, dt-object, dt-model, or array. Got: ${typeof inData} (${inData})` )
                }

            if ( isDTO(inData) ) {
                        d    = inData.export ()
                        copy = inData.copy ()
               }
            else if ( isDTM(inData) ) {
                        d = walk ({ data : inData })
                        copy = walk ({ data : inData })
                }
            else {
                        [ copy,, d ] = convert.from ( 'std' ).toFlat ( dependencies, inData )
                        console.warn ( 'A non "dt-object" data segment was inserted. Autoconverted to "dt-object".' )
                }

            const search = new RegExp ( `^root\/` );
            d.forEach ( line => {   // Word 'root' should be changed to the argument 'name'.
                        if ( line[0] === line[2] ) {
                                line[0] = name
                                line[2] = name
                            }
                        line[2] = line[2].replace ( search, `${name}/` )
                        line[3].forEach ( (edge,i) => line[3][i] = edge.replace ( search, `${name}/` )   )
                })
            flatIO.insert ( [copy,,d])
}} // insert func.



export default insert


