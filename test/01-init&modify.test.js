'use strict'

const		 
		  dtbox = require  ( '../src/dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = chai.expect
		;






describe ( 'Initialize and modify DT', () => {





it  ( 'Init: Set empty DT object' , () => {
			let result = dtbox.init ();

 			expect ( result ).to.be.an          ( 'object'     )
 			expect ( result ).to.have.property  ( 'value'      )
 			expect ( result ).to.have.property  ( 'structure'  )
 			expect ( result ).to.have.property  ( 'namespace'  )
    }) // it Set empty DT





it ( 'Init: ST(standard) object' , () => {
 			let dt, result ;

                dt = dtbox.init ({name:'Ivan'})
        	result = dtbox.load ( dt )   //   result === dt

 			expect ( result.value     ).to.have.property ('root/name' )
 			expect ( result.structure ).to.have.property ('root' )
 			expect ( result.namespace ).to.have.property ('root' )
 			expect ( result.namespace.root ).to.contains ('root/name')
 }) // it ST object
 




it ( 'Init: Reverse keys and values', () => {
 			// * Create object where values will become keys and keys become values
 			let result = dtbox.init ( sample.test_0, 'reverse' );

 			expect ( result.value ).to.have.deep.property ( 'root/1'  )
 			expect ( result.value['root/1'] ).to.be.equal ( 'root/array/0' )
    }) // it reverse keys and values





it ( 'Init: Keys only', () => {
 			// * Create key replacement map
 			const result = dtbox.init ( sample.test_0, 'keys');

 			expect ( result.value              ).to.have.property ( 'root/name'  )
 			expect ( result.value['root/name'] ).to.be.equal ( 'name' )

 			expect ( result.structure ).to.have.property ( 'root/profile' )
 			expect ( result.structure ).to.have.property ( 'root/array'   )
 			
 			expect ( result.structure['root/profile'] ).to.be.equal ( 'object' )
 			expect ( result.structure['root/array']   ).to.be.equal ( 'array'  )

 			expect ( result.namespace ).to.have.property ( 'profile' )
 			expect ( result.namespace ).to.have.property ( 'array'   )
 			
 			expect ( result.namespace['profile'] ).has.length ( 1 )
 			expect ( result.namespace['array']   ).has.length ( 3 )
    }) // it keys only





it ( 'Init: Values only', () => {
 			let result = dtbox.init ( sample.test_9, 'values' );

 			expect ( result.value ).to.have.deep.property ( 'root/rootFolder/profile/name/Peter'  )

 			expect ( result.structure ).to.have.property ( 'root/rootFolder/friends' )
 			expect ( result.structure['root/rootFolder/friends'] ).to.be.equal ( 'array' )

 			expect ( result.namespace ).to.have.property ( 'friends' )
    }) // it values only





it ( 'Init: Value only --> Important Detail', () => {
	// * Attention! Values that are numbers, will convert to array!
	//   Avoid this problem by using init with 'files'. See next unit test.
 			const result = dtbox.init ( sample.test_9, 'values' );
 			expect ( result.value ).to.have.deep.property ( 'root/rootFolder/profile/age/0'  )
 			expect ( result.value['root/rootFolder/profile/age/0'] ).is.equal ( '42' )			
}) // it values Important

 



it ( 'Init: Files', () => {
	// Create new object from values where we have value with '/' delimiter. Last element of the string will become a value
 			const result = dtbox.init ( sample.test_9, 'files' );

 			expect ( result.value ).to.have.property ( 'root/rootFolder/profile/name'  )
 			expect ( result.value['root/rootFolder/profile/name'] ).to.be.equal ( 'Peter'  )
 			
 			expect ( result.value ).to.have.property ( 'root/rootFolder/profile/age'  )
 			expect ( result.value['root/rootFolder/profile/age'] ).to.be.equal ( '42'  )

 			expect ( result.value ).to.not.have.property ( 'root/rootFolder/friends' )

 			expect ( result.structure ).to.have.property ( 'root/rootFolder/friends' )
 			expect ( result.structure['root/rootFolder/friends'] ).to.be.equal ( 'array' )
 			expect ( result.structure['root/rootFolder/profile'] ).to.be.equal ( 'object' )

 			expect ( result.namespace ).to.have.property ( 'profile'    )
 			expect ( result.namespace ).to.have.property ( 'friends'    )
 			expect ( result.namespace ).to.have.property ( 'rootFolder' )

    }) // it files




it ( 'Init: Handmade files-like structure', () => {
 let  result;
 let data = [
                   'a/www'
                 , 'a/b/www'
                 , 'a/c/www'
                 , 'd/www'
                 , 'd/e/www'
               ]
 
 result =  dtbox.init ( data, 'files')

 expect ( result.value ).to.contain.property ( 'root/a/0' )
 expect ( result.value ).to.contain.property ( 'root/a/b' )
 expect ( result.value ).to.contain.property ( 'root/a/c' )
 expect ( result.value ).to.contain.property ( 'root/d/0' )
 expect ( result.value ).to.contain.property ( 'root/d/e' )
}) // it handmade





it ( 'Load: DT', () => {
	// Init with DT object. Strip DT mean only dt.value element
 			const result = dtbox.load ( sample.test_7 );

 			expect ( result.value ).to.have.property ( 'root/profile/name' )
 			expect ( result.value ).to.have.property ( 'root/id'           )

 			expect ( result.structure ).to.have.property ( 'root/profile' )
 			expect ( result.namespace['profile'] ).to.contain ( 'root/profile/name' )

    }) // it load DT





it ( 'Load: Simple object as value', () => {
			let result = dtbox.load ({
										  user : 'Peter'
										, age  : 42
										, role : 'admin'
									});

			// root should be auto append
			expect ( result.value ).to.have.property ( 'root/user' )
			expect ( result.value ).to.have.property ( 'root/age'  )
			expect ( result.value ).to.have.property ( 'root/role' )
}) // it Simple Object as value





it ( 'Load: Preprocess', () => {
			const result = dtbox
							.init ()
							.preprocess ( sample.test_0, dt => {
																	let iterator, result;
																	
																	iterator = dt.keyList ()
																	result = iterator.reduce ( (res, el) => {
																											let tester = el.split('/');
																											if ( tester.length > 2 )  res[el] = dt[el]
																											return res
																					             },{})
																	// Important: function must return !
																	return result
							                })
											
			expect ( result.value ).to.not.have.property ( 'root/name' )
			expect ( result.value ).to.not.have.deep.property ( 'root/age'  )
			
			expect ( result.value ).to.have.deep.property ( 'root/profile/active' )
			expect ( result.value ).to.have.deep.property ( 'root/array/0'        )
			
			expect ( result.namespace.root ).to.be.empty;
      }) // it preprocess





it ( 'Load: Load fast', () => {
   let result;

   let loadData = {
                       'root/0/id'   : 12
                     , 'root/0/name' : 'Peter'
                   }

   result = dtbox.loadFast ( loadData )

   // Meta data should not be calculated
   expect ( result['namespace']['root'] ).to.be.empty
   expect ( result['structure']['root'] ).to.be.equal ( 'object' )

   // Values are available   
   expect ( result['value'] ).to.have.property ( 'root/0/id'  )
   expect ( result['value'] ).to.have.property ( 'root/0/name')
   expect ( result['value']['root/0/id'] ).to.be.equal ( 12  )
   expect ( result['value']['root/0/name'] ).to.be.equal ( 'Peter'  )
}) // loadFast






it  ( 'Modify: Add' , () => {			
			const result = dtbox 
			                .init ()
			                .add ( {name : 'Ivan'} )
			                .add (  sample.test_0  );

 			expect ( result.value ).to.have.property ( 'root/name'  )
 			expect ( result.value['root/name'] ).to.be.equal ( 'Ivan' )

 			expect ( result.structure ).to.have.property ( 'root/profile' )
 			expect ( result.structure ).to.have.property ( 'root/array'   )

 			// Add only not defined keys
 			expect ( result.namespace.root    ).to.have.length ( 3 )
 			expect ( result.namespace.profile ).to.have.length ( 1 )
 			expect ( result.namespace.array   ).to.have.length ( 3 )
    }) // it modify: Add





 it ( 'Modify: Update', () => {
			const result = dtbox 
			                .init   ( {name : 'Ivan'} )
			                .update ( sample.test_0   );

 			// updates only existing values
 			expect ( result.value              ).to.have.deep.property ( 'root/name'  )
 			expect ( result.value['root/name'] ).to.be.equal ( 'Peter' )
 			expect ( result.namespace          ).to.not.have.property ( 'array' )
    }) // it modify: Update





it ( 'Modify: Update with instructions', () => {
			const result = dtbox 
			                .init   ( {name : 'Ivan'} )
			                .update ( sample.test_0 , 'key' );

 			// updates only existing values
 			expect ( result.value              ).to.have.deep.property ( 'root/name' )
 			expect ( result.value['root/name'] ).to.be.equal ( 'name' )
 			expect ( result.namespace          ).to.not.have.property ( 'array' )
    }) // it modify: Update


 
it ( 'Modify: Overwrite', () => {  
			const result = dtbox 
			                .init      ( sample.test_0 )
			                .update    ( 
			                				{ 
			                					  name : 'Ivan'
			                					, 'second-number' : '8899 444 444'
			                		   })
			                .overwrite ( 
			                				{ 
			                					   name : 'Stefan'
			                					, 'prime-number'  : '8899 222 222'
			                					, 'dummy' : [12,24,55]
			                		  });

 			// updates existing values and adds new data including 'namespace' and 'structures'
 			expect ( result.value['root/name'] ).to.be.equal ( 'Stefan' )
 			expect ( result.value              ).to.not.have.property ( 'root/second-number' )
 			expect ( result.value              ).to.have.property ( 'root/prime-number' )

 			expect ( result.namespace               ).to.have.property ( 'dummy'      )
 			expect ( result.structure               ).to.have.property ( 'root/dummy' )
 			expect ( result.structure['root/dummy'] ).to.be.equal ( 'array' )
    })  // it modify: Overwrite





it ( 'Modify: Overwrite with instructions', () => {  
			const result = dtbox 
			                .init      ( sample.test_0 )
			                .update    ( 
			                				{ 
			                					  name : 'Ivan'
			                					, 'second-number' : '8899 444 444'
			                		   })
			                .overwrite ( 
			                				{ 
			                					   name : 'Stefan'
			                					, 'prime-number'  : '8899 222 222'
			                					, 'dummy' : [12,24,55]
			                		   }, 'key' );

 			// updates existing values and adds new data including 'namespace' and 'structures'
 			expect ( result.value['root/name']        ).to.be.equal ( 'name' )
 			expect ( result.value                     ).to.not.have.property ( 'root/second-number' )
			expect ( result.value                     ).to.have.property ( 'root/prime-number' )
			expect ( result.value['root/prime-number']).to.be.equal ( 'prime-number' )

 			expect ( result.namespace               ).to.have.property ( 'dummy'      )
 			expect ( result.structure               ).to.have.property ( 'root/dummy' )
 			expect ( result.structure['root/dummy'] ).to.be.equal ( 'array' )
    })  // it modify: Overwrite





it ( 'Modify: Insert', () => {
	// * Insert data on specified key, when the key represents an array.
	
	const result = dtbox
	                 .init ()
	                 .add ( sample.test_10, 'files' )
	                 .insert ( [ 'Misho', 'Tosho' ] , 'friends' )
	                 .select()
	                 .folder()

	expect ( result.value ).to.have.property ( 'root/friends/3' )
	expect ( result.value ).to.have.property ( 'root/friends/4' )

	expect ( result.structure ).to.have.property ('root' )
	expect ( result.structure ).to.have.property ('root/friends' )
	expect ( result.structure['root/friends'] ).to.be.equal ( 'array' )
}) // it insert





it ( 'Modify: Insert text', () => {
	// * Insert data on specified key, when the key represents an array.
	
	const result = dtbox
	                 .init ()
	                 .add ( sample.test_10, 'files' )
	                 .insert ( 'Tosho' , 'friends' )
	                 .select()
	                 .folder()

	expect ( result.value ).to.have.property ( 'root/friends/3' )	
	expect ( result.structure ).to.have.property ('root' )
	expect ( result.structure ).to.have.property ('root/friends' )
	expect ( result.structure['root/friends'] ).to.be.equal ( 'array' )
}) // it insert text





it ( 'Modify: Insert text with fake instruction', () => {
	// * Insert data on specified key, when the key represents an array.
	
	const result = dtbox
	                 .init ()
	                 .add ( sample.test_10, 'files' )	                 
	                 .select()
	                 .folder()
console.log ( result )
	// expect ( result.value ).to.have.property ( 'root/friends/3' )	
	// expect ( result.structure ).to.have.property ('root' )
	// expect ( result.structure ).to.have.property ('root/friends' )
	// expect ( result.structure['root/friends'] ).to.be.equal ( 'array' )
}) // it insert text with fake instruction





it ( 'Modify: Insert in root', () => {
	// * Insert data on specified key, when the key represents an array.
	
	const result = dtbox
	                 .init (['Tisho', 'Ivo'])
	                 .insert ( 'Stefan' , 'root' )
	                 .select()
					 .folder()
					 
	expect ( result.value ).to.have.property ( 'root/2' )
	expect ( result.value['root/2']).to.be.equal ( 'Stefan' )
	expect ( result.structure ).to.have.property ( 'root' )
	expect ( result._select ).to.contains ( 'root/2' )
}) // it insert in root





it ( 'Show Error Log', () => {
	// * Executes callback with errors list as argument
	let 
          result
		, more
		;

	dtbox
         .init ()
         .add ( sample.test_10, 'files' )
         .insert ( [ 'Misho', 'Tosho' ] , 'fri' )
         .select()
         .folder()
         .log ( err =>  result = err )
         .spread ( 'dt', dt => more = dt.valueList() )

	expect ( result ).to.be.an ( 'array' )
	expect ( result ).to.have.length ( 1 )

	expect ( more ).to.be.an ( 'array' )
	expect ( more ).to.have.length (3)
}) // it insert





it ( 'Get empty DT', () => { 

    const data = dtbox.empty ();
    const result = data.keyList ();

    expect ( data ).to.be.an ( 'object' )
    expect ( data ).to.be.an.empty
    expect ( result ).to.be.an ( 'array' )
}) // it empty value


}) // define




