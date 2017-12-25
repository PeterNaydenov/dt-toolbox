'use strict'

var		 
		  dtbox = require  ( '../src/dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = require ( 'chai'   ).expect
		;






describe ( 'Select in DT', () => {





it ( 'Parent', () => {
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
		  expect ( result.value ).to.have.deep.property ( 'root/0/genre'       )
		  expect ( result.value ).to.have.deep.property ( 'root/2/profile/age' )

		  // Manipulations on export
		  expect ( updateObject ).to.be.an ( 'array' )
		  expect ( updateObject[0] ).has.property ( 'id' )

  }) // it select





 it ( 'Folder', () => {
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





 it ( 'Folder with regular expression', () => {
	 	  let result;
	 		
	 	  dtbox
	         .init   ( sample.test_0 )
	         .select ()
	         .folder ('.*/[0-9]$') 
	         .spread ('object', dt => result = dt.keyList()   )

	 	 expect ( result ).contains ( 'root/array/0' )
	 	 expect ( result ).has.length(3)

 }) // it regexp.





it ( 'Space', () => {
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





it ( 'Limit', () => {
		const result = dtbox
				            .init ( sample.test_0 )
				            .select ()
				            .folder ()
				            .limit (4)

	    expect ( result._select ).has.length(4)
}) // it limit





it ( 'Keep: No arguments' , () => {
	 const result = dtbox
			             .init ( sample.test_0 )
			             .select ()
			             .all ()
			             .keep ()

	 expect( result._select ).has.length(7)
}) // it keep





it ( 'Keep: Value check' , () => {
	 const result = dtbox
			             .init ( sample.test_0 )
			             .select ()
			             .all ()
			             .keep ( el => typeof el === 'boolean' )

	 expect( result._select ).has.length(1)
}) // it keep





it ( 'Keep: Key check' , () => {
	 const result = dtbox
			             .init ( sample.test_0 )
			             .select ()
			             .all ()
			             .keep ( (el,id) => id.includes ('name') )

	 expect( result._select ).has.length ( 1 )
	 expect( result._select ).contains   ( 'root/name' )
}) // it keep: key check





it( 'Remove: No arguments' , () => {
   const result = dtbox
	    			.init ( sample.test_0 )
	    			.select ()
	    			.folder ('array')
	    			.remove ()

    expect ( result._select ).to.have.length(3)
}) // it remove





it ( 'Remove: Value check' , () => {
   const result = dtbox
	    			.init ( sample.test_0 )
	    			.select ()
	    			.folder ()
	    			.remove ( el => el == 'Peter' )

    expect ( result._select ).not.contains ( 'root/name' )
}) // it remove: value check





it ( 'Remove: Key check' , () => {
   const result = dtbox
	    			.init ( sample.test_0 )
	    			.select ()
	    			.all ()
	    			.remove ( (v,k) => k.includes ('array') )

    expect ( result._select ).has.length ( 4 )
	expect ( result._select ).to.contain ( 'root/name' )
	expect ( result._select ).to.contain ( 'root/age' )
	expect ( result._select ).to.contain ( 'root/eyes' )
	expect ( result._select ).to.contain ( 'root/profile/active' )
}) // it remove: Key check





it ( 'Deep', () => {
	const result = dtbox
			           .init ( sample.test_0 )
			           .select ()
			           .folder ()
			           .deep ( 0 )

	expect( result._select ).has.length(3)
}) // it deep




it ( 'Deep with direction', () => {
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




it ( 'Deep Objects', () => {
   let result;

   dtbox
     .init ( sample.test_5 )
     .select()
     .deepObject()
     .spread ( 'dt', dt => result = dt.list().build() )

   expect ( result ).to.be.an( 'array' )
   expect ( result ).to.have.length ( 6 )

   expect ( result[0] ).to.have.property ('name')
   expect ( result[0] ).to.have.property ('comments')
   expect ( result[0] ).to.have.property ('age')
}) // it deepObject



it ( 'Deep Array', () => {
	let result

	let ttt = [
               { name: 'Peter', age:42 }
             , { name: 'Stefan', age: 41 }
             , [
                    {
                         name: 'Andrey'
                       , age : 33 
	                   , l   : [
	                               [ 13, 44, 43]
	                             , [ 66, 77, 88]
	                           ]
                    }

               ]
              , [ 22, 33, 26 ]
          ]

	dtbox
	  .init( ttt )
	  .select()
	  .deepArray()
	  .spread ( 'dt', dt => result = dt.list().build()   )

	expect ( result ).to.be.an ( 'array' )
	expect ( result ).to.have.length ( 3 )

	expect ( result[0] ).to.be.an ( 'array' )
	expect ( result[0] ).to.have.length ( 3 )
	expect ( result[1] ).to.be.an ( 'array' )
	expect ( result[2] ).to.be.an ( 'array' )
})





it ( 'Invert: Empty Selection', () => {
   const result = dtbox
	    			.init ( sample.test_0 )
	    			.select ()
	    			.invert ()

   expect( result._select ).to.have.length(7)
}) // it invert empty selection





it ( 'Invert: Selection', () => {
   const result = dtbox
	    			.init ( sample.test_0 )
	    			.select ()
	    			.folder ('array')
	    			.invert ()

  expect ( result._select ).to.have.length(4)
  expect ( result._select ).to.not.contains ( 'root/array/0' )
}) // it invert selected items





it ( 'Invert: Select All', () => { 
   const result = dtbox
	    			.init ( sample.test_0 )
	    			.select ()
	    			.all()
	    			.invert ()

  expect ( result._select ).to.be.an.empty
  expect ( result._select ).to.be.an ( 'array' )
}) // it invert select all



}) // describe





