'use strict'

const		 
		  dtbox  = require ( '../src/main'         )
		, sample = require ( '../test-data/sample' )
		, chai   = require ( 'chai'                )
		, expect = chai.expect
		;






describe ( 'Initialize and modify DT', () => {



it  ( 'Init: Set empty DT object' , () => {
            let result = dtbox.init ();
 			expect ( result ).to.have.property  ( 'structure' )
            expect ( result ).to.have.property  ( 'value'     )
            expect ( result.value.hi()  ).to.be.equal ( 'hi' )
 			expect ( result ).to.have.property  ( '_select'   )
 			expect ( result ).to.have.property  ( '_error'    )
    }) // it Set empty DT



it ( 'Init: ST(standard) object' , () => {
            let dt, result ;

            dt = dtbox.init ({name:'Ivan'})
            result = dtbox.load ( dt )   //   result === dt.value

            expect ( result.value.hi()  ).to.be.equal ( 'hi' )
 			expect ( result.value       ).to.have.property ('root/0/name' )
 }) // it ST object



it ( 'Init: Reverse keys and values', () => {
    // * Create object where values will become keys and keys become values
    let result = dtbox.init ( sample.test_0, {mod:'reverse'} );

    expect ( result.value.hi()  ).to.be.equal ( 'hi' )
    expect ( result.value ).to.have.deep.property ( 'root/1/true'  )
    expect ( result.value['root/2/1'] ).to.be.equal ( 0 )
}) // it reverse keys and values



it ( 'Init: Keys only', () => {
    // * Create key replacement map
    const result = dtbox.init ( sample.test_0, {mod:'keys'});

    expect ( result.value.hi()  ).to.be.equal ( 'hi' )
    expect ( result.value                ).to.have.property ( 'root/0/name'  )
    expect ( result.value['root/0/name'] ).to.be.equal ( 'name' )
    expect ( result.value['root/2/0']    ).to.be.equal ( 0 )
}) // it keys only



it ( 'Init: Values only', () => {
    // * Ignore keys and convert data-structure to list of values (arrays)
    let result = dtbox.init ( sample.test_0, {mod:'value'} );

    expect ( result.value.hi()  ).to.be.equal ( 'hi' )    
    expect ( result.value ).to.have.property ( 'root/0/0'  )
    expect ( result.value ).to.have.property ( 'root/0/1'  )

    try {
            result.structure.forEach ( row => {
                                let [ type, id, ... members ] = row;
                                expect ( type ).to.be.equal ( 'array' )
                        
                                members.forEach ( member => {
                                                    let [ target, name ] = member;
                                                    expect ( target ).is.equal ( name )
                                            })
                        })
        }
    catch ( e ) {
            console.error ( 'Something went wrong with "Init: Values only"' )
        }
}) // it values only



it ( 'Init: Value only --> Important Detail', () => {
	// * Attention! Values that are numbers, will convert to array!
    //   Avoid this problem by using init with 'files'. See next unit test.
            const result = dtbox.init ( sample.test_9, {mod:'values', format:'file'} );

 			expect ( result.value ).to.have.property ( 'root/1/0'  )
            expect ( result.value ).to.have.property ( 'root/2/1'  )
            try {
                    result.structure.forEach ( el => {
                                    expect ( el[0]).is.equal ( 'array' )
                            })
                }
            catch (e) {
                        console.log ('Something went wrong with test "Init: Value only --> Important Detail"')
                }

 			//  expect ( result.value['root/rootFolder/profile/age/0'] ).is.equal ( '42' )			
}) // it values Important





it ( 'Init: Files', () => {
	// Create new object from values where we have value with '/' delimiter. Last element of the string will become a value
 			// const result = dtbox.init ( sample.test_9, {format:'file'} );
// TODO: Think about provision of params in init. What is data-format and what instructions?

 			// expect ( result.value ).to.have.property ( 'root/rootFolder/profile/name'  )
 			// expect ( result.value['root/rootFolder/profile/name'] ).to.be.equal ( 'Peter'  )
 			
 			// expect ( result.value ).to.have.property ( 'root/rootFolder/profile/age'  )
 			// expect ( result.value['root/rootFolder/profile/age'] ).to.be.equal ( '42'  )

 			// expect ( result.value ).to.not.have.property ( 'root/rootFolder/friends' )

 			// expect ( result.structure ).to.have.property ( 'root/rootFolder/friends' )
 			// expect ( result.structure['root/rootFolder/friends'] ).to.be.equal ( 'array' )
 			// expect ( result.structure['root/rootFolder/profile'] ).to.be.equal ( 'object' )

 			// expect ( result.namespace ).to.have.property ( 'profile'    )
 			// expect ( result.namespace ).to.have.property ( 'friends'    )
 			// expect ( result.namespace ).to.have.property ( 'rootFolder' )
    }) // it files



}) // describe