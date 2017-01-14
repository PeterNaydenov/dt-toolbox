'use strict'

var		 
		  dtbox = require  ( '../dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = require ( 'chai'   ).expect
		;






describe ( 'Select in DT', () => {





it ( 'Select: Parent', () => {
		  let updateObject;
		  const result = dtbox
		                 .init ( sample.test_8 )
		                 .select ()
		                 .parent ('title', item => item.id.includes(222)   ) // 222 is ID pattern for drama
		                 .spread ( 'dt', dt => {
					  								updateObject = dt
					  								                .assemble   () 
					  								                .build      ()
							                 } );
		  
		  // Expect DT format:
		  expect ( result ).to.be.an              ( 'object'    )
		  expect ( result ).to.have.property      ( 'value'     )
		  expect ( result ).to.have.property      ( 'structure' )
		  expect ( result ).to.have.property      ( 'namespace' )
		  
		  // Convertion to DT format success
		  expect ( result ).to.have.deep.property ( 'value.root/0/genre'   )
		  expect ( result ).to.have.deep.property ( 'value.root/2/profile/age' )

		  // Manipulations on export
		  expect ( updateObject ).to.be.an ( 'array' )
		  expect ( updateObject ).has.deep.property ( '0.id' )

  }) // it select





 it ( 'Select: Folder', () => {
	 	  let result;
	 		
	 	  dtbox
	         .init   ( sample.test_0 )
	         .select ()
	         .folder ('profile') // no params == select all
	         .spread ('object', dt => {
										 result = dt.keyList()
	 		     })

	 	 expect ( result ).contains ( 'root/profile/active' )
	 	 expect ( result ).has.length(1)
 }) // it folder





 it ( 'Select: Folder with regular expression', () => {
	 	  let result;
	 		
	 	  dtbox
	         .init   ( sample.test_0 )
	         .select ()
	         .folder ('.*/[0-9]$') 
	         .spread ('object', dt => result = dt.keyList()   )

	 	 expect ( result ).contains ( 'root/array/0' )
	 	 expect ( result ).has.length(3)

 }) // it regexp.





it ( 'Select: Space', () => {
		let 
			  result
			, keys
			;

		dtbox
		    .init ( sample.test_0 )
		    .select ()
		    .space  ( 'profile' )
		    .spread ( 'object', dt => result = dt )
		    .spread ( 'keys'  , dt => keys   = dt )
		    
		    expect ( result ).to.have.property ( 'root/profile/active' )
		    
		    expect ( keys   ).has.property ( 'root/0' )
		    expect ( keys['root/0'] ).is.equal ('profile/active') 
}) // it namespace





it ( 'Select: Limit', () => {
		const result = dtbox
				            .init ( sample.test_0 )
				            .select ()
				            .folder ()
				            .limit (4)

	    expect ( result._select ).has.length(4)
}) // it limit





it ( 'Select: Keep' , () => {
	 const result = dtbox
			             .init ( sample.test_0 )
			             .select ()
			             .folder ()
			             .keep ( el => typeof el === 'boolean' )

	 expect( result._select ).has.length(1)
}) // it keep





it ( 'Select: Remove' , () => {
   const result = dtbox
	    			.init ( sample.test_0 )
	    			.select ()
	    			.folder ()
	    			.remove ( el => el == 'Peter' )

    expect ( result._select ).not.contains ( 'root/name' )
}) // it remove





it ( 'Select: Deep', () => {
	const result = dtbox
			           .init ( sample.test_0 )
			           .select ()
			           .folder ()
			           .deep ( 0 )

	expect( result._select ).has.length(3)
}) // it deep




it ( 'Select: Deep with direction', () => {
	const result = dtbox
			            .init ( sample.test_0 )
			            .select ()
			            .folder ()
			            .deep ( 1, 'more' ) // read as 'level 1 and more'

	expect ( result._select ).has.length(4)
	expect ( result._select ).contains ( 'root/profile/active' )
	expect ( result._select ).contains ( 'root/array/0' )
	expect ( result._select ).contains ( 'root/array/1' )
}) // it deep with direction



}) // define




