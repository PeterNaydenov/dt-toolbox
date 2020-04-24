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
            expect ( result.structure.length ).to.be.equal ( 1 ) 
 }) // it ST object



 it ( 'Init: ST(standard) array' , () => {
            let dt, result ;

            dt = dtbox.init ([ 'Peter', 'Maria', 'Vessy' ])
            result = dtbox.load ( dt )   //   result === dt.value

            expect ( result.value.hi()  ).to.be.equal ( 'hi' )
            expect ( result.value       ).to.have.property ('root/0/0' )
            expect ( result.structure[0][0]).to.be.equal ( 'array' ) 
            expect ( result.structure.length ).to.be.equal ( 1 ) 
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





it ( 'Init: Values only, Format: std', () => {
    let result = dtbox.init ({
                                  user : 'Peter'
                                , age  : 42
                                , role : 'admin'
                              },{ format:'std', mod:'values' });

    // root should be auto append
    expect ( result.value.hi()  ).to.be.equal ( 'hi' )
    expect ( result.value ).to.have.property ( 'root/0/0'  )
    expect ( result.value ).to.have.property ( 'root/0/1'  )
    expect ( result.value ).to.have.property ( 'root/0/2'  )
    
    expect ( result.structure[0][0]).to.be.equal ( 'array' )
}) // it Simple Object as value





it ( 'Init: Value only, Format: values', () => {
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
 			const result = dtbox.init ( sample.test_9, {format:'file'} );
            // TODO: Not tested for boolean!
 			expect ( result.value ).to.have.property ( 'root/2/name'  )
 			expect ( result.value['root/2/name'] ).to.be.equal ( 'Peter'  )
 			
 			expect ( result.value ).to.have.property ( 'root/2/age'  )
 			expect ( result.value['root/2/age'] ).to.be.equal ( 42  )

 			expect ( result.value ).to.not.have.property ( 'root/1/friends' )
 			expect ( result.structure[3][0] ).to.be.equal ( 'array' )
    }) // it files





it ( 'Init: Handmade files-like structure', () => {
        let  result;
        let data = [
                          'a/www'
                        , 'a/www'
                        , 'a/www'
                        , 'd/a/www'
                        , 'd/e/www'
                      ]
        
        result =  dtbox.init ( data, { format:'file'} )
    
        expect ( result.value ).to.contain.property ( 'root/1/0' )
        expect ( result.value ).to.contain.property ( 'root/1/1' )
        expect ( result.value ).to.contain.property ( 'root/1/2' )
        expect ( result.value ).to.contain.property ( 'root/2/a' )
        expect ( result.value ).to.contain.property ( 'root/2/e' )

        expect ( result.structure[0][0] ).to.be.equal ( 'object' )
        expect ( result.structure[1][0] ).to.be.equal ( 'array' )
        expect ( result.structure[2][0] ).to.be.equal ( 'object' )
    }) // it handmade





it ( 'Init: Preprocess', () => {
        const result = dtbox
                        .preprocess ( sample.test_0, ([structure, value]) => {
                                                                let 
                                                                      iterator = Object.keys (value)
                                                                    , result = {}
                                                                    ;
                                                                result = iterator.reduce ( (res, el) => {   // remove first level properties
                                                                                                        let tester = el.split('/');
                                                                                                        if ( tester[1] != 0 )  res[el] = value[el]
                                                                                                        return res
                                                                                             },{})
                                                                // Important: function must return !
                                                                return [ structure, result]
                                        })
        try {
                let iterator = Object.keys ( result.value );
                iterator.forEach ( el => { // check if there are no first level properties
                                let tester = el.split('/');
                                expect ( tester[1] ).to.be.not.equal ( 0 )
                                expect ( tester[2]).to.be.not.equal ( 'name' )
                                expect ( tester[2]).to.be.not.equal ( 'age'  )
                        })
            }
        catch (error) {
                    throw error
            }
        
        expect ( result.value ).to.have.property ( 'root/1/active' )
        expect ( result.value['root/1/active'] ).to.be.true
        expect ( result.value ).to.have.deep.property ( 'root/2/2' )

        expect ( result.structure.length ).to.be.equal ( 3 )
        expect ( result.structure[0][0] ).to.be.equal ( 'object' )
        expect ( result.structure[1][0] ).to.be.equal ( 'object' )
        expect ( result.structure[2][0] ).to.be.equal ( 'array'  )
  }) // it preprocess





it ( 'Load: shortFlat', () => {
        // *** Init with DT object. Strip DT mean only dt.value element
                const result = dtbox.load ( sample.test_12 );
    
                expect ( result.value.hi()  ).to.be.equal ( 'hi' )
                expect ( result.value ).to.have.property ( 'root/1/name' )
                expect ( result.value ).to.have.property ( 'root/id'     )
                expect ( result.structure.length ).to.be.equal ( 2 )
                expect ( result.structure[0][2][1] ).to.be.equal ( 'profile' )
        }) // it load DT











}) // describe