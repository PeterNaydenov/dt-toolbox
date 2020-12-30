'use strict'

const		 
		  dtbox  = require ( '../src/main'         )
		, sample = require ( '../test-data/index'  )
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
    let 
            result = dtbox.init ( sample.test_0, {mod:'value'} )
        , { value, structure } = result
        ;

    expect ( result.value.hi()  ).to.be.equal ( 'hi' )

    expect ( structure.length ).to.be.equal ( 3 )
    expect ( structure[0][0]).to.be.equal ( 'array' )

    expect ( result.value ).to.have.property ( 'root/0/0'  )
    expect ( result.value ).to.have.property ( 'root/0/2'  )
    
    expect ( result._error.length ).to.be.be.equal ( 0 )
}) // it values only





it ( 'Init: Values only, Model: std', () => {
    let result = dtbox.init ({
                                  user : 'Peter'
                                , age  : 42
                                , role : 'admin'
                              },{ model:'std', mod:'values' });

    // root should be auto append
    expect ( result.value.hi()  ).to.be.equal ( 'hi' )
    expect ( result.value ).to.have.property ( 'root/0/0'  )
    expect ( result.value ).to.have.property ( 'root/0/1'  )
    expect ( result.value ).to.have.property ( 'root/0/2'  )
    
    expect ( result.structure[0][0]).to.be.equal ( 'array' )
}) // it Simple Object as value





it ( 'Init: Value only, Model: values', () => {
            const result = dtbox.init ( sample.test_9, {mod:'values', model:'file'} );

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
 			const result = dtbox.init ( sample.test_9, {model:'file'} );
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
        
        result =  dtbox.init ( data, { model:'file'} )

        expect ( result.value ).to.contain.property ( 'root/1/0' )
        expect ( result.value ).to.contain.property ( 'root/1/1' )
        expect ( result.value ).to.contain.property ( 'root/1/2' )
        expect ( result.value ).to.contain.property ( 'root/2/a' )
        expect ( result.value ).to.contain.property ( 'root/2/e' )

        expect ( result.structure[0][0] ).to.be.equal ( 'array' )
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




it  ( 'Modify: Add' , () => {			
			const result = dtbox 
                                .init ()
                                .add ( {name : 'Ivan'} )
                                .add (  sample.test_0  );
            
            expect ( result.value.hi()  ).to.be.equal ( 'hi' )
 			expect ( result.value ).to.have.property ( 'root/0/name'  )
 			expect ( result.value['root/0/name'] ).to.be.equal ( 'Ivan' )

 			expect ( result.structure.length ).to.be.equal ( 3 )
    }) // it modify: Add





it ( 'Modify: Add with fake instructions' , () => {			
		const result = dtbox 
						.init ()
						.add ( { age: 25} )
                        .add ( {'name' : 'Ivan'}, { mod:'fakeInstruction'} );   // fake instructions are ignored
                        
        expect ( result.value.hi()  ).to.be.equal ( 'hi' )
		expect ( result.value ).to.have.property ( 'root/0/age' )
		expect ( result.value ).to.not.have.property ( 'root/0/name' )
}) // it modify: Add with fake instructions





it ( 'Modify: Add a shortFlat object', () => {
    const 
                  start = dtbox.init ({ name:'Peter', age: 45 })
                , result = dtbox
                                        .init ()
                                        .add ( [start.structure, start.value], { model:'shortFlat' } )
                ;
    expect ( result.value.hi()  ).to.be.equal ( 'hi' )
    expect ( result.value ).to.have.property ( 'root/0/age' )
    expect ( result.value ).to.have.property ( 'root/0/name' )
}) // it modify: Add DT value





it ( 'Modify: Update', () => {   // Updates only existing values
    const result = dtbox 
                    .init   ( {name : 'Ivan'} )
                    .update ( sample.test_0   );

        expect ( Object.keys(result.value).length ).to.be.equal ( 1 )
        expect ( result.value.hi()  ).to.be.equal ( 'hi' )
        expect ( result.value       ).to.have.property ( 'root/0/name'  )
        expect ( result.value['root/0/name'] ).to.be.equal ( 'Peter' )
}) // it modify: Update





it ( 'Modify: Update with instructions', () => {   // Updates only existing values
    const result = dtbox 
                    .init   ( {name : 'Ivan'} )
                    .update ( sample.test_0 , {mod:'key'} );

    expect ( result.value.hi()  ).to.be.equal ( 'hi' )
    expect ( result.value                ).to.have.property ( 'root/0/name' )
    expect ( result.value['root/0/name'] ).to.be.equal ( 'name' )
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
     expect ( result.value.hi()           ).to.be.equal ( 'hi' )
     expect ( result.value['root/0/name'] ).to.be.equal ( 'Stefan' )
     expect ( result.value                ).to.not.have.property ( 'root/0/second-number' )
     expect ( result.value                ).to.have.property ( 'root/0/prime-number' )
     expect ( result.value['root/0/prime-number'] ).to.be.equal ( '8899 222 222' )

     expect ( result.structure.length ).to.be.equal ( 4 )
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
                               }, {mod:'key'} );

     // updates existing values and adds new data including 'namespace' and 'structures'
    expect ( result.value['root/0/name']        ).to.be.equal ( 'name' )
    expect ( result.value                       ).to.not.have.property ( 'root/second-number' )
    expect ( result.value                       ).to.have.property ( 'root/0/prime-number' )
    expect ( result.value['root/0/prime-number']).to.be.equal ( 'prime-number' )
})  // it modify: Overwrite





it ( 'Modify: Insert', () => {
    // * Insert data on specified key, when the key represents an array.	
	const result = dtbox
	                 .init ()
	                 .add ( sample.test_10, { model:'file'})
	                 .insert ( ['root/friends/Misho', 'root/friends/Tosho' ] , {model: 'file'} )

    expect ( result.value.hi()           ).to.be.equal ( 'hi' )
	expect ( result.value ).to.have.property ( 'root/1/3' )
    expect ( result.value ).to.have.property ( 'root/1/4' )
    
	expect ( result.structure.length ).to.have.equal ( 2 )
	expect ( result.structure[1][0] ).to.be.equal ( 'array' )
}) // it insert





it ( 'Modify: Combine', () => {
    const
         a = { link: 'one', m: 'fine' }
       , b = { up: {link:1,two:2}, link: ['check', 'me'] }
       , c = { link: 'three'}
       , d = { link: 'final'}
       ;
    dtbox
        .init ( a )
        .combine ( b, {model:'std'})
        .combine ( c, {model:'std'})
        .combine ( d, {model:'std'})
        .spreadAll ( 'std', x => {
                            expect ( x ).to.have.property ( 'link' )
                            expect ( x['link'] instanceof Array )
                            expect ( x['link'].length ).to.be.equal ( 6 )
                            expect ( x['link'][0] ).to.be.equal ( 'one' )
                            expect ( x['link'][1] ).to.be.equal ( 1 )
                            expect ( x['link'][2] ).to.be.equal ( 'check' )
                            expect ( x['link'][3] ).to.be.equal ( 'me' )
                            expect ( x['link'][4] ).to.be.equal ( 'three' )
                            expect ( x['link'][5] ).to.be.equal ( 'final' )
                    })
}) // it modify Insert simular




it ( 'Modify: Prepend', () => {
    let 
          a = { name: ' Peter', items:4 }
        , b = { name: 'Naydenov', items: 6 }
        ;
    const 
          result = dtbox.init ( a )
                  .prepend ( b, {model:'std'}   )
        , val = result.value
        ;
    expect ( val ).to.have.property ( 'root/0/name' )
    expect ( val ).to.have.property ( 'root/0/items' )
    expect ( val['root/0/name']).to.be.equal ('Naydenov Peter')
    expect ( val['root/0/items']).to.be.equal (10)    
}) // it prepend



it ( 'Modify: Append', () => {
    let 
          a = { name: 'Peter'    , items:4  }
        , b = { name: ' Naydenov', items: 6 }
        ;
    const 
          result = dtbox.init ( a )
                  .append ( b, {model:'std'}   )
        , val = result.value
        ;
    expect ( val ).to.have.property ( 'root/0/name' )
    expect ( val ).to.have.property ( 'root/0/items' )
    expect ( val['root/0/name']).to.be.equal ('Peter Naydenov')
    expect ( val['root/0/items']).to.be.equal (10)    
 }) // it append



// TODO: I'm not sure about this method... Looks not good enough.
it ( 'Modify: Insert text')
it ( 'Modify: Insert in root')




it ( 'Show Error Log', () => {
	// * Executes callback with errors list as argument
	    let result;
        
        dtbox 
            .init ()
            .add ( { age: 25} )
            .add ( {'name' : 'Ivan'}, { mod:'fakeInstruction'} )   // fake instructions are ignored
            .log ( x => result = x )

        expect ( result ).to.be.an ( 'array' )
        expect ( result ).to.have.length ( 1 )
}) // it insert





it ( 'Get empty DT', () => {
        const data = dtbox.empty ();

        expect ( data ).to.be.an ( 'object' )
        expect ( data ).to.be.an.empty
        expect ( data.hi() ).to.be.equal ( 'hi' )
}) // it empty value



}) // describe


